import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// POST /api/auth/signup - Créer un compte
router.post('/signup', authController.signup);

// POST /api/auth/login - Se connecter
router.post('/login', authController.login);

// POST /api/auth/verify-email - Vérifier l'email avec token
router.post('/verify-email', authController.verifyEmail);

// GET /api/auth/verify-email/:token - Vérifier l'email via lien
router.get('/verify-email/:token', authController.verifyEmailByToken);

// POST /api/auth/resend-verification - Renvoyer l'email de vérification
router.post('/resend-verification', authController.resendVerificationEmail);

// POST /api/auth/forgot-password - Demander la réinitialisation de mot de passe
router.post('/forgot-password', authController.forgotPassword);

// GET /api/auth/verify-reset-token/:token - Vérifier la validité du token de réinitialisation
router.get('/verify-reset-token/:token', authController.verifyPasswordResetToken);

// POST /api/auth/reset-password - Réinitialiser le mot de passe
router.post('/reset-password', authController.resetPassword);

export default router;

