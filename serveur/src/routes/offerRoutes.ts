import { Router } from 'express';
import { OfferController } from '../controllers/OfferController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const offerController = new OfferController();

// GET /api/offers - Récupérer toutes les offres (optionnel: ?type=service|objet|nourriture)
router.get('/', offerController.getAll);

// GET /api/offers/:id - Récupérer une offre par ID
router.get('/:id', offerController.getOne);

// POST /api/offers - Créer une nouvelle offre (protégé)
router.post('/', authenticateToken, offerController.create);

// PUT /api/offers/:id - Mettre à jour une offre (protégé)
router.put('/:id', authenticateToken, offerController.update);

// DELETE /api/offers/:id - Supprimer une offre (protégé)
router.delete('/:id', authenticateToken, offerController.delete);

export default router;

