const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const UPLOAD_API = 'https://img.wpzy.cc/upload';
const DATA_FILE = 'data.json';
// 【核心修改】每个分类限制存 150 张图（12个分类 x 150 = 1800张）
const MAX_IMAGES_PER_CATEGORY = 150; 

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
    const imgRes = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://wallhaven.cc/',
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
      let finalUrl = uploadRes.data.data.link;
      if (finalUrl.includes('i.imgur.com')) {
          finalUrl = finalUrl.replace('https://i.imgur.com', 'https://img.wpzy.cc/v2');
      }
      
      try {
        await axios.head(finalUrl, { timeout: 5000 });
        return finalUrl; 
      } catch (verifyError) {
        console.log(`❌ 链接校验失败(不存在): ${finalUrl}`);
        return null; 
      }
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

    // 【核心修改】如果满了，就删掉最老的数据（队列头部）
    while (newData[cid].length >= MAX_IMAGES_PER_CATEGORY) {
      const removed = newData[cid].shift(); // 移除并获取第一条（最老的）
      console.log(`分类 ${cid} 已满 ${MAX_IMAGES_PER_CATEGORY} 张，清理最老数据: ${removed.id}`);
    }

    const images = await fetchWallhaven(categories[cid]);
    const needCount = MAX_IMAGES_PER_CATEGORY - newData[cid].length;
    const fetchCount = Math.min(needCount, images.length);

    for (let i = 0; i < fetchCount; i++) {
      const img = images[i];
      
      if (newData[cid].some(item => item.id === img.id)) continue;

      console.log(`正在上传: ${img.path}`);
      const newUrl = await uploadToWpzy(img.path);

      if (newUrl) {
        newData[cid].push({
          id: img.id,
          url: newUrl
        });
        console.log(`✅ 校验成功，已保存: ${newUrl}`);
      } else {
        console.log(`❌ 上传或校验失败，跳过此图`);
      }

      await sleep(10000); 
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
  console.log('\n🎉 全部完成！已保存到 data.json');
}

main();
