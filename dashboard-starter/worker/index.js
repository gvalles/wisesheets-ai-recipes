const htmlHeaders = {
  "content-type": "text/html; charset=utf-8",
};

const apiBaseUrl = "https://api.wisesheets.io";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/wisesheets/")) {
      const upstreamUrl = new URL(url);
      upstreamUrl.protocol = "https:";
      upstreamUrl.hostname = "api.wisesheets.io";
      upstreamUrl.pathname = url.pathname.replace(/^\/api\/wisesheets/, "");

      const upstreamRequest = new Request(upstreamUrl, request);
      if (env.WISESHEETS_API_KEY) {
        upstreamRequest.headers.set("authorization", `Bearer ${env.WISESHEETS_API_KEY}`);
      }
      upstreamRequest.headers.set("host", new URL(apiBaseUrl).host);

      return fetch(upstreamRequest);
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const accept = request.headers.get("accept") || "";
    if (!accept.includes("text/html")) return response;

    const fallback = await env.ASSETS.fetch(new Request(new URL("/index.html", url), request));
    return new Response(fallback.body, {
      status: fallback.status,
      headers: fallback.headers.get("content-type") ? fallback.headers : htmlHeaders,
    });
  },
};
