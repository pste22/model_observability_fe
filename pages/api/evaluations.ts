import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const upstream = await fetch(
      `${BACKEND_URL}/projects/prj_invoice_demo/evaluations`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ detail: 'Backend unreachable' });
  }
}
