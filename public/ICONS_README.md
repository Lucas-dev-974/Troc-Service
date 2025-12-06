# Génération des icônes PWA

Les icônes PWA nécessitent des fichiers PNG aux tailles suivantes :
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)
- `apple-touch-icon.png` (180x180 pixels pour iOS)

## Méthode 1 : Utiliser un outil en ligne
1. Visitez https://realfavicongenerator.net/ ou https://www.pwabuilder.com/imageGenerator
2. Uploadez le fichier `icon.svg` depuis le dossier `public/`
3. Téléchargez les icônes générées
4. Placez-les dans le dossier `public/`

## Méthode 2 : Utiliser ImageMagick (si installé)
```bash
# Générer les icônes depuis le SVG
magick convert public/icon.svg -resize 192x192 public/icon-192x192.png
magick convert public/icon.svg -resize 512x512 public/icon-512x512.png
magick convert public/icon.svg -resize 180x180 public/apple-touch-icon.png
```

## Méthode 3 : Utiliser un éditeur d'images
1. Ouvrez `public/icon.svg` dans un éditeur d'images (GIMP, Photoshop, etc.)
2. Exportez aux tailles requises
3. Placez les fichiers dans `public/`

## Note
Pour l'instant, le plugin PWA fonctionnera même sans ces fichiers PNG, mais les icônes ne s'afficheront pas correctement. Il est recommandé de générer ces fichiers avant le déploiement en production.

