const PROXY_CONFIG = {
  "/api/*": {
    "target": "http://localhost:5150",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "timeout": 30000,
    "onProxyReq": function(proxyReq, req, res) {
      console.log(`[PROXY] ${req.method} ${req.url} -> http://localhost:5150${req.url}`);
      
      // Ensure proper headers
      proxyReq.setHeader('Accept', 'application/json');
      if (req.method === 'POST' || req.method === 'PUT') {
        proxyReq.setHeader('Content-Type', 'application/json');
      }
    },
    "onProxyRes": function(proxyRes, req, res) {
      console.log(`[PROXY] Response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
      
      // Log response headers for debugging
      console.log('[PROXY] Response headers:', proxyRes.headers);
      
      // Prevent caching of API responses
      proxyRes.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      proxyRes.headers['Pragma'] = 'no-cache';
      proxyRes.headers['Expires'] = '0';
    },
    "onError": function(err, req, res) {
      console.error(`[PROXY] Error for ${req.method} ${req.url}:`, err.message);
    }
  },
  "/swagger/*": {
    "target": "http://localhost:5150",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
};

module.exports = PROXY_CONFIG;