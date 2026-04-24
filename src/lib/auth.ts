import { randomBytes } from 'crypto';

export interface MagicToken {
  token: string;
  clientId: string;
  email: string;
  expiresAt: number;
  used: boolean;
}

// Simple in-memory token store (for demo - use Redis/DB in production)
const tokenStore = new Map<string, MagicToken>();

export function generateMagicToken(clientId: string, email: string): string {
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes
  
  tokenStore.set(token, {
    token,
    clientId,
    email,
    expiresAt,
    used: false
  });
  
  // Clean up expired tokens periodically
  cleanupExpiredTokens();
  
  return token;
}

export function verifyMagicToken(token: string): { valid: boolean; clientId?: string; email?: string } {
  const tokenData = tokenStore.get(token);
  
  if (!tokenData) {
    return { valid: false };
  }
  
  if (tokenData.used) {
    return { valid: false };
  }
  
  if (Date.now() > tokenData.expiresAt) {
    tokenStore.delete(token);
    return { valid: false };
  }
  
  // Mark token as used (one-time use)
  tokenData.used = true;
  tokenStore.set(token, tokenData);
  
  return {
    valid: true,
    clientId: tokenData.clientId,
    email: tokenData.email
  };
}

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (data.expiresAt < now || data.used) {
      tokenStore.delete(token);
    }
  }
}

export function createMagicLinkUrl(token: string, baseUrl: string): string {
  return `${baseUrl}/portal/login/${token}`;
}