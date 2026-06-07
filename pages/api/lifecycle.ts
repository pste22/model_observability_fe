import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyToBackend } from '../../lib/proxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await proxyToBackend(req, res, '/models/lifecycle', { method: 'GET' });
}
