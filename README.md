# 🎬 Anime Stream

Une plateforme moderne de streaming d'anime développée avec Nuxt.js, offrant une expérience utilisateur fluide et intuitive.

## ✨ Fonctionnalités

### 📺 Streaming

-   Large bibliothèque d'animes disponibles
-   Multiples lecteurs disponibles pour chaque épisode
-   Mise à jour quotidienne des nouveaux épisodes
-   Interface de lecture épurée et responsive

### 👤 Système d'Authentification

-   Création de compte utilisateur
-   Connexion sécurisée via Supabase
-   Gestion des sessions utilisateur

### 📋 Fonctionnalités Utilisateur

-   Système de favoris personnalisé
-   Historique de visionnage
-   Reprise de la lecture au dernier épisode visionné
-   Suivi des animes en cours

### 🎨 Interface Utilisateur

-   Design moderne et intuitif
-   Navigation fluide entre les pages
-   Mode sombre/clair
-   Interface responsive (mobile, tablette, desktop)

## 🛠 Technologies Utilisées

### Frontend

-   **Framework**: Nuxt.js 3 / Vue.js 3
-   **Langage**: TypeScript
-   **Styling**:
    -   Tailwind CSS
    -   UI Components personnalisés
-   **State Management**: Vue Composition API

### Backend

-   **Base de données**: Supabase
-   **Authentication**: Supabase Auth
-   **Storage**: Supabase Storage

### Bot de Mise à Jour

-   **Runtime**: Node.js
-   **Framework**: Express
-   **Automatisation**: Mise à jour quotidienne des contenus

## 🚀 Installation

\`\`\`bash

# Cloner le repository

git clone https://github.com/Zakaria-salmi/anime-stream

# Installer les dépendances pour le bot

cd anime_bot
npm install

# Installer les dépendances pour le frontend

cd anime_stream
npm install

# Variables d'environnement

Créer un fichier .env et ajouter les variables d'environnement.

# Lancer le serveur de développement

npm run dev
\`\`\`

## ⚙️ Configuration

### Variables d'Environnement Requises

1. SUPABASE_URL=votre_url_supabase
2. SUPABASE_KEY=votre_clé_supabase

### Configuration Supabase

1. Créer un projet sur Supabase
2. Configurer les tables nécessaires (animes, episodes, users, etc.)
3. Configurer l'authentification
4. Ajouter les variables d'environnement

## 📝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push sur votre branche
5. Ouvrir une Pull Request

## 🤝 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue ou à me contacter directement.

---

Développé avec ❤️ par Salmi Zakaria
