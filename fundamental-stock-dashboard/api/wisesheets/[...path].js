const API_ORIGIN = "https://api.wisesheets.io";

function appendQuery(searchParams, query) {
  for (const [key, value] of Object.entries(query ?? {})) {
    if (key === "path" || value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) searchParams.append(key, String(item));
      continue;
    }
    searchParams.set(key, String(value));
  }
}

export default async function handler(req, res) {
  const rawPath = req.query?.path;
  const path = Array.isArray(rawPath) ? rawPath.join("/") : rawPath ?? "";
  const upstreamUrl = new URL(`/v1-placeholder`, API_ORIGIN);
  upstreamUrl.pathname = `/${path}`;
  upstreamUrl.search = "";
  appendQuery(upstreamUrl.searchParams, req.query);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers ?? {})) {
    if (!value) continue;
    headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }

  headers.delete("host");
  headers.delete("content-length");

  if (process.env.WISESHEETS_API_KEY) {
    headers.set("authorization", `Bearer ${process.env.WISESHEETS_API_KEY}`);
  }

  const requestInit = {
    method: req.method,
    headers,
  };

  if (req.method && !["GET", "HEAD"].includes(req.method) && req.body !== undefined) {
    requestInit.body =
      typeof req.body === "string" || Buffer.isBuffer(req.body)
        ? req.body
        : JSON.stringify(req.body);
  }

  const upstreamResponse = await fetch(upstreamUrl, requestInit);

  res.status(upstreamResponse.status);
  upstreamResponse.headers.forEach((value, key) => {
    if (["content-length", "content-encoding", "transfer-encoding"].includes(key.toLowerCase())) return;
    res.setHeader(key, value);
  });

  const body = Buffer.from(await upstreamResponse.arrayBuffer());
  res.send(body);
}
