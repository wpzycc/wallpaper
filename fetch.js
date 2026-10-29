const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const UPLOAD_API = 'https://img.wpzy.cc/upload';
const DATA_FILE = 'data.json';

// 总量限制：150 × 12 = 1800 张
const MAX_IMAGES_PER_CATEGORY = 150; 
// 每天限制：15 × 12 = 180 张
const DAILY_UPDATE_LIMIT = 15; 

const categories = {
  "36": "4k", "6": "people", "30": "love", "9": "nature",
  "15": "minimalist", "26": "anime", "11": "fashion", "14": "animals",
  "5": "games", "12": "cars", "10": "fashion", "29": "calendar"
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// 【修复1】增加重试机制，防止单张图网络抖动导致全盘崩溃
async function uploadToWpzy(imageUrl, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const imgRes = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://wallhaven.cc/'
        },
        timeout: 20000 
      });
      
      const buffer = Buffer.from(imgRes.data, 'binary');
      const formData = new FormData();
      formData.append('file', buffer, { filename: 'wallpaper.jpg' });

      const uploadRes = await axios.post(UPLOAD_API, formData, {
        headers: {
          ...formData.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
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
        } catch (e) {
          return null; 
        }
      }
      return null;
    } catch (e) {
      if (attempt === retries) return null; 
      await sleep(3000); // 失败后等 3 秒重试
    }
  }
}

async function main() {
  let existingData = {};
  if (fs.existsSync(DATA_FILE)) {
    existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }

  let newData = { ...existingData };

  for (const cid in categories) {
    if (!newData[cid]) newData[cid] = [];
    console.log(`\n正在处理分类: ${cid}`);

    // 满了后清理最早的图
    while (newData[cid].length >= MAX_IMAGES_PER_CATEGORY) {
      newData[cid].shift(); 
    }

    let images = [];
    try {
      const res = await axios.get(`https://wallhaven.cc/api/v1/search?q=${categories[cid]}&categories=111&purity=100&sorting=random&page=1`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 20000 
      });
      images = res.data.data;
    } catch (e) {
      console.log(`获取列表失败: ${e.message}`);
      continue;
    }
    
    // 每天严格只更新 15 张
    const fetchCount = Math.min(DAILY_UPDATE_LIMIT, images.length);

    for (let i = 0; i < fetchCount; i++) {
      const img = images[i];
      if (newData[cid].some(item => item.id === img.id)) continue;

      console.log(`正在上传: ${img.path}`);
      const newUrl = await uploadToWpzy(img.path);

      if (newUrl) {
        newData[cid].push({ id: img.id, url: newUrl });
        console.log(`✅ 成功: ${newUrl}`);
      } else {
        console.log(`❌ 失败，跳过`);
      }
      
      // 【绝对保证 10 秒】
      await sleep(10000); 
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
  console.log('\n🎉 全部完成！已保存到 data.json');
}

main();
