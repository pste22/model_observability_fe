import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyToBackend } from '../../lib/proxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    await proxyToBackend(req, res, '/projects', { method: 'GET' });
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ detail: 'Method not allowed' });
    return;
  }

  await proxyToBackend(req, res, '/projects/create-from-sandbox', {
    method: 'POST',
    body: req.body,
  });
}
