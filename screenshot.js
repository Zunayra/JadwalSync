const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';
const dir = './temporary_screenshots';

// Buat folder otomatis kalau belum ada
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// Bikin auto-increment untuk nama file
const files = fs.readdirSync(dir);
const count = files.length + 1;
const filename = `screenshot-${count}${label}.png`;
const filepath = path.join(dir, filename);

(async () => {
  console.log(`Mengambil screenshot dari ${url}...`);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Resolusi layar diset ke Desktop standar
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`✅ Screenshot berhasil disimpan ke ${filepath}`);
  } catch (err) {
    console.error(`❌ Gagal mengambil screenshot: ${err.message}`);
  } finally {
    await browser.close();
  }
})();