import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  const project = (Array.isArray(projectId) ? projectId[0] : projectId) || 'prj_invoice_demo';

  try {
    const upstream = await fetch(
      `${BACKEND_URL}/projects/${encodeURIComponent(project)}/evaluations`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ detail: 'Backend unreachable' });
  }
}
