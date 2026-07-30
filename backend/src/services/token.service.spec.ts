import { TokenService } from './token.service';
import { env } from '@config/env';

// Mock the environment config
jest.mock('@config/env', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test-access-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '7d',
  },
}));

describe('TokenService Unit Tests', () => {
  let tokenService: TokenService;

  beforeEach(() => {
    tokenService = new TokenService();
  });

  it('should generate and verify an access token', () => {
    const payload = { id: 'user123', email: 'test@example.com', name: 'Test User' };
    
    const token = tokenService.generateAccessToken(payload);
    expect(typeof token).toBe('string');
    
    const decoded = tokenService.verifyAccessToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.name).toBe(payload.name);
  });

  it('should generate and verify a refresh token', () => {
    const payload = { id: 'user123', tokenVersion: 1 };
    
    const token = tokenService.generateRefreshToken(payload);
    expect(typeof token).toBe('string');
    
    const decoded = tokenService.verifyRefreshToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.tokenVersion).toBe(payload.tokenVersion);
  });

  it('should throw an error for invalid access token verification', () => {
    expect(() => {
      tokenService.verifyAccessToken('invalid.token.string');
    }).toThrow();
  });

  it('should generate a random hex token of length 64', () => {
    const randomToken = tokenService.generateRandomToken();
    expect(typeof randomToken).toBe('string');
    expect(randomToken.length).toBe(64); // 32 bytes hex = 64 characters
  });

  it('should generate a correct token expiry date in the future', () => {
    const hours = 24;
    const expiryDate = tokenService.generateTokenExpiry(hours);
    const now = new Date();
    
    // Check if it's within a reasonable margin of exactly 24 hours from now
    const diffHours = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBeCloseTo(24, 1);
  });
});
