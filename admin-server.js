// 案例管理后台 - 本地服务器
// 使用方法: node admin-server.js
// 然后浏览器打开 http://localhost:3456

import { createServer } from 'node:http';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CASES_DIR = join(__dirname, 'src', 'content', 'cases');
const PORT = 3456;

// 确保目录存在
if (!existsSync(CASES_DIR)) {
  await mkdir(CASES_DIR, { recursive: true });
}

// 读取所有案例
async function listCases() {
  const files = await readdir(CASES_DIR);
  return files.filter(f => f.endsWith('.md'));
}

// MIME types
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  try {
    // API: 列出案例
    if (url.pathname === '/api/cases' && req.method === 'GET') {
      const cases = await listCases();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(cases));
    }

    // API: 创建案例
    if (url.pathname === '/api/cases' && req.method === 'POST') {
      const body = await readBody(req);
      const data = JSON.parse(body);

      const { title, description, sourceUrl, sourcePlatform, spaces, styles, area, location, cover } = data;

      if (!title || !description) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: '标题和描述为必填' }));
      }

      // 生成文件名（日期+标题）
      const today = new Date().toISOString().slice(0, 10);
      const slug = title
        .replace(/[^\w一-鿿]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
        .slice(0, 40) || 'case';
      const filename = `${today}-${slug}.md`;

      // 生成 markdown 内容
      const spacerList = Array.isArray(spaces) ? spaces : (spaces ? [spaces] : []);
      const styleList = Array.isArray(styles) ? styles : (styles ? [styles] : []);

      const publishDate = today;
      const spacerYaml = spacerList.map(s => `  - ${s}`).join('\n');
      const styleYaml = styleList.map(s => `  - ${s}`).join('\n');
      const areaLine = area ? `area: ${area}\n` : '';
      const locationLine = location ? `location: "${location}"\n` : '';
      const coverLine = cover ? `cover: "${cover}"\n` : '';
      const sourceLine = sourceUrl ? `sourceUrl: "${sourceUrl}"\nsourcePlatform: ${sourcePlatform || 'xiaohongshu'}\n` : 'sourcePlatform: original\n';

      const content = `---
title: "${title}"
description: "${description}"
publishDate: ${publishDate}
featured: false
spaces:
${spacerYaml}
styles:
${styleYaml}
${areaLine}${locationLine}${coverLine}${sourceLine}
gallery: []
---

${description}
`;

      await writeFile(join(CASES_DIR, filename), content, 'utf-8');

      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, filename }));
    }

    // API: 删除案例
    if (url.pathname.startsWith('/api/cases/') && req.method === 'DELETE') {
      const filename = decodeURIComponent(url.pathname.split('/api/cases/')[1]);
      const filepath = join(CASES_DIR, filename);
      if (existsSync(filepath)) {
        const { unlink } = await import('node:fs/promises');
        await unlink(filepath);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true }));
      }
      res.writeHead(404);
      return res.end(JSON.stringify({ error: 'Not found' }));
    }

    // 静态文件: admin.html
    if (url.pathname === '/' || url.pathname === '') {
      const html = await readFile(join(__dirname, 'admin.html'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    res.writeHead(404);
    return res.end('Not found');
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500);
    return res.end('Internal server error');
  }
});

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

server.listen(PORT, () => {
  console.log(`\n  🏠 设计案例管理后台\n`);
  console.log(`  打开浏览器: http://localhost:${PORT}\n`);
  console.log(`  添加案例后, 运行: npm run build 或 .\\发布.bat\n`);
});
