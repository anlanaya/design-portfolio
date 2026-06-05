export async function onRequest(context) {
  const clientId = "Ov23li87HPVkywfQf6g7";
  const url = new URL(context.request.url);
  const redirectUri = url.origin + "/callback";
  const params = [
    "client_id=" + encodeURIComponent(clientId),
    "redirect_uri=" + encodeURIComponent(redirectUri),
    "scope=repo,user"
  ].join("&");
  return Response.redirect("https://github.com/login/oauth/authorize?" + params, 302);
}
