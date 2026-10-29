const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const UPLOAD_API = 'https://img.wpzy.cc/upload';
const DATA_FILE = 'data.json';
const MAX_IMAGES_PER_CATEGORY = 15; 

const categories = {
  "36": "4k", "6": "people", "30": "love", "9": "nature",
  "15": "minimalist", "26": "anime", "11": "fashion", "14": "animals",
  "5": "games", "12": "cars", "10": "fashion", "29": "calendar"
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWallhaven(keyword) {
  try {
    const res = await axios.get(`https://wallhaven.cc/api/v1/search?q=${keyword}&categories=111&purity=100&sorting=random&page=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 15000 
    });
    return res.data.data;
  } catch (e) {
    console.log(`获取 Wallhaven [${keyword}] 失败:`, e.message);
    return [];
  }
}

async function uploadToWpzy(imageUrl) {
  try {
    // 【核心修改1】下载图片时，加上 Referer 伪装
    const imgRes = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://wallhaven.cc/', // 欺骗 Wallhaven 是从官网点进来的
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
      },
      timeout: 20000 
    });
    
    const buffer = Buffer.from(imgRes.data, 'binary');

    const formData = new FormData();
    formData.append('file', buffer, { filename: 'wallpaper.jpg' });

    const uploadRes = await axios.post(UPLOAD_API, formData, {
      headers: {
        ...formData.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://bizhi.wpzy.cc',
        'Referer': 'https://bizhi.wpzy.cc/'
      },
      timeout: 30000 
    });

    if (uploadRes.data && uploadRes.data.success && uploadRes.data.data && uploadRes.data.data.link) {
      const imgurUrl = uploadRes.data.data.link;
      // 如果你的图床直接返回了链接，这里就不替换了；如果之前是因为替换导致裂图，请去掉 .replace
      return imgurUrl.replace('https://i.imgur.com', 'https://img.wpzy.cc/v2');
    }
    return null; 
  } catch (e) {
    console.log(`上传失败: ${imageUrl}, 错误: ${e.message}`);
    return null;
  }
}

async function main() {
  let existingData = {};
  if (fs.existsSync(DATA_FILE)) {
    existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }

  let newData = { ...existingData };

  for (const cid in categories) {
    console.log(`\n=========== 正在处理分类: ${cid} ===========`);
    if (!newData[cid]) newData[cid] = [];

    if (newData[cid].length >= MAX_IMAGES_PER_CATEGORY) {
      console.log(`分类 ${cid} 已满 ${MAX_IMAGES_PER_CATEGORY} 张，跳过。`);
      continue;
    }

    const images = await fetchWallhaven(categories[cid]);
    const needCount = MAX_IMAGES_PER_CATEGORY - newData[cid].length;
    const fetchCount = Math.min(needCount, images.length);

    for (let i = 0; i < fetchCount; i++) {
      const img = images[i];
      const isExist = newData[cid].some(item => item.id === img.id);
      if (isExist) continue;

      console.log(`正在上传第 ${newData[cid].length + 1} 张: ${img.path}`);
      const newUrl = await uploadToWpzy(img.path);

      if (newUrl) {
        newData[cid].push({
          id: img.id,
          url: newUrl
        });
        console.log(`✅ 上传成功: ${newUrl}`);
      } else {
        console.log(`❌ 上传失败，跳过此图`);
      }

      // 【核心修改2】把延迟从 3 秒改成 10 秒，极大降低被 429 的概率
      await sleep(10000); 
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
  console.log('\n🎉 全部完成！已保存到 data.json');
}

main();
