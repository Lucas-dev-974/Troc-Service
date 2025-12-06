# Configuration PWA - Troc & Services

## ✅ Modifications apportées

### 1. Installation du plugin
- `vite-plugin-pwa` installé et configuré

### 2. Configuration Vite (`vite.config.ts`)
- Plugin PWA configuré avec :
  - Manifeste web complet
  - Service Worker minimal (installation uniquement, pas de cache hors ligne)
  - Mode standalone pour expérience native
  - Icônes configurées (nécessitent les fichiers PNG)

### 3. Composant d'installation (`src/components/InstallPWA.tsx`)
- Composant qui détecte la disponibilité de l'installation PWA
- Affiche un bouton d'installation quand disponible
- Gère l'événement `beforeinstallprompt`
- Intégré dans le Layout

### 4. Meta tags (`index.html`)
- Meta tags PWA ajoutés
- Support iOS (apple-mobile-web-app)
- Theme color configuré

### 5. Icônes
- SVG créés : `icon.svg`, `mask-icon.svg`
- **À faire** : Générer les PNG requis (voir `public/ICONS_README.md`)

## 🚀 Test de la PWA

### En développement
1. Démarrer le serveur de développement :
   ```bash
   npm run dev
   ```

2. Ouvrir dans Chrome/Edge (navigateurs compatibles PWA)
3. Ouvrir les DevTools (F12)
4. Aller dans l'onglet "Application" > "Service Workers"
5. Vérifier que le service worker est enregistré

### Test d'installation
1. Visiter l'application dans Chrome/Edge
2. Le bouton "Installer l'application" devrait apparaître en bas à droite
3. Cliquer sur "Installer"
4. L'application devrait s'installer et s'ouvrir en mode standalone

### En production
1. Build de l'application :
   ```bash
   npm run build
   ```

2. Servir les fichiers depuis `dist/` avec HTTPS (requis pour PWA)
3. Les utilisateurs pourront installer l'application depuis leur navigateur

## 📱 Compatibilité

- ✅ Chrome/Edge (desktop et mobile)
- ✅ Firefox (desktop et mobile)
- ✅ Safari iOS 11.3+ (avec limitations)
- ⚠️ Safari macOS (support limité)

## 📝 Notes importantes

1. **HTTPS requis** : Les PWA nécessitent HTTPS en production (ou localhost en développement)
2. **Icônes PNG** : Les icônes PNG (`icon-192x192.png`, `icon-512x512.png`, `apple-touch-icon.png`) doivent être générées avant le déploiement (voir `public/ICONS_README.md`)
3. **Service Worker minimal** : Pas de cache pour fonctionnement hors ligne, uniquement pour permettre l'installation
4. **Mode standalone** : L'application s'ouvrira sans barre d'adresse du navigateur une fois installée

## 🔧 Dépannage

### Le bouton d'installation n'apparaît pas
- Vérifier que vous êtes sur HTTPS (ou localhost)
- Vérifier que le service worker est enregistré
- Vider le cache du navigateur
- Vérifier la console pour les erreurs

### Les icônes ne s'affichent pas
- Générer les fichiers PNG requis (voir `public/ICONS_README.md`)
- Vérifier que les fichiers sont dans le dossier `public/`
- Rebuild l'application après ajout des icônes

