#!/bin/bash

# Arrêter le script en cas d'erreur
set -e

echo "🚀 Démarrage du déploiement..."

# 1. Récupérer les dernières modifications
echo "📥 Pull du code depuis GitHub..."
git fetch origin
git reset --hard origin/main  # Force la mise à jour exacte comme sur le repo
git pull origin main

# 2. Rebuild et redémarrage des conteneurs
echo "🐳 Redémarrage des conteneurs Docker..."
docker-compose down
docker-compose up -d --build

# 3. Nettoyage (optionnel)
echo "🧹 Nettoyage des images inutilisées..."
docker image prune -f

echo "✅ Déploiement terminé avec succès !"
