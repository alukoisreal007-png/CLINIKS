import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'cliniks_university_secure_secret_key_2026';

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64url');
}

function base64UrlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

/**
 * Generates an RFC 7519 compliant HMAC-SHA256 JWT token using native Node crypto.
 * @param {Object} payload - User identification and role claims
 * @param {number} expiresInSeconds - Token validity duration (default 24h)
 * @returns {string} Signed JWT token
 */
export function generateToken(payload, expiresInSeconds = 86400) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Validates a JWT signature and checks expiration.
 * @param {string} token 
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Middleware: Verifies Bearer token and attaches req.user
 */
export function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      return next();
    }
  }

  // Developer / Demo convenience fallback: Allow x-cliniks-role header in non-production
  if (process.env.NODE_ENV !== 'production' && req.headers['x-cliniks-role']) {
    const devRole = req.headers['x-cliniks-role'].toUpperCase();
    if (['STUDENT', 'CLINICIAN', 'ADMIN'].includes(devRole)) {
      req.user = {
        id: `dev-${devRole.toLowerCase()}-user`,
        role: devRole,
        name: `Dev ${devRole}`,
        matricNo: devRole === 'STUDENT' ? '214589' : undefined,
        staffId: devRole === 'CLINICIAN' ? 'MED-STAFF-104' : undefined
      };
      return next();
    }
  }

  return res.status(401).json({
    error: 'Unauthorized: Authentication required. Pass a valid Bearer token in Authorization header.'
  });
}

/**
 * Middleware: Role-Based Access Control (RBAC)
 * Enforces that req.user.role is inside allowedRoles array.
 * @param {string[]} allowedRoles - Array of allowed roles, e.g. ['CLINICIAN', 'ADMIN']
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No active authenticated session.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' lacks permission for this clinical resource. Required: [${allowedRoles.join(', ')}]`,
        userRole: req.user.role,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
}
