import { Repository, Like } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Offer, OfferType } from '../entities/Offer';

export interface CreateOfferDto {
  title: string;
  description: string;
  type: OfferType;
  author: string;
  contact: string;
  userId: number;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
}

export interface UpdateOfferDto {
  title?: string;
  description?: string;
  type?: OfferType;
  author?: string;
  contact?: string;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
}

export interface SearchOptions {
  type?: OfferType;
  search?: string;
  sortBy?: 'date' | 'title' | 'author';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
  // Paramètres de géolocalisation
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
  prioritizeByLocation?: boolean; // Active la priorisation géographique
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class OfferService {
  private offerRepository: Repository<Offer>;

  constructor() {
    this.offerRepository = AppDataSource.getRepository(Offer);
  }

  async findAll(options: SearchOptions = {}): Promise<PaginatedResult<Offer>> {
    const {
      type,
      search,
      sortBy = 'date',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
      country,
      region,
      city,
      postalCode,
      prioritizeByLocation = false,
    } = options;

    const queryBuilder = this.offerRepository.createQueryBuilder('offer');

    // Exclure les offres validées des recherches
    queryBuilder.where('offer.validated = :validated', { validated: false });

    // Filtre par type
    if (type) {
      queryBuilder.andWhere('offer.type = :type', { type });
    }

    // Recherche par mots-clés
    if (search) {
      const searchParam = `%${search}%`;
      queryBuilder.andWhere(
        '(offer.title LIKE :search OR offer.description LIKE :search OR offer.author LIKE :search)',
        { search: searchParam }
      );
    }

    // Filtres géographiques
    if (country) {
      queryBuilder.andWhere('offer.country = :country', { country });
    }
    if (region) {
      queryBuilder.andWhere('offer.region = :region', { region });
    }
    if (city) {
      queryBuilder.andWhere('offer.city = :city', { city });
    }
    if (postalCode) {
      queryBuilder.andWhere('offer.postalCode = :postalCode', { postalCode });
    }

    // Priorisation géographique (si activée)
    if (prioritizeByLocation && (country || region || city || postalCode)) {
      // Ajouter un champ de priorité calculé
      // Priorité 1: Même pays + code postal + ville + région
      // Priorité 2: Même pays + code postal + ville
      // Priorité 3: Même pays + ville
      // Priorité 4: Même pays + région
      // Priorité 5: Même pays
      // Priorité 6: Autres
      queryBuilder.addSelect(
        `CASE 
          WHEN offer.country = :userCountry AND offer.postalCode = :userPostalCode AND offer.city = :userCity AND offer.region = :userRegion THEN 1
          WHEN offer.country = :userCountry AND offer.postalCode = :userPostalCode AND offer.city = :userCity THEN 2
          WHEN offer.country = :userCountry AND offer.city = :userCity THEN 3
          WHEN offer.country = :userCountry AND offer.region = :userRegion THEN 4
          WHEN offer.country = :userCountry THEN 5
          ELSE 6
        END`,
        'location_priority'
      );
      queryBuilder.setParameter('userCountry', country || '');
      queryBuilder.setParameter('userPostalCode', postalCode || '');
      queryBuilder.setParameter('userCity', city || '');
      queryBuilder.setParameter('userRegion', region || '');
      
      // Trier d'abord par priorité géographique, puis par le tri demandé
      queryBuilder.orderBy('location_priority', 'ASC');
      const sortField = sortBy === 'date' ? 'offer.createdAt' : `offer.${sortBy}`;
      queryBuilder.addOrderBy(sortField, sortOrder);
    } else {
      // Tri normal
      const sortField = sortBy === 'date' ? 'offer.createdAt' : `offer.${sortBy}`;
      queryBuilder.orderBy(sortField, sortOrder);
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Offer | null> {
    return await this.offerRepository.findOne({ where: { id } });
  }

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    const offer = this.offerRepository.create({
      ...createOfferDto,
      country: createOfferDto.country || null,
      region: createOfferDto.region || null,
      city: createOfferDto.city || null,
      postalCode: createOfferDto.postalCode || null,
    });
    return await this.offerRepository.save(offer);
  }

  async update(id: number, updateOfferDto: UpdateOfferDto, userId: number): Promise<Offer | null> {
    const offer = await this.findOne(id);
    if (!offer) {
      return null;
    }

    // Vérifier la propriété
    if (offer.userId !== userId) {
      throw new Error('Unauthorized: You can only update your own offers');
    }

    Object.assign(offer, updateOfferDto);
    return await this.offerRepository.save(offer);
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const offer = await this.findOne(id);
    if (!offer) {
      return false;
    }

    // Vérifier la propriété
    if (offer.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own offers');
    }

    const result = await this.offerRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  async validate(id: number, userId: number): Promise<Offer | null> {
    const offer = await this.findOne(id);
    if (!offer) {
      return null;
    }

    // Vérifier la propriété
    if (offer.userId !== userId) {
      throw new Error('Unauthorized: You can only validate your own offers');
    }

    offer.validated = true;
    return await this.offerRepository.save(offer);
  }

  // Méthode pour vérifier la propriété
  async isOwner(offerId: number, userId: number): Promise<boolean> {
    const offer = await this.findOne(offerId);
    return offer !== null && offer.userId === userId;
  }
}

