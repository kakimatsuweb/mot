// Serve static files like GitHub Pages: keep .html URLs as-is,
// map /dir/ to /dir/index.html, and /page to /page.html.
// Also send charset=utf-8 (the pages have no <meta charset>).
async function serve(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.endsWith("/")) {
    url.pathname = path + "index.html";
    return env.ASSETS.fetch(new Request(url, request));
  }

  let res = await env.ASSETS.fetch(request);
  if (res.status !== 404 || /\.[^/]+$/.test(path)) return res;

  url.pathname = path + ".html";
  res = await env.ASSETS.fetch(new Request(url, request));
  if (res.status !== 404) return res;

  url.pathname = path + "/index.html";
  res = await env.ASSETS.fetch(new Request(url, request));
  if (res.status !== 404) return Response.redirect(request.url + "/", 301);

  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    const res = await serve(request, env);
    const type = res.headers.get("Content-Type") || "";
    if (/^text\/(html|css|plain|xml)|application\/xml/i.test(type) && !/charset/i.test(type)) {
      const out = new Response(res.body, res);
      out.headers.set("Content-Type", type + "; charset=utf-8");
      return out;
    }
    return res;
  },
};
