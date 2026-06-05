export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const clientId = "Ov23li87HPVkywfQf6g7";

      if (url.pathname === "/auth") {
        const redirectUri = url.origin + "/callback";
        const params = [
          "client_id=" + encodeURIComponent(clientId),
          "redirect_uri=" + encodeURIComponent(redirectUri),
          "scope=repo,user"
        ].join("&");
        return Response.redirect("https://github.com/login/oauth/authorize?" + params, 302);
      }

      if (url.pathname === "/callback") {
        const code = url.searchParams.get("code");
        if (!code) {
          return new Response("Missing code", { status: 400 });
        }

        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: env.GH_CLIENT_SECRET,
            code: code
          })
        });

        const data = await tokenRes.json();
        const jsonStr = JSON.stringify(data);

        const html = [
          "<!DOCTYPE html>",
          "<html>",
          "<head><meta charset=\"utf-8\">",
          "<script>",
          "try {",
          "  var token = " + jsonStr + ";",
          "  if (window.opener && window.opener !== window) {",
          "    window.opener.postMessage(JSON.stringify(token), \"*\");",
          "  }",
          "  document.body.innerHTML = '<h2>授权成功</h2><p>窗口即将关闭...</p>';",
          "  setTimeout(function() { window.close(); }, 3000);",
          "} catch(e) {",
          "  document.body.innerHTML = '<p>Error: ' + e.message + '</p>';",
          "}",
          "</" + "script>",
          "</head>",
          "<body style=\"text-align:center;padding:60px;font-family:sans-serif;\">",
          "<p>授权中...</p>",
          "</body>",
          "</html>"
        ].join("\n");

        return new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }

      return new Response("OAuth Proxy Ready", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    } catch (err) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  }
};
