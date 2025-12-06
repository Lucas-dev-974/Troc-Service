import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Offer } from '../entities/Offer';

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  createdAt: Date;
  offersCount: number;
  offers: Offer[];
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
}

export interface UpdateProfileDto {
  username?: string;
  email?: string;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
}

export class UserService {
  private userRepository: Repository<User>;
  private offerRepository: Repository<Offer>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.offerRepository = AppDataSource.getRepository(Offer);
  }

  async getProfile(userId: number): Promise<UserProfile | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['offers'],
    });

    if (!user) {
      return null;
    }

    // Trier les offres par date de création (plus récentes en premier)
    const sortedOffers = user.offers.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      offersCount: user.offers.length,
      offers: sortedOffers,
      country: user.country || undefined,
      region: user.region || undefined,
      city: user.city || undefined,
      postalCode: user.postalCode || undefined,
    };
  }

  async updateProfile(userId: number, updateDto: UpdateProfileDto): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return null;
    }

    // Vérifier si l'email existe déjà (si modifié)
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateDto.email },
      });

      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    Object.assign(user, updateDto);
    return await this.userRepository.save(user);
  }

  async getUserOffers(userId: number): Promise<Offer[]> {
    return await this.offerRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}

