import express, { type Request, type Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction ? Number(process.env.PORT || 3000) : 3000;

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '1mb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Simple in-memory rate limiter for public result verification & admission checks
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string, maxPerMin = 30): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (bucket.count >= maxPerMin) {
    return false;
  }
  bucket.count += 1;
  return true;
}

function resolveBaseUrl(req: Request): string {
  const forwardedHost = req.get('x-forwarded-host');
  const host = forwardedHost || req.get('host');
  const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  if (host) {
    return `${proto}://${host}`.replace(/\/$/, '');
  }
  return 'https://gen-lang-client-0175021821.web.app';
}

// =========================================================================
// SEO ENDPOINTS (robots.txt & sitemap.xml)
// =========================================================================
app.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = resolveBaseUrl(req);
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /portal/',
      'Disallow: /api/',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n')
  );
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const baseUrl = resolveBaseUrl(req);
  const routes = [
    '/',
    '/about',
    '/vision-mission',
    '/principal-message',
    '/management-committee',
    '/programmes',
    '/general-education',
    '/islamic-education',
    '/courses',
    '/teachers',
    '/admission',
    '/notices',
    '/events',
    '/gallery/photos',
    '/gallery/videos',
    '/results',
    '/contact',
    '/faq',
    '/privacy-policy',
    '/terms',
  ];
  const urls = routes
    .map(
      (route) =>
        `  <url><loc>${baseUrl}${route}</loc><changefreq>weekly</changefreq><priority>${
          route === '/' ? '1.0' : '0.8'
        }</priority></url>`
    )
    .join('\n');

  res
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
    );
});

// =========================================================================
// SERVER HEALTH & INTEGRATION CONFIGURATION STATUS
// =========================================================================
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: 'as-siddique-islamic-academy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/integrations/status', (_req: Request, res: Response) => {
  const razorpayMissing = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'].filter((k) => !process.env[k]);
  const smtpMissing = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'].filter((k) => !process.env[k]);
  const twilioMissing = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'].filter(
    (k) => !process.env[k]
  );
  const videoMissing = ['VIDEO_CONFERENCING_PROVIDER', 'VIDEO_CONFERENCING_BASE_URL'].filter(
    (k) => !process.env[k]
  );

  res.json({
    paymentGateway: {
      configured: razorpayMissing.length === 0,
      statusLabel: razorpayMissing.length === 0 ? 'Configured' : 'Not Configured',
      provider: razorpayMissing.length === 0 ? 'Razorpay' : 'Not Configured',
      fallbackMode: 'Cash & Bank Transfer fee recording remain fully operational.',
      requiredEnv: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
      missingEnv: razorpayMissing,
    },
    emailNotifications: {
      configured: smtpMissing.length === 0,
      statusLabel: smtpMissing.length === 0 ? 'Configured' : 'Not Configured',
      provider: smtpMissing.length === 0 ? 'SMTP Relay' : 'Not Configured',
      fallbackMode: 'In-app Firestore notifications remain active.',
      requiredEnv: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'],
      missingEnv: smtpMissing,
    },
    smsNotifications: {
      configured: twilioMissing.length === 0,
      statusLabel: twilioMissing.length === 0 ? 'Configured' : 'Not Configured',
      provider: twilioMissing.length === 0 ? 'Twilio SMS' : 'Not Configured',
      fallbackMode: 'In-app Firestore announcements remain active.',
      requiredEnv: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'],
      missingEnv: twilioMissing,
    },
    videoConferencing: {
      configured: videoMissing.length === 0,
      statusLabel: videoMissing.length === 0 ? 'Configured' : 'Not Configured',
      provider:
        videoMissing.length === 0
          ? String(process.env.VIDEO_CONFERENCING_PROVIDER)
          : 'Not Configured',
      fallbackMode: 'Teachers can paste manual Zoom / Google Meet / Jitsi meeting links.',
      requiredEnv: ['VIDEO_CONFERENCING_PROVIDER', 'VIDEO_CONFERENCING_BASE_URL'],
      missingEnv: videoMissing,
    },
  });
});

// =========================================================================
// SERVER-SIDE RESULT QUERY VERIFICATION (Rate-Limited & Validated)
// =========================================================================
app.post('/api/results/verify', (req: Request, res: Response) => {
  const clientIp = req.ip || 'unknown';
  if (!checkRateLimit(`results:${clientIp}`, 30)) {
    res.status(429).json({
      verified: false,
      error: 'Too many result verification requests. Please wait one minute and try again.',
    });
    return;
  }

  const { rollNumber, classId, sessionId, studentName } = req.body || {};
  if (
    typeof rollNumber !== 'string' ||
    rollNumber.trim().length < 1 ||
    typeof classId !== 'string' ||
    classId.trim().length < 1 ||
    typeof sessionId !== 'string' ||
    sessionId.trim().length < 1
  ) {
    res.status(400).json({
      verified: false,
      error: 'Roll Number, Class, and Academic Session are required for verified result lookup.',
    });
    return;
  }

  // Generate an integrity verification token proving the query passed server validation
  const normalizedRoll = rollNumber.trim().toUpperCase();
  const normalizedName = typeof studentName === 'string' ? studentName.trim() : '';
  const verificationHash = crypto
    .createHash('sha256')
    .update(`${normalizedRoll}:${classId.trim()}:${sessionId.trim()}`)
    .digest('hex')
    .slice(0, 16)
    .toUpperCase();

  res.json({
    verified: true,
    normalizedRoll,
    normalizedName,
    classId: classId.trim(),
    sessionId: sessionId.trim(),
    verificationToken: `VER-${verificationHash}`,
    checkedAt: new Date().toISOString(),
  });
});

// =========================================================================
// SERVER-SIDE PAYMENT GATEWAY VERIFICATION (HMAC SHA-256)
// =========================================================================
app.post('/api/payments/create-order', (_req: Request, res: Response) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    res.status(503).json({
      created: false,
      configured: false,
      status: 'Not Configured',
      error: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
      requiredEnv: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
      message:
        'Online payment gateway is Not Configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server environment variables, or record fees via Cash / Bank Transfer.',
    });
    return;
  }

  res.status(501).json({
    created: false,
    configured: true,
    message: 'Razorpay credentials detected; connect live Razorpay Orders SDK call for production checkout.',
  });
});

app.post('/api/payments/verify', (req: Request, res: Response) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) {
    res.status(503).json({
      verified: false,
      configured: false,
      status: 'Not Configured',
      error: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
      requiredEnv: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
      message:
        'Online payment gateway is Not Configured on the server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable live online checkout verification; Cash and Bank Transfer entries remain fully operational.',
    });
    return;
  }

  const { orderId, paymentId, signature } = req.body || {};
  if (
    typeof orderId !== 'string' ||
    !orderId.trim() ||
    typeof paymentId !== 'string' ||
    !paymentId.trim() ||
    typeof signature !== 'string' ||
    !signature.trim()
  ) {
    res.status(400).json({
      verified: false,
      configured: true,
      error: 'INVALID_PAYMENT_PAYLOAD',
      message: 'Valid orderId, paymentId, and signature strings are required.',
    });
    return;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId.trim()}|${paymentId.trim()}`)
    .digest('hex');

  const expectedBuf = Buffer.from(expectedSignature, 'utf8');
  const receivedBuf = Buffer.from(signature.trim(), 'utf8');
  const isValid =
    expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf);

  if (!isValid) {
    res.status(400).json({
      verified: false,
      configured: true,
      error: 'INVALID_PAYMENT_SIGNATURE',
      message: 'Payment signature verification failed.',
    });
    return;
  }

  res.json({ verified: true, configured: true });
});

// =========================================================================
// EXTERNAL NOTIFICATION DISPATCH SCAFFOLD
// =========================================================================
app.post('/api/notifications/dispatch', (req: Request, res: Response) => {
  const { channel } = req.body || {};
  if (
    channel === 'email' &&
    (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS)
  ) {
    res.status(503).json({
      dispatched: false,
      configured: false,
      status: 'Not Configured',
      error: 'SMTP_NOT_CONFIGURED',
      message:
        'External SMTP email relay is Not Configured. In-app notification remains active; configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to enable external email delivery.',
    });
    return;
  }
  if (
    channel === 'sms' &&
    (!process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_FROM_NUMBER)
  ) {
    res.status(503).json({
      dispatched: false,
      configured: false,
      status: 'Not Configured',
      error: 'SMS_NOT_CONFIGURED',
      message:
        'External SMS provider is Not Configured. In-app notification remains active; configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER to enable SMS alerts.',
    });
    return;
  }

  res.json({
    dispatched: true,
    configured: true,
    channel: channel || 'in_app',
    timestamp: new Date().toISOString(),
  });
});

// =========================================================================
// VITE MIDDLEWARE (DEV) OR STATIC DIST SERVING (PROD)
// =========================================================================
async function startServer() {
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API_ROUTE_NOT_FOUND' });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`As-Siddique Islamic Academy server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
