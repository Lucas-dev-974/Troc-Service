import { Response, Request } from 'express';
import { OfferService, CreateOfferDto, UpdateOfferDto, SearchOptions } from '../services/OfferService';
import { OfferType } from '../entities/Offer';
import { AuthRequest } from '../middleware/auth';
import { ValidationErrors, isValidContact, validateLength } from '../utils/validation';
import { createError } from '../middleware/errorHandler';
import { MailService } from '../services/MailService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

export class OfferController {
  private offerService: OfferService;
  private mailService: MailService;

  constructor() {
    this.offerService = new OfferService();
    this.mailService = new MailService();
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const options: SearchOptions = {
        type: req.query.type as OfferType | undefined,
        search: req.query.search as string | undefined,
        sortBy: (req.query.sortBy as 'date' | 'title' | 'author') || 'date',
        sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC',
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        // Paramètres de géolocalisation
        country: req.query.country as string | undefined,
        region: req.query.region as string | undefined,
        city: req.query.city as string | undefined,
        postalCode: req.query.postalCode as string | undefined,
        prioritizeByLocation: req.query.prioritizeByLocation === 'true',
      };

      // Validation de la pagination
      if (options.page! < 1) {
        throw createError('Page number must be greater than 0', 400, 'INVALID_PAGE');
      }
      if (options.limit! < 1 || options.limit! > 100) {
        throw createError('Limit must be between 1 and 100', 400, 'INVALID_LIMIT');
      }

      const result = await this.offerService.findAll(options);
      res.json(result);
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw createError('Error fetching offers', 500, 'FETCH_ERROR');
    }
  };

  getOne = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid offer ID' });
        return;
      }
      const offer = await this.offerService.findOne(id);

      if (!offer) {
        res.status(404).json({ error: 'Offer not found' });
        return;
      }

      res.json(offer);
    } catch (error) {
      console.error('Error fetching offer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const createOfferDto: CreateOfferDto = {
        ...req.body,
        userId: req.userId!,
      };

      // Validation des champs requis
      if (!createOfferDto.title) {
        throw createError(ValidationErrors.TITLE_REQUIRED, 400, 'VALIDATION_ERROR');
      }
      if (!createOfferDto.description) {
        throw createError(ValidationErrors.DESCRIPTION_REQUIRED, 400, 'VALIDATION_ERROR');
      }
      if (!createOfferDto.author) {
        throw createError(ValidationErrors.AUTHOR_REQUIRED, 400, 'VALIDATION_ERROR');
      }
      if (!createOfferDto.contact) {
        throw createError(ValidationErrors.CONTACT_REQUIRED, 400, 'VALIDATION_ERROR');
      }

      // Validation des longueurs
      if (!validateLength(createOfferDto.title, 5, 255)) {
        throw createError(ValidationErrors.TITLE_LENGTH, 400, 'VALIDATION_ERROR');
      }
      if (!validateLength(createOfferDto.description, 10, 2000)) {
        throw createError(ValidationErrors.DESCRIPTION_LENGTH, 400, 'VALIDATION_ERROR');
      }
      if (!validateLength(createOfferDto.author, 2, 100)) {
        throw createError(ValidationErrors.AUTHOR_LENGTH, 400, 'VALIDATION_ERROR');
      }

      // Validation du contact
      const contactValidation = isValidContact(createOfferDto.contact);
      if (!contactValidation.valid) {
        throw createError(ValidationErrors.CONTACT_INVALID, 400, 'VALIDATION_ERROR');
      }

      // Validation du type
      if (!Object.values(OfferType).includes(createOfferDto.type)) {
        throw createError(ValidationErrors.TYPE_INVALID, 400, 'VALIDATION_ERROR');
      }

      const offer = await this.offerService.create(createOfferDto);
      
      // Envoyer un email de confirmation à l'utilisateur
      try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: req.userId! } });
        if (user) {
          await this.mailService.sendOfferConfirmationEmail(user.email, user.username, offer.title);
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
        // Ne pas bloquer la création de l'offre si l'email échoue
      }
      
      res.status(201).json(offer);
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw createError('Error creating offer', 500, 'CREATE_ERROR');
    }
  };

  update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw createError(ValidationErrors.ID_INVALID, 400, 'VALIDATION_ERROR');
      }

      const updateOfferDto: UpdateOfferDto = req.body;

      // Validation des longueurs si les champs sont fournis
      if (updateOfferDto.title && !validateLength(updateOfferDto.title, 5, 255)) {
        throw createError(ValidationErrors.TITLE_LENGTH, 400, 'VALIDATION_ERROR');
      }
      if (updateOfferDto.description && !validateLength(updateOfferDto.description, 10, 2000)) {
        throw createError(ValidationErrors.DESCRIPTION_LENGTH, 400, 'VALIDATION_ERROR');
      }
      if (updateOfferDto.author && !validateLength(updateOfferDto.author, 2, 100)) {
        throw createError(ValidationErrors.AUTHOR_LENGTH, 400, 'VALIDATION_ERROR');
      }

      // Validation du contact si fourni
      if (updateOfferDto.contact) {
        const contactValidation = isValidContact(updateOfferDto.contact);
        if (!contactValidation.valid) {
          throw createError(ValidationErrors.CONTACT_INVALID, 400, 'VALIDATION_ERROR');
        }
      }

      // Validation du type si fourni
      if (updateOfferDto.type && !Object.values(OfferType).includes(updateOfferDto.type)) {
        throw createError(ValidationErrors.TYPE_INVALID, 400, 'VALIDATION_ERROR');
      }

      const offer = await this.offerService.update(id, updateOfferDto, req.userId!);

      if (!offer) {
        throw createError('Offer not found', 404, 'NOT_FOUND');
      }

      res.json(offer);
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        throw createError(error.message, 403, 'FORBIDDEN');
      }
      throw createError('Error updating offer', 500, 'UPDATE_ERROR');
    }
  };

  delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw createError(ValidationErrors.ID_INVALID, 400, 'VALIDATION_ERROR');
      }

      const deleted = await this.offerService.delete(id, req.userId!);

      if (!deleted) {
        throw createError('Offer not found', 404, 'NOT_FOUND');
      }

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        throw createError(error.message, 403, 'FORBIDDEN');
      }
      throw createError('Error deleting offer', 500, 'DELETE_ERROR');
    }
  };

  validate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw createError(ValidationErrors.ID_INVALID, 400, 'VALIDATION_ERROR');
      }

      const offer = await this.offerService.validate(id, req.userId!);

      if (!offer) {
        throw createError('Offer not found', 404, 'NOT_FOUND');
      }

      res.json(offer);
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        throw createError(error.message, 403, 'FORBIDDEN');
      }
      throw createError('Error validating offer', 500, 'VALIDATE_ERROR');
    }
  };
}

