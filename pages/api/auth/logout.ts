import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyToBackend } from '../../../lib/proxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ detail: 'Method not allowed' });
    return;
  }
  await proxyToBackend(req, res, '/auth/logout', { method: 'POST' });
}
