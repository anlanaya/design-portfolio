export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const clientId = 'Ov23li87HPVkywfQf6g7';

    if (url.pathname === '/auth') {
      const redirectUri = url.origin + '/callback';
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'repo,user',
      });
      return Response.redirect('https://github.com/login/oauth/authorize?' + params.toString(), 302);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response('Missing code', { status: 400 });
      }

      try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: env.GH_CLIENT_SECRET,
            code: code,
          }),
        });

        const data = await tokenRes.json();
        const payload = JSON.stringify(data);
        const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><script>' +
          'var d = ' + payload + ';' +
          'if(window.opener){window.opener.postMessage(JSON.stringify(d),"*");}' +
          'document.body.innerHTML="<p>授权成功！窗口即将关闭...</p>";' +
          'setTimeout(function(){window.close();},3000);' +
          '</' + 'script></head><body style="text-align:center;padding:40px;font-family:sans-serif;"></body></html>';

        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      } catch (err) {
        return new Response('Error: ' + err.message, { status: 500 });
      }
    }

    return new Response('OAuth Proxy OK', { status: 200 });
  },
};
