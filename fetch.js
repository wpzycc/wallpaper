const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const UPLOAD_API = 'https://img.wpzy.cc/upload';
const DATA_FILE = 'data.json';
const MAX_IMAGES_PER_CATEGORY = 15; // 每个分类存15张

const categories = {
  "36": "4k", "6": "people", "30": "love", "9": "nature",
  "15": "minimalist", "26": "anime", "11": "fashion", "14": "animals",
  "5": "games", "12": "cars", "10": "fashion", "29": "calendar"
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWallhaven(keyword) {
  try {
    const res = await axios.get(`https://wallhaven.cc/api/v1/search?q=${keyword}&categories=111&purity=100&sorting=random&page=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return res.data.data;
  } catch (e) {
    return [];
  }
}

async function uploadToWpzy(imageUrl) {
  try {
    // 1. 下载图片为二进制流
    const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(imgRes.data, 'binary');

    // 2. 组装 FormData
    const formData = new FormData();
    formData.append('file', buffer, { filename: 'wallpaper.jpg' });

    // 3. 发送给你的图床接口
    const uploadRes = await axios.post(UPLOAD_API, formData, {
      headers: formData.getHeaders()
    });

    // 4. 解析你接口返回的链接（根据你的脚本，返回格式是 { success: true, data: { link: '...' } }）
    if (uploadRes.data && uploadRes.data.success && uploadRes.data.data && uploadRes.data.data.link) {
      const imgurUrl = uploadRes.data.data.link;
      // 替换为你自己图床的代理地址
      return imgurUrl.replace('https://i.imgur.com', 'https://img.wpzy.cc/v2');
    }
    return imageUrl; // 如果失败，兜底用原图
  } catch (e) {
    console.error(`上传失败: ${imageUrl}`, e.message);
    return imageUrl;
  }
}

async function main() {
  let existingData = {};
  if (fs.existsSync(DATA_FILE)) {
    existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }

  let newData = { ...existingData };

  for (const cid in categories) {
    console.log(`处理分类: ${cid}`);
    if (!newData[cid]) newData[cid] = [];

    if (newData[cid].length >= MAX_IMAGES_PER_CATEGORY) {
      console.log(`分类 ${cid} 已满，跳过。`);
      continue;
    }

    const images = await fetchWallhaven(categories[cid]);
    const needCount = MAX_IMAGES_PER_CATEGORY - newData[cid].length;
    const fetchCount = Math.min(needCount, images.length);

    for (let i = 0; i < fetchCount; i++) {
      const img = images[i];
      const isExist = newData[cid].some(item => item.id === img.id);
      if (isExist) continue;

      console.log(`正在上传图片: ${img.path}`);
      const newUrl = await uploadToWpzy(img.path);

      newData[cid].push({
        id: img.id,
        url: newUrl
      });

      // 【关键】每传完一张停 5 秒，绝对不触发你的接口频控
      await sleep(5000);
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
  console.log('全部完成！');
}

main();
