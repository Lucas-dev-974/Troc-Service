import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// POST /api/auth/signup - Créer un compte
router.post('/signup', authController.signup);

// POST /api/auth/login - Se connecter
router.post('/login', authController.login);

export default router;

