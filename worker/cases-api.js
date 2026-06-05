// Cloudflare Worker - 案例 API
// 部署步骤：
// 1. Cloudflare → Workers & Pages → 创建 → 创建 Worker
// 2. 粘贴此代码
// 3. 创建 KV 命名空间 → 绑定为 CASES_KV
// 4. 部署

const PASSWORD = 'sheji2026';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // GET: 列出所有案例
    if (request.method === 'GET') {
      const list = await env.CASES_KV.list({ prefix: 'case:' });
      const cases = [];
      for (const key of list.keys) {
        const data = await env.CASES_KV.get(key.name, 'json');
        if (data) cases.push({ id: key.name.replace('case:', ''), ...data });
      }
      cases.sort((a, b) => (b.publishDate || '').localeCompare(a.publishDate || ''));
      return new Response(JSON.stringify(cases), { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } });
    }

    // POST: 添加案例
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        const { title, description, spaces, styles, area, location, cover, sourceUrl, sourcePlatform, password } = body;

        if (password !== PASSWORD) {
          return new Response(JSON.stringify({ error: '密码错误' }), { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } });
        }

        if (!title || !description) {
          return new Response(JSON.stringify({ error: '标题和描述为必填' }), { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } });
        }

        const today = new Date().toISOString().slice(0, 10);
        const slug = title.replace(/[^\w一-鿿]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'case';
        const id = `${today}-${slug}`;

        const caseData = {
          title, description,
          spaces: Array.isArray(spaces) ? spaces : (spaces ? [spaces] : []),
          styles: Array.isArray(styles) ? styles : (styles ? [styles] : []),
          area: area || null,
          location: location || null,
          cover: cover || null,
          sourceUrl: sourceUrl || null,
          sourcePlatform: sourcePlatform || 'xiaohongshu',
          publishDate: today,
          createdAt: new Date().toISOString(),
        };

        await env.CASES_KV.put(`case:${id}`, JSON.stringify(caseData));
        return new Response(JSON.stringify({ success: true, id, case: caseData }), { status: 201, headers: { ...headers, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } });
      }
    }

    // DELETE: 删除案例
    if (request.method === 'DELETE') {
      try {
        const body = await request.json();
        const { id, password } = body;
        if (password !== PASSWORD) {
          return new Response(JSON.stringify({ error: '密码错误' }), { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } });
        }
        await env.CASES_KV.delete(`case:${id}`);
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...headers, 'Content-Type': 'application/json' } });
  },
};
