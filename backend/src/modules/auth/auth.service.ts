import bcrypt from 'bcryptjs';

import { ApiError } from '@utils/ApiError';
import { logger } from '@utils/logger';
import { TokenService } from '@services/token.service';
import { emailService } from '@services/email.service';

import { AuthRepository } from './auth.repository';
import { SignupDto, LoginDto, AuthResponseDto, ForgotPasswordDto, ResetPasswordDto } from './auth.dto';

export class AuthService {
  private authRepository: AuthRepository;
  private tokenService: TokenService;

  constructor() {
    this.authRepository = new AuthRepository();
    this.tokenService = new TokenService();
  }

  async signup(data: SignupDto): Promise<{ user: AuthResponseDto['user']; message: string }> {
    const existingUser = await this.authRepository.findByEmail(data.email);
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const user = await this.authRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    // Generate verification token
    const verificationToken = this.tokenService.generateRandomToken();
    const tokenExpiry = this.tokenService.generateTokenExpiry(24); // 24 hours
    await this.authRepository.updateVerificationToken(
      user._id.toString(),
      verificationToken,
      tokenExpiry,
    );

    // Send verification email (non-blocking)
    emailService
      .sendVerificationEmail(user.email, user.name, verificationToken)
      .catch((error) => {
        logger.error('Failed to send verification email:', error);
      });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
      message: 'Account created successfully. Please check your email to verify your account.',
    };
  }

  async login(data: LoginDto): Promise<AuthResponseDto & { refreshToken: string }> {
    const user = await this.authRepository.findByEmailWithPassword(data.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const accessToken = this.tokenService.generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      id: user._id.toString(),
      tokenVersion: user.tokenVersion,
    });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = this.tokenService.verifyRefreshToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await this.authRepository.findByEmailWithPassword(payload.id);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    // Check token version — invalidates all old refresh tokens on password change
    if (user.tokenVersion !== payload.tokenVersion) {
      throw ApiError.unauthorized('Token has been revoked');
    }

    const accessToken = this.tokenService.generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      id: user._id.toString(),
      tokenVersion: user.tokenVersion,
    });

    return { accessToken, refreshToken };
  }

  async logout(userId: string): Promise<void> {
    // Increment token version to invalidate all existing refresh tokens
    await this.authRepository.incrementTokenVersion(userId);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.authRepository.findByVerificationToken(token);
    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }

    await this.authRepository.markAsVerified(user._id.toString());

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.authRepository.findByEmail(data.email);

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    const resetToken = this.tokenService.generateRandomToken();
    const tokenExpiry = this.tokenService.generateTokenExpiry(1); // 1 hour
    await this.authRepository.updateResetToken(user._id.toString(), resetToken, tokenExpiry);

    // Send reset email (non-blocking)
    emailService
      .sendPasswordResetEmail(user.email, user.name, resetToken)
      .catch((error) => {
        logger.error('Failed to send password reset email:', error);
      });

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.authRepository.findByResetToken(data.token);
    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    await this.authRepository.updatePassword(user._id.toString(), hashedPassword);

    return { message: 'Password reset successfully. You can now log in with your new password.' };
  }

  async getProfile(userId: string): Promise<AuthResponseDto['user']> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      verified: user.verified,
    };
  }
}
