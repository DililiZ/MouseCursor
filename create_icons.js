const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 创建images目录
if (!fs.existsSync('images')) {
  fs.mkdirSync('images');
}

// 创建一个更精致的光标图标SVG
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4285f4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#34a853;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M6 2l0 24 6-6 4 10 4-2-4-8 6 0z" 
    fill="url(#grad)"
    stroke="#ffffff"
    stroke-width="1"
  />
</svg>
`;

// 保存SVG文件
fs.writeFileSync('cursor.svg', svgIcon);

// 生成不同尺寸的PNG
const sizes = [16, 48, 128];

async function generateIcons() {
  for (const size of sizes) {
    await sharp('cursor.svg')
      .resize(size, size)
      .png()
      .toFile(`images/icon${size}.png`);
  }
  // 删除临时SVG文件
  fs.unlinkSync('cursor.svg');
  console.log('图标生成完成!');
}

generateIcons().catch(console.error);