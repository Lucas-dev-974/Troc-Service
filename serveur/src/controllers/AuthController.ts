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
}

