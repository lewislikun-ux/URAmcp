/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Singapore Land Authority (SLA) OneMap API Proxy & Token Handler
 * Route: /api/onemap
 */

export default async function handler(req, res) {
  // Ensure universal response helper compatibility
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

  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const email = process.env.ONEMAP_EMAIL;
  const password = process.env.ONEMAP_PASSWORD;
  const staticToken = process.env.ONEMAP_ACCESS_TOKEN;

  const action = req.query?.action || (req.body && req.body.action) || 'status';
  const query = req.query?.q || (req.body && req.body.q) || 'Singapore';

  try {
    // 1. Status / Config Check
    if (action === 'status') {
      const configured = Boolean((email && password) || staticToken);
      return res.status(200).json({
        success: true,
        configured,
        authMode: staticToken ? 'STATIC_TOKEN' : email ? 'EMAIL_CREDENTIALS' : 'NONE',
        tileLayers: {
          default: 'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png',
          grey: 'https://www.onemap.gov.sg/maps/tiles/Grey/{z}/{x}/{y}.png',
          night: 'https://www.onemap.gov.sg/maps/tiles/Night/{z}/{x}/{y}.png',
          original: 'https://www.onemap.gov.sg/maps/tiles/Original/{z}/{x}/{y}.png',
        },
        message: configured
          ? 'OneMap API credentials configured.'
          : 'OneMap public tiles are active. To enable advanced spatial searches and reverse geocoding, configure ONEMAP_EMAIL & ONEMAP_PASSWORD in Vercel.',
        docsUrl: 'https://www.onemap.gov.sg/apidocs/',
      });
    }

    // 2. Token Generation
    if (action === 'token') {
      if (staticToken) {
        return res.status(200).json({
          success: true,
          access_token: staticToken,
          source: 'ONEMAP_ACCESS_TOKEN',
        });
      }

      if (!email || !password) {
        return res.status(200).json({
          success: false,
          warning: 'ONEMAP_EMAIL or ONEMAP_PASSWORD not configured.',
          instructions: 'Register at https://www.onemap.gov.sg/apidocs/ and add ONEMAP_EMAIL and ONEMAP_PASSWORD in Vercel Environment Variables.',
        });
      }

      const tokenRes = await fetch('https://www.onemap.gov.sg/api/auth/post/getToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        return res.status(tokenRes.status).json({
          success: false,
          error: `OneMap token authentication failed (${tokenRes.status})`,
          details: errorText,
        });
      }

      const tokenData = await tokenRes.json();
      return res.status(200).json({
        success: true,
        access_token: tokenData.access_token,
        expiry_timestamp: tokenData.expiry_timestamp,
      });
    }

    // 3. Elastic Search Geocoder
    if (action === 'search') {
      const searchUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
        query
      )}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
      
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) {
        return res.status(searchRes.status).json({
          success: false,
          error: `OneMap search failed with status ${searchRes.status}`,
        });
      }

      const searchData = await searchRes.json();
      return res.status(200).json({
        success: true,
        results: searchData.results || [],
        found: searchData.found || 0,
      });
    }

    return res.status(400).json({
      success: false,
      error: `Unknown action: ${action}. Supported actions: status, token, search`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown OneMap API error',
    });
  }
}
