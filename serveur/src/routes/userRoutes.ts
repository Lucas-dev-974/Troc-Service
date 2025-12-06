import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// GET /api/users/profile - Récupérer le profil de l'utilisateur connecté
router.get('/profile', authenticateToken, userController.getProfile);

// PUT /api/users/profile - Mettre à jour le profil
router.put('/profile', authenticateToken, userController.updateProfile);

// GET /api/users/offers - Récupérer les offres de l'utilisateur connecté
router.get('/offers', authenticateToken, userController.getUserOffers);

export default router;

