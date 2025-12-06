import { Response } from 'express';
import { UserService, UpdateProfileDto } from '../services/UserService';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { ValidationErrors, isValidEmail, validateLength } from '../utils/validation';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const profile = await this.userService.getProfile(req.userId!);

      if (!profile) {
        throw createError('User not found', 404, 'NOT_FOUND');
      }

      res.json(profile);
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw createError('Error fetching profile', 500, 'FETCH_ERROR');
    }
  };

  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const updateDto: UpdateProfileDto = req.body;

      // Validation username si fourni
      if (updateDto.username && !validateLength(updateDto.username, 3, 50)) {
        throw createError(ValidationErrors.USERNAME_LENGTH, 400, 'VALIDATION_ERROR');
      }

      // Validation email si fourni
      if (updateDto.email && !isValidEmail(updateDto.email)) {
        throw createError(ValidationErrors.EMAIL_INVALID, 400, 'VALIDATION_ERROR');
      }

      const user = await this.userService.updateProfile(req.userId!, updateDto);

      if (!user) {
        throw createError('User not found', 404, 'NOT_FOUND');
      }

      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      if (error instanceof Error && error.message === 'Email already exists') {
        throw createError(error.message, 409, 'EMAIL_EXISTS');
      }
      throw createError('Error updating profile', 500, 'UPDATE_ERROR');
    }
  };

  getUserOffers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const offers = await this.userService.getUserOffers(req.userId!);
      res.json(offers);
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw createError('Error fetching user offers', 500, 'FETCH_ERROR');
    }
  };
}

