// 简易 OAuth 代理 Worker
// 部署后把 Worker URL 填入 Decap CMS 的 base_url

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // GET /auth → 重定向到 GitHub
    if (url.pathname === '/auth') {
      const clientId = 'Ov23li87HPVkywfQf6g7';
      const redirectUri = url.origin + '/callback';
      const scope = 'repo,user';
      const ghUrl = 'https://github.com/login/oauth/authorize?' +
        new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, scope });
      return Response.redirect(ghUrl, 302);
    }

    // GET /callback → GitHub 回调，交换 token
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          client_id: 'Ov23li87HPVkywfQf6g7',
          client_secret: '6b7619d9c912bda02919dd70246fe28bea7c41f8',
          code,
        }),
      });
      const tokenData = await tokenRes.json();

      const html = `<!DOCTYPE html><html><head><script>
        if (window.opener) {
          window.opener.postMessage(${JSON.stringify(tokenData)}, '*');
        } else {
          document.body.textContent = '已授权，请关闭此窗口';
        }
        setTimeout(function(){ window.close(); }, 1000);
      <\/script></head><body>授权成功，窗口即将关闭...</body></html>`;

      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    return new Response('OAuth Proxy', { status: 200 });
  }
};
