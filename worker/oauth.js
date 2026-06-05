// OAuth 代理 Worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const clientId = 'Ov23li87HPVkywfQf6g7';

    // GET /auth → 重定向到 GitHub
    if (url.pathname === '/auth') {
      const redirectUri = url.origin + '/callback';
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'repo,user',
      });
      return Response.redirect('https://github.com/login/oauth/authorize?' + params, 302);
    }

    // GET /callback → 交换 token
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: env.GH_CLIENT_SECRET,
            code,
          }),
        });
        const data = await tokenRes.json();

        const html = `<!DOCTYPE html><html><head><script>
          if (window.opener) {
            window.opener.postMessage(${JSON.stringify(JSON.stringify(data))}, '*');
          }
          document.body.textContent = '授权成功，三秒后自动关闭...';
          setTimeout(function(){ window.close(); }, 3000);
        <\/script></head><body style="text-align:center;padding-top:40px;font-family:sans-serif;">
          <p>授权成功！窗口即将关闭。</p>
          <p>如果没有自动关闭，请手动关闭此窗口。</p>
        </body></html>`;

        return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      } catch (err) {
        return new Response('Token exchange error: ' + err.message, { status: 500 });
      }
    }

    return new Response('OK', { status: 200 });
  }
};
