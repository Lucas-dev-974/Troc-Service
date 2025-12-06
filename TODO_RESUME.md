# 📋 Résumé des Fonctionnalités Restantes à Implémenter

**Date** : Décembre 2024  
**Projet** : Troc & Services

---

## 🎯 Priorité Moyenne (Phase 2 - 1 mois)

### 1. 🔄 Authentification OAuth (Google) - **PLANIFIÉ**

**Objectif** : Permettre aux utilisateurs de se connecter avec leur compte Google

**À implémenter** :
- **Frontend** :
  - Intégration Google Identity Services (nouvelle API) ou adaptation de `@react-oauth/google` pour SolidJS
  - Bouton "Se connecter avec Google" sur les pages de connexion/inscription
  - Gestion du flux OAuth côté client

- **Backend** :
  - Route API `POST /api/auth/google` pour recevoir le token Google
  - Vérification du token avec `google-auth-library` (Node.js)
  - Création automatique de compte si l'utilisateur n'existe pas
  - Association du compte Google avec un compte existant (optionnel)
  - Récupération des informations de profil Google (nom, email, photo)

- **Base de données** :
  - Ajout champ `googleId` (string, nullable, unique) dans `User`
  - Ajout champ `avatar` (string, nullable) pour stocker l'URL de la photo de profil Google

**Technologies** :
- Frontend : Google Identity Services ou bibliothèque adaptée pour SolidJS
- Backend : `google-auth-library` (Node.js)

**Bénéfices** :
- Simplification de l'inscription/connexion
- Réduction de la friction d'authentification
- Augmentation du taux d'inscription
- Sécurité renforcée

---

### 2. 🔄 Vérification d'Email - **PLANIFIÉ**

**Objectif** : Vérifier que les utilisateurs possèdent bien l'adresse email utilisée lors de l'inscription

**À implémenter** :
- **Backend** :
  - Génération de token de vérification unique (expiration 24h)
  - Route API `POST /api/auth/verify-email` pour vérifier le token
  - Route API `POST /api/auth/resend-verification` pour renvoyer l'email
  - Route API `GET /api/auth/verify-email/:token` pour vérification automatique via lien
  - Envoi d'email de vérification lors de l'inscription (nécessite système de mailing)

- **Frontend** :
  - Page de vérification avec validation du token
  - Statut de vérification dans le profil utilisateur
  - Bouton pour renvoyer l'email de vérification
  - Blocage des fonctionnalités sensibles si email non vérifié (optionnel)

- **Base de données** :
  - Ajout champ `emailVerified` (boolean, default: false) dans `User`
  - Ajout champ `emailVerificationToken` (string, nullable, unique) dans `User`
  - Ajout champ `emailVerificationExpiry` (datetime, nullable) dans `User`

**Sécurité** :
- Token unique et aléatoire
- Expiration (24 heures)
- Utilisation unique du token
- Validation côté serveur stricte
- Rate limiting sur les demandes de renvoi

**Technologies** :
- Backend : `nodemailer` ou `sendgrid` pour l'envoi d'emails
- Génération de token : `crypto` (Node.js) ou `uuid`

**Bénéfices** :
- Vérification de la validité des adresses email
- Réduction des comptes avec emails invalides
- Sécurité renforcée
- Amélioration de la qualité des données utilisateur

---

### 3. 🔄 Réinitialisation de Mot de Passe - **PLANIFIÉ**

**Objectif** : Permettre aux utilisateurs de réinitialiser leur mot de passe en cas d'oubli

**À implémenter** :
- **Backend** :
  - Route API `POST /api/auth/forgot-password` pour demander la réinitialisation
  - Route API `POST /api/auth/reset-password` pour réinitialiser avec token
  - Route API `GET /api/auth/verify-reset-token/:token` pour vérifier la validité du token
  - Génération de token sécurisé et unique (expiration 1h)
  - Envoi d'email avec lien de réinitialisation (nécessite système de mailing)
  - Invalidation du token après utilisation

- **Frontend** :
  - Page "Mot de passe oublié" avec formulaire d'email
  - Page de réinitialisation avec formulaire nouveau mot de passe
  - Validation du token et mise à jour du mot de passe

- **Base de données** :
  - Ajout champ `passwordResetToken` (string, nullable, unique) dans `User`
  - Ajout champ `passwordResetExpiry` (datetime, nullable) dans `User`

**Sécurité** :
- Token unique et aléatoire
- Expiration courte (1 heure)
- Utilisation unique du token
- Validation côté serveur stricte

**Technologies** :
- Backend : `nodemailer` ou `sendgrid` pour l'envoi d'emails
- Génération de token : `crypto` (Node.js) ou `uuid`

**Bénéfices** :
- Récupération de compte en cas d'oubli de mot de passe
- Sécurité renforcée avec tokens temporaires
- Expérience utilisateur améliorée

---

### 4. 🔄 Système de Mailing - **PLANIFIÉ**

**Objectif** : Mettre en place un système complet d'envoi d'emails pour la communication avec les utilisateurs

**À implémenter** :
- **Backend** :
  - Service d'envoi d'emails (SMTP ou service tiers)
  - Templates d'emails HTML personnalisables
  - Configuration SMTP via variables d'environnement
  - Queue d'envoi pour emails asynchrones (optionnel)

- **Emails transactionnels** :
  - Email de bienvenue après inscription
  - Email de vérification d'email (lors de l'inscription)
  - Email de confirmation de création d'offre
  - Email de réinitialisation de mot de passe
  - Email de confirmation de modification de profil (futur)
  - Email de confirmation de suppression d'offre (futur)

- **Emails de notification** (futur) :
  - Notifications de nouvelles offres correspondant aux critères
  - Rappels et alertes

**Technologies** :
- Backend : `nodemailer` (SMTP) ou services tiers (SendGrid, Mailgun, AWS SES)
- Templates : `handlebars`, `ejs` ou `mjml` pour emails HTML
- Configuration : Variables d'environnement pour credentials SMTP

**Configuration requise** :
- Variables d'environnement pour serveur SMTP
- Templates d'emails réutilisables
- Queue d'envoi pour emails asynchrones (optionnel)

**Bénéfices** :
- Communication avec les utilisateurs
- Notifications importantes
- Professionnalisme de l'application
- Amélioration de l'engagement utilisateur

---

## 🔔 Priorité Basse

### 5. Notifications - **NON IMPLÉMENTÉ**

**Fonctionnalités manquantes** :
- Notifications pour nouvelles offres
- Notifications pour messages (futur)
- Préférences de notification
- Notifications en temps réel (WebSocket ou Server-Sent Events)

---

## 🧪 Tests - **NON IMPLÉMENTÉ**

**État actuel** : Aucun test

**À implémenter** :
- **Tests unitaires** :
  - Services backend (UserService, OfferService, etc.)
  - Composants frontend (OfferCard, OfferForm, etc.)
  - Utilitaires de validation

- **Tests d'intégration** :
  - Routes API (endpoints complets)
  - Flux d'authentification
  - CRUD des offres

- **Tests E2E** :
  - Scénarios utilisateur complets
  - Inscription → Création d'offre → Modification → Suppression
  - Recherche et filtres
  - Géolocalisation

**Technologies recommandées** :
- Backend : Jest, Supertest
- Frontend : Vitest, Testing Library
- E2E : Playwright ou Cypress

---

## 🚀 Production (Phase 3 - Long Terme)

### 6. Migration Base de Données

**À faire** :
- Migration de SQLite vers PostgreSQL ou MySQL
- Support PostGIS pour géolocalisation avancée (optionnel)
- Scripts de migration des données
- Configuration de la base de données de production

---

### 7. CI/CD

**À mettre en place** :
- Pipeline CI/CD (GitHub Actions, GitLab CI, etc.)
- Tests automatiques à chaque commit
- Déploiement automatique
- Gestion des environnements (dev, staging, production)

---

### 8. Déploiement

**À préparer** :
- Déploiement sur plateforme cloud (AWS, Heroku, Vercel, etc.)
- Configuration des variables d'environnement
- Configuration du domaine et SSL
- Monitoring et analytics

---

### 9. Optimisation des Performances

**À optimiser** :
- Indexation des champs de recherche dans la base de données
- Optimisation des requêtes SQL
- Cache des résultats de recherche (optionnel)
- Optimisation des images et assets
- Lazy loading des composants

---

### 10. Sécurité Renforcée

**À implémenter** :
- Rate limiting sur les routes API
- Validation CSRF
- Audit de sécurité
- Chiffrement des données sensibles
- Headers de sécurité (CSP, HSTS, etc.)

---

## 🎨 Fonctionnalités Avancées (Phase 3 - Long Terme)

### 11. Système de Favoris

**À implémenter** :
- Ajout/suppression d'offres en favoris
- Page "Mes favoris"
- Notifications pour les favoris (futur)

---

### 12. Messagerie entre Utilisateurs

**À implémenter** :
- Système de messages entre utilisateurs
- Notifications de nouveaux messages
- Interface de messagerie
- WebSocket ou Server-Sent Events pour temps réel

---

### 13. Système de Notation/Avis

**À implémenter** :
- Notation des utilisateurs après échange
- Avis et commentaires
- Affichage des notes dans le profil
- Calcul de la note moyenne

---

## 📊 Résumé par Priorité

### 🔴 Urgent (Court Terme)
- Aucune fonctionnalité urgente restante

### 🟡 Important (Moyen Terme - 1 mois)
1. ✅ Authentification OAuth (Google)
2. ✅ Vérification d'Email
3. ✅ Réinitialisation de Mot de Passe
4. ✅ Système de Mailing

### 🟢 Optionnel (Long Terme - 2-3 mois)
5. Notifications
6. Tests (unitaires, intégration, E2E)
7. Migration base de données
8. CI/CD
9. Déploiement
10. Optimisation des performances
11. Sécurité renforcée
12. Système de favoris
13. Messagerie entre utilisateurs
14. Système de notation/avis

---

## 📝 Notes

- **Dépendances** : La vérification d'email et la réinitialisation de mot de passe nécessitent le système de mailing
- **Ordre recommandé** :
  1. Système de Mailing (prérequis pour les autres)
  2. Vérification d'Email
  3. Réinitialisation de Mot de Passe
  4. Authentification OAuth (Google)
  5. Tests
  6. Préparation pour la production

- **État actuel** : L'application est fonctionnelle et prête pour le développement et les tests utilisateurs. Les fonctionnalités restantes sont principalement des améliorations de sécurité, d'expérience utilisateur et de préparation à la production.

