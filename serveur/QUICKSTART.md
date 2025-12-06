# Guide de démarrage rapide

## Installation rapide

```bash
# 1. Installer les dépendances
cd serveur
npm install

# 2. Configurer l'environnement
cp env.example .env
# Le fichier .env est déjà configuré par défaut pour SQLite

# 3. Démarrer le serveur en mode développement
npm run dev
# La base de données SQLite sera créée automatiquement au premier démarrage
```

## Commandes utiles

```bash
# Développement
npm run dev              # Démarrer avec hot-reload

# Production
npm run build            # Compiler TypeScript
npm start                # Démarrer le serveur compilé

# Migrations
npm run migration:generate -- src/migrations/NomMigration
npm run migration:run
npm run migration:revert
```

## Test de l'API

Une fois le serveur démarré, testez avec curl ou Postman :

```bash
# Health check
curl http://localhost:3001/health

# Récupérer toutes les offres
curl http://localhost:3001/api/offers

# Récupérer les offres de type "service"
curl http://localhost:3001/api/offers?type=service

# Créer une offre
curl -X POST http://localhost:3001/api/offers \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cours de piano",
    "description": "Cours de piano pour débutants",
    "type": "service",
    "author": "Jean Dupont",
    "contact": "jean@example.com"
  }'
```

## Structure de l'API

- **GET** `/api/offers` - Liste toutes les offres
- **GET** `/api/offers?type=service` - Filtre par type
- **GET** `/api/offers/:id` - Détails d'une offre
- **POST** `/api/offers` - Créer une offre
- **PUT** `/api/offers/:id` - Modifier une offre
- **DELETE** `/api/offers/:id` - Supprimer une offre

