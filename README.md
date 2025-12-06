# Troc & Services

Application web de troc et services entre particuliers, développée avec SolidJS et une API REST Node.js.

## 🚀 Démarrage rapide

### Frontend

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Backend

Voir le [README du serveur](./serveur/README.md) pour les instructions de démarrage du backend.

L'API backend doit être accessible sur [http://localhost:3001](http://localhost:3001)

### Configuration

Par défaut, le frontend se connecte à `http://localhost:3001/api`. Pour changer l'URL de l'API, créez un fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:3001/api
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `npm run dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)

## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)
