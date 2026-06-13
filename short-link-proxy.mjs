import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {readonly string[]} */
export const RESERVED_SHORT_LINK_SLUGS = JSON.parse(
  readFileSync(join(__dirname, 'src/app/config/reserved-slugs.json'), 'utf8')
);

export const SHORT_CODE_PATTERN = /^[a-z0-9]{4,32}$/;

/** @param {string} slug */
export function isReservedShortLinkSlug(slug) {
  return RESERVED_SHORT_LINK_SLUGS.includes(slug);
}

/** @param {string} slug */
export function isShortLinkSlug(slug) {
  return SHORT_CODE_PATTERN.test(slug) && !isReservedShortLinkSlug(slug);
}

/** @param {string} pathname */
export function parseShortCodeFromPath(pathname) {
  const match = pathname.match(/^\/([a-z0-9]{4,32})$/);
  if (!match) return null;
  const code = match[1];
  return isShortLinkSlug(code) ? code : null;
}

export function linkNotFoundHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Link not found — Links.BlackCollar.io</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
      background: #0b0b0c;
      color: #fafafa;
      padding: 1.5rem;
    }
    .card { max-width: 28rem; text-align: center; }
    h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
    p { color: #a1a1aa; margin-bottom: 1.5rem; line-height: 1.5; }
    a { color: #fafafa; text-underline-offset: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Link not found</h1>
    <p>This short link does not exist or may have been removed.</p>
    <a href="/">Go to Links.BlackCollar.io</a>
  </div>
</body>
</html>`;
}

/**
 * @param {object} options
 * @param {string} options.apiUrl
 * @param {string} options.shortCode
 * @param {string} [options.query]
 * @param {string} [options.method]
 * @param {import('http').IncomingHttpHeaders} options.headers
 * @param {typeof fetch} [options.fetchImpl]
 */
export async function fetchShortLinkRedirect({ apiUrl, shortCode, query = '', method = 'GET', headers, fetchImpl = fetch }) {
  const base = apiUrl.replace(/\/$/, '');
  const url = `${base}/${shortCode}${query}`;

  /** @type {Record<string, string>} */
  const forwardHeaders = {};
  const xff = headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff) forwardHeaders['X-Forwarded-For'] = xff;
  const ua = headers['user-agent'];
  if (typeof ua === 'string' && ua) forwardHeaders['User-Agent'] = ua;
  const referer = headers['referer'];
  if (typeof referer === 'string' && referer) forwardHeaders['Referer'] = referer;

  return fetchImpl(url, {
    method,
    redirect: 'manual',
    headers: forwardHeaders,
  });
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @param {object} options
 * @param {string} options.apiUrl
 * @param {typeof fetch} [options.fetchImpl]
 */
export async function handleShortLinkProxy(req, res, { apiUrl, fetchImpl = fetch }) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const shortCode = parseShortCodeFromPath(url.pathname);
  if (!shortCode) return false;

  const query = url.search || '';
  const method = req.method === 'HEAD' ? 'HEAD' : 'GET';

  try {
    const apiResponse = await fetchShortLinkRedirect({
      apiUrl,
      shortCode,
      query,
      method,
      headers: req.headers,
      fetchImpl,
    });

    if (apiResponse.status === 302 || apiResponse.status === 301) {
      const location = apiResponse.headers.get('location');
      if (location) {
        res.writeHead(apiResponse.status, { Location: location });
        res.end();
        return true;
      }
    }

    if (apiResponse.status === 404) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      if (method === 'HEAD') {
        res.end();
      } else {
        res.end(linkNotFoundHtml());
      }
      return true;
    }

    res.writeHead(apiResponse.status, { 'Content-Type': 'text/plain; charset=utf-8' });
    if (method === 'HEAD') {
      res.end();
    } else {
      res.end('Unable to redirect this link.');
    }
    return true;
  } catch {
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Short link service unavailable.');
    return true;
  }
}
