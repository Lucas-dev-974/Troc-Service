import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
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

    const savedUser = await this.userRepository.save(user);

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
}

