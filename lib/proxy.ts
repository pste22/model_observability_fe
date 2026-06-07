import type { NextApiRequest, NextApiResponse } from 'next';

export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * Proxy a request to the FastAPI backend while forwarding the auth cookie in
 * both directions:
 *  - the browser's `Cookie` header is sent upstream so the backend can resolve
 *    the authenticated user, and
 *  - any `Set-Cookie` the backend issues (login/signup/logout) is forwarded
 *    back to the browser so the httpOnly cookie is stored/cleared.
 *
 * No token is ever read or held in client-side JS — it lives only in the
 * httpOnly cookie that travels through here.
 */
export async function proxyToBackend(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<void> {
  const method = init.method || req.method || 'GET';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (req.headers.cookie) {
    headers['Cookie'] = req.headers.cookie;
  }

  try {
    const upstream = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });

    const setCookie = upstream.headers.getSetCookie?.() ?? [];
    if (setCookie.length > 0) {
      res.setHeader('Set-Cookie', setCookie);
    }

    if (upstream.status === 204) {
      res.status(204).end();
      return;
    }

    const text = await upstream.text();
    res.status(upstream.status);
    if (text) {
      res.setHeader('Content-Type', 'application/json');
      res.send(text);
    } else {
      res.end();
    }
  } catch (err) {
    res.status(502).json({ detail: 'Backend unreachable' });
  }
}
