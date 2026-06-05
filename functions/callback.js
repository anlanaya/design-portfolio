export async function onRequest(context) {
  const url = new URL(context.request.url);
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
      client_id: "Ov23li87HPVkywfQf6g7",
      client_secret: context.env.GH_CLIENT_SECRET,
      code: code
    })
  });

  const ghData = await tokenRes.json();

  // Decap CMS 期望的格式：{ token: "..." }
  const token = ghData.access_token || ghData.token || "";
  if (!token) {
    return new Response("GitHub returned: " + JSON.stringify(ghData), { status: 500, headers: { "Content-Type": "text/plain" } });
  }

  const payload = JSON.stringify({ token: token, provider: "github" });

  const html = [
    "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><script>",
    "try{",
    "window.opener&&window.opener.postMessage(" + payload + ",\"*\");",
    "document.body.innerHTML='<h2>授权成功</h2><p>关闭此窗口即可</p>';",
    "setTimeout(function(){window.close()},3000);",
    "}catch(e){document.body.innerHTML='<p>Error: '+e.message+'</p>';}",
    "</" + "script></head><body style=\"text-align:center;padding:60px;font-family:sans-serif;\">",
    "<p>授权中...</p></body></html>"
  ].join("");

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
