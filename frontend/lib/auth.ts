import crypto from 'crypto';
import { query } from './db';

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'trendtube_secret_key_32bytes_len_123';
const IV_LENGTH = 16;
export const SESSION_COOKIE_NAME = 'trendtube_session';

/**
 * Hash password securely using Node.js crypto (pbkdf2)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Compare plain password against stored salt:hash string
 */
export function comparePassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

/**
 * Encrypt sensitive tokens using AES-256-CBC
 */
export function encryptToken(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypt sensitive tokens
 */
export function decryptToken(text: string): string {
  if (!text || !text.includes(':')) return '';
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error('Failed to decrypt token:', err);
    return '';
  }
}

/**
 * Create session for authenticated user
 */
export async function createSession(userId: string): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days session persistence

  await query(
    `INSERT INTO Sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)`,
    [userId, sessionToken, expiresAt.toISOString()]
  );

  return sessionToken;
}

/**
 * Verify session token and retrieve current user
 */
export async function getSessionUser(sessionToken: string) {
  if (!sessionToken) return null;

  const result = await query(
    `SELECT u.id, u.name, u.email, u.role, u.credits, u.subscription_plan, u.subscription_status, u.uploads_count, u.searches_count, u.is_banned, u.created_at
     FROM Sessions s
     JOIN Users u ON s.user_id = u.id
     WHERE s.session_token = $1 AND s.expires_at > NOW() AND u.is_banned = FALSE`,
    [sessionToken]
  );

  if (result.rows.length === 0) return null;
  return result.rows[0];
}

/**
 * Destroy session on logout
 */
export async function destroySession(sessionToken: string) {
  if (!sessionToken) return;
  await query(`DELETE FROM Sessions WHERE session_token = $1`, [sessionToken]);
}

/**
 * Ensure seed admin account exists on startup
 */
export async function ensureAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'aly@trendtube.ai';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecret123!';

    const check = await query(`SELECT id FROM Users WHERE email = $1`, [adminEmail]);
    if (check.rows.length === 0) {
      const passwordHash = hashPassword(adminPassword);
      await query(
        `INSERT INTO Users (email, name, password_hash, role, credits, subscription_plan, subscription_status)
         VALUES ($1, $2, $3, 'admin', 999999, 'enterprise', 'active')`,
        [adminEmail, 'Master Admin', passwordHash]
      );
      console.log(`[Auth] Initialized seed admin account: ${adminEmail}`);
    }
  } catch (err) {
    console.error('[Auth] Error seeding admin user:', err);
  }
}
