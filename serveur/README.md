# Troc & Services - API Server

API REST pour l'application Troc & Services, développée avec Node.js, Express, TypeScript et TypeORM.

## 🚀 Technologies

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Langage de programmation typé
- **TypeORM** - ORM pour TypeScript
- **SQLite** - Base de données embarquée (better-sqlite3)

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn

## 🔧 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp env.example .env
```

3. Le fichier `.env` est déjà configuré par défaut. La base de données SQLite sera créée automatiquement au premier démarrage :
```env
DB_PATH=database.sqlite
```

**Note** : SQLite ne nécessite aucune installation supplémentaire. La base de données sera créée automatiquement dans le fichier `database.sqlite` au premier démarrage du serveur.

## 🏃 Démarrage

### Mode développement
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

### Mode production
```bash
npm run build
npm start
```

## 📡 Endpoints API

### Health Check
- `GET /health` - Vérifier l'état du serveur

### Offres

- `GET /api/offers` - Récupérer toutes les offres
  - Query params: `?type=service|objet|nourriture` (optionnel)
  
- `GET /api/offers/:id` - Récupérer une offre par ID

- `POST /api/offers` - Créer une nouvelle offre
  ```json
  {
    "title": "Cours de piano",
    "description": "Cours de piano pour débutants",
    "type": "service",
    "author": "Jean Dupont",
    "contact": "jean@example.com"
  }
  ```

- `PUT /api/offers/:id` - Mettre à jour une offre
  ```json
  {
    "title": "Cours de piano avancé",
    "description": "Cours pour niveau avancé"
  }
  ```

- `DELETE /api/offers/:id` - Supprimer une offre

## 🗄️ Migrations

### Générer une migration
```bash
npm run migration:generate -- src/migrations/NomDeLaMigration
```

### Exécuter les migrations
```bash
npm run migration:run
```

### Annuler la dernière migration
```bash
npm run migration:revert
```

## 📁 Structure du projet

```
serveur/
├── src/
│   ├── config/
│   │   └── data-source.ts      # Configuration TypeORM
│   ├── controllers/
│   │   └── OfferController.ts  # Contrôleurs REST
│   ├── entities/
│   │   └── Offer.ts            # Entités TypeORM
│   ├── middleware/
│   │   ├── errorHandler.ts     # Gestionnaire d'erreurs
│   │   └── notFound.ts         # Route 404
│   ├── routes/
│   │   └── offerRoutes.ts      # Routes Express
│   ├── services/
│   │   └── OfferService.ts     # Logique métier
│   ├── migrations/             # Migrations TypeORM
│   └── index.ts                # Point d'entrée
├── dist/                       # Build TypeScript
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port du serveur | 3001 |
| `NODE_ENV` | Environnement (development/production) | development |
| `DB_PATH` | Chemin du fichier SQLite | database.sqlite |
| `CORS_ORIGIN` | Origine autorisée pour CORS | http://localhost:3000 |

## 🧪 Tests

Les tests peuvent être ajoutés avec Jest ou Mocha.

## 📝 Notes

- **SQLite** : Base de données embarquée, aucun serveur à installer. Le fichier `database.sqlite` sera créé automatiquement au premier démarrage.
- En mode développement, `synchronize: true` est activé dans TypeORM (synchronisation automatique du schéma)
- En production, utiliser les migrations pour gérer le schéma de base de données
- Le serveur écoute sur le port 3001 par défaut pour éviter les conflits avec le frontend (port 3000)
- Le fichier `database.sqlite` peut être ajouté au `.gitignore` si vous ne souhaitez pas versionner les données de test

