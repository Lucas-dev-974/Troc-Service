import { Request, Response } from 'express';
import { AuthService, SignupDto, LoginDto } from '../services/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const signupDto: SignupDto = req.body;

      // Validation
      if (!signupDto.email || !signupDto.username || !signupDto.password) {
        res.status(400).json({ error: 'Email, username and password are required' });
        return;
      }

      // Validation email basique
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupDto.email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }

      // Validation password (minimum 6 caractères)
      if (signupDto.password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
        return;
      }

      const result = await this.authService.signup(signupDto);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error during signup:', error);
      if (error instanceof Error && error.message === 'Email already exists') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginDto: LoginDto = req.body;

      // Validation
      if (!loginDto.email || !loginDto.password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await this.authService.login(loginDto);
      res.json(result);
    } catch (error) {
      console.error('Error during login:', error);
      if (error instanceof Error && error.message === 'Invalid email or password') {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      await this.authService.verifyEmail(token);
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Error during email verification:', error);
      if (error instanceof Error) {
        if (error.message === 'Invalid verification token') {
          res.status(400).json({ error: error.message });
        } else if (error.message === 'Verification token expired') {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  verifyEmailByToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      await this.authService.verifyEmail(token);
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Error during email verification:', error);
      if (error instanceof Error) {
        if (error.message === 'Invalid verification token') {
          res.status(400).json({ error: error.message });
        } else if (error.message === 'Verification token expired') {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      // Validation email basique
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }

      await this.authService.resendVerificationEmail(email);
      res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
      console.error('Error during resend verification email:', error);
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          // Ne pas révéler si l'email existe ou non (sécurité)
          res.json({ message: 'If the email exists, a verification email has been sent' });
        } else if (error.message === 'Email already verified') {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      // Validation email basique
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }

      await this.authService.requestPasswordReset(email);
      // Ne pas révéler si l'email existe ou non (sécurité)
      res.json({ message: 'If the email exists, a password reset email has been sent' });
    } catch (error) {
      console.error('Error during forgot password:', error);
      if (error instanceof Error && error.message === 'Failed to send password reset email') {
        res.status(500).json({ error: 'Failed to send password reset email' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  verifyPasswordResetToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      const isValid = await this.authService.verifyPasswordResetToken(token);
      res.json({ valid: isValid });
    } catch (error) {
      console.error('Error during password reset token verification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(400).json({ error: 'Token and password are required' });
        return;
      }

      // Validation password (minimum 6 caractères)
      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
        return;
      }

      await this.authService.resetPassword(token, password);
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error during password reset:', error);
      if (error instanceof Error) {
        if (error.message === 'Invalid reset token') {
          res.status(400).json({ error: error.message });
        } else if (error.message === 'Reset token expired') {
          res.status(400).json({ error: error.message });
        } else if (error.message === 'Password must be at least 6 characters long') {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}

