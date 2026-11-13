const fs = require('fs');
const path = require('path');
const https = require('https');

const urls = [
  "https://www.instagram.com/reel/Dblk-_3Cu-8/",
  "https://www.instagram.com/reel/DbZEWx0i5G2/",
  "https://www.instagram.com/reel/DbT2MTgis6h/",
  "https://www.instagram.com/reel/DbLufEOCjOG/",
  "https://www.instagram.com/reel/DbHSZtai8p0/",
  "https://www.instagram.com/reel/DaHUma4iEIc/"
];

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const file = fs.createWriteStream(filename);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  for (let i = 0; i < urls.length; i++) {
    console.log(`Fetching ${urls[i]}...`);
    try {
      const html = await fetchUrl(urls[i]);
      const match = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (match && match[1]) {
        let imgUrl = match[1].replace(/&amp;/g, '&');
        const filename = path.join(__dirname, 'public', 'img', `ig${i+1}.jpg`);
        console.log(`Downloading ${imgUrl} to ${filename}...`);
        await downloadImage(imgUrl, filename);
        console.log(`Saved ig${i+1}.jpg`);
      } else {
        console.log(`No og:image found for ${urls[i]}`);
      }
    } catch (e) {
      console.error(`Error on ${urls[i]}: ${e.message}`);
    }
    // sleep a bit to avoid rate limits
    await new Promise(r => setTimeout(r, 1000));
  }
}

run();
