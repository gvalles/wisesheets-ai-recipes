const API_BASE = 'https://api.wisesheets.io/v1';

const ALLOWED_PATHS = new Map([
  ['/financials', '/financials/'],
  ['/financials/', '/financials/'],
  ['/prices/eod', '/prices/eod'],
  ['/companies', '/companies/'],
  ['/companies/', '/companies/']
]);

function getRequestedPath(url) {
  const rewritePath = url.searchParams.get('path');
  if (rewritePath) return '/' + rewritePath.replace(/^\/+/, '');
  return url.pathname.replace(/^\/api\/proxy/, '') || '/';
}

function normalizeUpstreamPath(pathname) {
  return ALLOWED_PATHS.get(pathname);
}

function writeJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Cache-Control', 'no-store');
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    writeJson(res, 405, { error: 'Method not allowed. Use GET.' });
    return;
  }

  const apiKey = process.env.WISESHEETS_API_KEY;
  if (!apiKey) {
    writeJson(res, 500, { error: 'Missing WISESHEETS_API_KEY environment variable.' });
    return;
  }

  const inboundUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const upstreamPath = getRequestedPath(inboundUrl);
  const normalizedPath = normalizeUpstreamPath(upstreamPath);
  if (!normalizedPath) {
    writeJson(res, 404, { error: 'Unknown proxy endpoint.' });
    return;
  }

  const upstreamUrl = new URL(API_BASE + normalizedPath);
  inboundUrl.searchParams.delete('path');
  upstreamUrl.search = inboundUrl.searchParams.toString();

  try {
    const upstreamResp = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json'
      }
    });

    const text = await upstreamResp.text();
    res.statusCode = upstreamResp.status;
    res.setHeader('Content-Type', upstreamResp.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(text);
  } catch (error) {
    writeJson(res, 502, { error: error.message || 'Upstream request failed.' });
  }
}
