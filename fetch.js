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

    // 判断接口返回的格式
    if (uploadRes.data && uploadRes.data.success && uploadRes.data.data && uploadRes.data.data.link) {
      let finalUrl = uploadRes.data.data.link;
      // 根据你的图床规则，替换为真实代理路径
      if (finalUrl.includes('i.imgur.com')) {
          finalUrl = finalUrl.replace('https://i.imgur.com', 'https://img.wpzy.cc/v2');
      }
      
      // 【核心新增】强制校验真实链接是否能访问，防止假链接混入
      try {
        await axios.head(finalUrl, { timeout: 5000 });
        return finalUrl; // 校验通过，返回真实链接
      } catch (verifyError) {
        console.log(`❌ 链接校验失败(不存在): ${finalUrl}`);
        return null; // 校验不通过，直接抛弃
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

    if (newData[cid].length >= MAX_IMAGES_PER_CATEGORY) {
      console.log(`分类 ${cid} 已满 ${MAX_IMAGES_PER_CATEGORY} 张，跳过。`);
      continue;
    }

    const images = await fetchWallhaven(categories[cid]);
    const needCount = MAX_IMAGES_PER_CATEGORY - newData[cid].length;
    const fetchCount = Math.min(needCount, images.length);

    for (let i = 0; i < fetchCount; i++) {
      const img = images[i];
      
      // 检查 ID 是否已存在（去重）
      if (newData[cid].some(item => item.id === img.id)) continue;

      console.log(`正在上传: ${img.path}`);
      const newUrl = await uploadToWpzy(img.path);

      // 只有真实有效的链接才会被存进去
      if (newUrl) {
        newData[cid].push({
          id: img.id,
          url: newUrl
        });
        console.log(`✅ 校验成功，已保存: ${newUrl}`);
      } else {
        console.log(`❌ 上传或校验失败，跳过此图`);
      }

      // 强制休息 10 秒防封禁
      await sleep(10000); 
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
  console.log('\n🎉 全部完成！已保存到 data.json');
}

main();
