import jwt from 'jsonwebtoken';
import { config } from '@shared/config';
import type { JwtPayload } from '@shared/types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateTokenPair(payload: JwtPayload): TokenPair {
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'chatbotshub',
    audience: 'chatbotshub-api',
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(
    { userId: payload.userId, organizationId: payload.organizationId },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'chatbotshub',
      audience: 'chatbotshub-web',
    } as jwt.SignOptions,
  );

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: 'chatbotshub',
    audience: 'chatbotshub-api',
  }) as JwtPayload;
}

export function verifyRefreshToken(
  token: string,
): { userId: string; organizationId: string } {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'chatbotshub',
    audience: 'chatbotshub-web',
  }) as { userId: string; organizationId: string };
}
