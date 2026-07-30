import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { env } from '@config/env';
import { logger } from '@utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> {
    if (this.transporter) return this.transporter;

    // If no SMTP user configured, create an Ethereal test account
    if (!env.SMTP_USER) {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(`📧 Using Ethereal email: ${testAccount.user}`);
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    return this.transporter;
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${env.CLIENT_URL}/verify-email/${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 40px 0; }
          .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
          .header { background: linear-gradient(135deg, #5c7cfa 0%, #7c3aed 100%); padding: 32px; text-align: center; }
          .header h1 { color: #fff; font-size: 24px; margin: 0; }
          .body { padding: 32px; }
          .body h2 { color: #0f172a; font-size: 20px; margin: 0 0 12px; }
          .body p { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #5c7cfa, #4c6ef5); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; }
          .footer { padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center; }
          .footer p { color: #94a3b8; font-size: 13px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>OPAS</h1></div>
          <div class="body">
            <h2>Welcome, ${name}! 👋</h2>
            <p>Thanks for signing up. Please verify your email address to get started with OPAS.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="btn">Verify Email Address</a>
            </p>
            <p style="font-size: 13px; color: #94a3b8;">
              This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          <div class="footer"><p>© ${new Date().getFullYear()} OPAS. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `;

    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: `"OPAS" <${env.EMAIL_FROM}>`,
        to,
        subject: 'Verify your email — OPAS',
        html,
      });

      // Log Ethereal preview URL in development
      if (!env.SMTP_USER) {
        logger.info(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const resetUrl = `${env.CLIENT_URL}/reset-password/${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 40px 0; }
          .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
          .header { background: linear-gradient(135deg, #5c7cfa 0%, #7c3aed 100%); padding: 32px; text-align: center; }
          .header h1 { color: #fff; font-size: 24px; margin: 0; }
          .body { padding: 32px; }
          .body h2 { color: #0f172a; font-size: 20px; margin: 0 0 12px; }
          .body p { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #5c7cfa, #4c6ef5); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; }
          .footer { padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center; }
          .footer p { color: #94a3b8; font-size: 13px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>OPAS</h1></div>
          <div class="body">
            <h2>Password Reset Request</h2>
            <p>Hi ${name}, we received a request to reset your password. Click the button below to choose a new password.</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </p>
            <p style="font-size: 13px; color: #94a3b8;">
              This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
          <div class="footer"><p>© ${new Date().getFullYear()} OPAS. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `;

    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: `"OPAS" <${env.EMAIL_FROM}>`,
        to,
        subject: 'Reset your password — OPAS',
        html,
      });

      if (!env.SMTP_USER) {
        logger.info(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
