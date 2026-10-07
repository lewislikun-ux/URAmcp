/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Health Check API Endpoint for Vercel Serverless & Local Dev
 * Route: /api/health
 */

export default async function handler(req, res) {
  // Ensure universal response helper compatibility (works across Vercel, Express, and Vite middleware)
  if (!res.status) {
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
  }
  if (!res.json) {
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }

  // CORS Headers for client-side invocation
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const startTime = Date.now();
  const uraKeyPresent = Boolean(process.env.URA_ACCESS_KEY || process.env.URA_API_KEY);
  const uraTokenPresent = Boolean(process.env.URA_TOKEN);
  const oneMapKeyPresent = Boolean(
    (process.env.ONEMAP_EMAIL && process.env.ONEMAP_PASSWORD) || process.env.ONEMAP_ACCESS_TOKEN
  );

  try {
    const memory = process.memoryUsage ? process.memoryUsage() : null;
    const uptime = process.uptime ? Math.floor(process.uptime()) : 0;

    const payload = {
      status: 'UP',
      service: 'SG BTO MOP Valuation Intelligence API',
      timestamp: new Date().toISOString(),
      uptimeSeconds: uptime,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      nodeVersion: process.version || 'unknown',
      memory: memory
        ? {
            heapUsedMB: (memory.heapUsed / 1024 / 1024).toFixed(2),
            heapTotalMB: (memory.heapTotal / 1024 / 1024).toFixed(2),
            rssMB: (memory.rss / 1024 / 1024).toFixed(2),
          }
        : null,
      integrations: {
        ura: {
          configured: uraKeyPresent,
          keySource: process.env.URA_ACCESS_KEY
            ? 'URA_ACCESS_KEY'
            : process.env.URA_API_KEY
            ? 'URA_API_KEY'
            : 'NOT_FOUND',
          tokenCached: uraTokenPresent,
          endpointUrl: 'https://www.ura.gov.sg/uraDataService',
          setupGuide: uraKeyPresent
            ? 'URA API key detected in environment variables.'
            : 'Add URA_ACCESS_KEY under Vercel Settings > Environment Variables or in .env.local',
        },
        oneMap: {
          configured: oneMapKeyPresent,
          provider: 'Singapore Land Authority (SLA)',
          publicTilesActive: true,
          authMode: process.env.ONEMAP_ACCESS_TOKEN
            ? 'STATIC_TOKEN'
            : process.env.ONEMAP_EMAIL
            ? 'EMAIL_CREDENTIALS'
            : 'PUBLIC_TILES_ONLY',
          setupGuide: oneMapKeyPresent
            ? 'OneMap developer credentials active.'
            : 'Add ONEMAP_EMAIL & ONEMAP_PASSWORD or ONEMAP_ACCESS_TOKEN in Vercel to unlock geocoding.',
        },
        hdbResaleDataService: {
          status: 'CONNECTED',
          source: 'Data.gov.sg / HDB Resale Index baseline',
        },
      },
      responseTimeMs: Date.now() - startTime,
    };

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown server error',
      timestamp: new Date().toISOString(),
    });
  }
}
