import type { NextApiRequest, NextApiResponse } from 'next';
import { proxyToBackend } from '../../lib/proxy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  const project = (Array.isArray(projectId) ? projectId[0] : projectId) || 'prj_invoice_demo';

  await proxyToBackend(
    req,
    res,
    `/projects/${encodeURIComponent(project)}/evaluations`,
    { method: 'GET' }
  );
}
