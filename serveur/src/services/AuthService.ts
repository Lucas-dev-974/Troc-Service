import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { MailService } from './MailService';

export interface SignupDto {
  email: string;
  username: string;
  password: string;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

export class AuthService {
  private userRepository: Repository<User>;
  private jwtSecret: string;
  private mailService: MailService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.mailService = new MailService();
  }

  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    // Créer l'utilisateur
    const user = this.userRepository.create({
      email: signupDto.email,
      username: signupDto.username,
      password: hashedPassword,
      country: signupDto.country || null,
      region: signupDto.region || null,
      city: signupDto.city || null,
      postalCode: signupDto.postalCode || null,
    });

    // Générer le token de vérification d'email
    const verificationToken = this.generateVerificationToken();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 heures

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = verificationExpiry;
    user.emailVerified = false;

    const savedUser = await this.userRepository.save(user);

    // Envoyer l'email de bienvenue et de vérification
    try {
      await this.mailService.sendWelcomeEmail(savedUser.email, savedUser.username);
      await this.mailService.sendVerificationEmail(savedUser.email, savedUser.username, verificationToken);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      // Ne pas bloquer l'inscription si l'email échoue
    }

    // Générer le token JWT
    const token = this.generateToken(savedUser);

    return {
      token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Trouver l'utilisateur par email
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Générer le token JWT
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '7d',
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  // Génération de token sécurisé
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Vérification d'email
  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    // Vérifier l'expiration
    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      throw new Error('Verification token expired');
    }

    // Marquer l'email comme vérifié
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    await this.userRepository.save(user);

    return true;
  }

  // Renvoyer l'email de vérification
  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email already verified');
    }

    // Générer un nouveau token
    const verificationToken = this.generateVerificationToken();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = verificationExpiry;
    await this.userRepository.save(user);

    // Envoyer l'email
    await this.mailService.sendVerificationEmail(user.email, user.username, verificationToken);
  }

  // Demande de réinitialisation de mot de passe
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return;
    }

    // Générer le token de réinitialisation
    const resetToken = this.generateVerificationToken();
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1); // 1 heure

    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetExpiry;
    await this.userRepository.save(user);

    // Envoyer l'email
    try {
      await this.mailService.sendPasswordResetEmail(user.email, user.username, resetToken);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Vérifier le token de réinitialisation
  async verifyPasswordResetToken(token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      return false;
    }

    // Vérifier l'expiration
    if (user.passwordResetExpiry && user.passwordResetExpiry < new Date()) {
      return false;
    }

    return true;
  }

  // Réinitialiser le mot de passe
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      throw new Error('Invalid reset token');
    }

    // Vérifier l'expiration
    if (user.passwordResetExpiry && user.passwordResetExpiry < new Date()) {
      throw new Error('Reset token expired');
    }

    // Valider le nouveau mot de passe
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe et invalider le token
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    await this.userRepository.save(user);
  }
}

