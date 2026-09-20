# Cahier des Charges - Site Web Tapis Rouge Pro

## 1. Introduction

Ce document constitue le cahier des charges technique et fonctionnel pour la création du site web de Tapis Rouge Pro. Il vise à établir une plateforme en ligne moderne, performante et facile à gérer, capable de présenter les services de l'entreprise et d'engager les clients de manière efficace. Toutes les spécifications détaillées ci-dessous doivent être implémentées pour garantir un produit final conforme aux attentes.

## 2. Objectifs du Projet

L'objectif principal est de développer un site web statique, entièrement responsive, qui offre une expérience utilisateur fluide et intuitive. Le site doit permettre la présentation des services de Tapis Rouge Pro, la collecte de demandes de devis et de contact, et une gestion dynamique du contenu via une interface d'administration dédiée.

## 3. Structure et Design du Site (Frontend)

### 3.1. Pages Principales

Le site sera composé des pages suivantes, chacune avec son propre fichier HTML et JavaScript pour une modularité optimale :

*   **Accueil (`index.html`)**: Page d'atterrissage présentant l'entreprise, ses services clés, des témoignages, une section FAQ et des appels à l'action.
*   **À propos (`about.html`)**: Détails sur l'histoire, la mission, les valeurs et l'équipe de Tapis Rouge Pro.
*   **Services (`services.html`)**: Présentation exhaustive de tous les services offerts, avec des descriptions détaillées.
*   **Blog (`blog.html`)**: Section dédiée aux articles d'information, conseils ou actualités de l'entreprise.
*   **Contact (`contact.html`)**: Formulaire de contact, coordonnées complètes et horaires d'ouverture.
*   **Obtenir une soumission (`quote.html`)**: Formulaire détaillé pour les demandes de devis personnalisés.

### 3.2. Navigation

La navigation sera assurée par un menu principal situé dans l'en-tête (header) du site, comprenant des liens vers toutes les pages principales. Un bouton d'appel à l'action proéminent, intitulé "Obtenez un devis", sera intégré dans l'en-tête et sur la page d'accueil. Le pied de page (footer) inclura des liens de navigation secondaires, les coordonnées et les icônes des réseaux sociaux.

### 3.3. Design et Esthétique

Le design du site sera épuré, professionnel et moderne, avec une attention particulière à l'expérience utilisateur. Les éléments suivants devront être respectés :

*   **Palette de Couleurs**: 
    *   Couleurs principales : `#1b5154` (vert foncé/bleu canard), `#046BD2` (bleu vif).
    *   Couleurs secondaires/d'accentuation : `#fcb900` (jaune doré), `#ff6900` (orange), `#8ed1fc` (bleu clair).
    *   Couleurs neutres : `#ffffff` (blanc), `#f4f0ec` (beige clair), `#eaeaea` (gris très clair), `#32373c` (gris foncé pour le texte).
*   **Typographie**: 
    *   Titres (H1, H2) : Police de type serif, par exemple 'Playfair Display' ou similaire.
    *   Corps de texte et autres éléments : Police de type sans-serif, par exemple 'Source Sans Pro' ou 'Work Sans' ou similaire.
*   **Éléments Visuels et Composants**: 
    *   **Section Hero**: Grande image ou vidéo de fond en pleine largeur avec un titre accrocheur et un sous-titre, ainsi qu'un bouton d'appel à l'action.
    *   **Cartes de Services**: Blocs visuels pour chaque service, incluant une icône ou une petite image, un titre et une brève description, avec un lien "En savoir plus".
    *   **Section FAQ**: Accordéon interactif pour afficher/masquer les réponses aux questions fréquentes.
    *   **Formulaires**: Champs de saisie clairs, étiquettes explicites, validations côté client et messages d'erreur stylisés.
    *   **Galerie d'Images**: Section présentant des images des réalisations de Tapis Rouge Pro, avec une mise en page attrayante.
    *   **Icônes**: Utilisation d'icônes pertinentes pour illustrer les avantages, les services et les coordonnées.

### 3.4. Responsive Design

Le site doit être entièrement adaptatif et offrir une expérience utilisateur optimale sur tous les types d'appareils (ordinateurs de bureau, tablettes, smartphones). La mise en page, les images et les éléments interactifs devront s'ajuster dynamiquement à la taille de l'écran. Des points de rupture CSS devront être définis pour les résolutions courantes.

## 4. Spécifications Techniques

### 4.1. Technologies Frontend

*   **HTML5**: Structure sémantique du contenu.
*   **CSS3**: Styles et mise en page, incluant des animations subtiles et des transitions pour améliorer l'expérience utilisateur.
*   **JavaScript**: Interactivité côté client. Chaque page (`.html`) aura son propre fichier JavaScript (`.js`) associé, et des scripts globaux pourront être utilisés pour des fonctionnalités transversales.

### 4.2. Base de Données

**Firebase Firestore** sera utilisé comme base de données pour stocker et gérer tout le contenu dynamique du site, y compris :

*   Les détails des services (titre, description, contenus,...).
*   Les articles de blog (titre, contenu, auteur, date,...).
*   Les demandes de contact et de soumission reçues via les formulaires.
*   Les éléments de la FAQ (questions, réponses).
*   Les témoignages clients.
*   Les informations de contact (adresse, téléphones, horaires).

### 4.3. Gestion des Images

**Cloudinary** sera intégré pour la gestion complète des images du site. Cela inclut :

*   Le stockage sécurisé des images.
*   utilisation des images de services, blog,.... (depuis la page Galerie dans admin)
*   L'optimisation automatique des images (compression, formats modernes).
*   La possibilité de manipuler les images (recadrage, filtres) via l'API de Cloudinary.

### 4.4. Architecture du Site

Le site sera une **application web statique**. Les fichiers HTML, CSS et JavaScript seront générés et déployés sur un serveur web. Le contenu dynamique sera chargé asynchrone via des appels API RESTful à Firebase Firestore. Cela garantit une haute performance, une sécurité accrue et des coûts d'hébergement réduits.

## 5. Fonctionnalités Détaillées

### 5.1. Site Public

*   **Page d'Accueil (`index.html`)**:
    *   **Section Hero**: Image/vidéo de fond, titre principal, sous-titre, bouton "Obtenez un devis".
    *   **Présentation des Services**: Aperçu des services clés avec des cartes cliquables.
    *   **Section "Qui nous sommes"**: Texte de présentation de l'entreprise.
    *   **Avantages Clés**: Liste des bénéfices pour le client (produits écologiques, flexibilité, etc.) avec icônes.
    *   **Galerie**: Carrousel ou grille d'images des réalisations.
    *   **FAQ**: Section interactive avec questions/réponses.
    *   **Appel à l'action final**: Bloc avec un message engageant et un bouton "Contactez-nous".
*   **Page "À propos" (`about.html`)**:
    *   Titre principal et texte détaillé sur l'entreprise.
    *   Sections sur la mission, la vision, les valeurs.
    *   Historique de l'entreprise.
    *   Présentation de l'équipe (facultatif, si le contenu est fourni).
*   **Page "Services" (`services.html`)**:
    *   Liste complète des services, chacun avec un titre, une description et une image/icône.
    *   Possibilité de filtrer ou de catégoriser les services (ex: résidentiel, commercial, spécialisé).
    *   Pour chaque service, un lien "En savoir plus" menant à une ancre ou une modale avec plus de détails.
*   **Page "Blog (`blog.html`)**:
    *   Liste des articles de blog, affichés sous forme de cartes (titre, image d'aperçu, extrait, date de publication).
    *   Chaque carte doit être cliquable et mener à une page de détail d'article (`blog-detail.html?id=X`).
    *   **Page de Détail d'Article**: Affichage du contenu complet de l'article, images intégrées, et potentiellement une section de commentaires (si requis ultérieurement).
*   **Page "Contact" (`contact.html`)**:
    *   Formulaire de contact : Nom complet, Numéro de Téléphone (optionnel), Courriel, Objet (liste déroulante : Demande d'information, Demande de soumission, Autre), Message.
    *   Informations de contact : Adresse physique, numéros de téléphone, adresses e-mail.
    *   Horaires d'ouverture.
    *   Liens vers les profils de réseaux sociaux (Facebook, Instagram, LinkedIn, etc.).
    *   Carte interactive (Google Maps) de l'emplacement de l'entreprise.
*   **Page "Obtenir une soumission" (`quote.html`)**:
    *   Formulaire détaillé incluant :
        *   Informations client : Prénom, Nom, Nom de l'entreprise (optionnel).
        *   Type d'entreprise/établissement (liste déroulante : Édifices de bureau, Centre commerciaux, Établissement d'enseignements, Établissement de santé, Résidentiel, Autre).
        *   Courriel, Téléphone.
        *   Langue de communication préférée (cases à cocher : Français, Anglais).
        *   Description des services requis (cases à cocher multiples : Entretien général, Entretien des planchers, Désinfection, Nettoyage bureau, Nettoyage salle de bain, etc.).
        *   Champ texte libre pour "Autres services à préciser".
        *   Taille de la surface (en pieds carrés).
        *   Secteur désiré (cases à cocher multiples : Centre-ville de Montréal, Laval, Longueuil, Repentigny, Terrebonne, Autres).
        *   Nombre de jours/semaine pour le service.
        *   Produits et équipements fournis par (radio buttons : Tapis Rouge Pro, Client).
        *   Champ texte libre pour un message additionnel.
    *   Bouton "Soumettre".

### 5.2. Partie Administration (`tprouge-ad.html`)

Une interface d'administration sécurisée sera développée pour permettre la gestion complète du contenu du site. Elle sera accessible via le fichier `tprouge-ad.html` et ses scripts JavaScript dédiés. Les fonctionnalités incluront :

*   **Authentification**: Système de connexion/déconnexion sécurisé pour les administrateurs stocker dans la base de données et gérer depuis la page paramètres.
*   **Tableau de Bord**: Vue d'ensemble des statistiques clés (nombre de services, articles de blog, nouvelles demandes) et accès rapide aux sections de gestion.
*   **Gestion des Services**: 
    *   Interface CRUD (Créer, Lire, Mettre à jour, Supprimer) pour les services.
    *   Champs pour : Titre, Description longue, Icône (upload via Cloudinary), Image principale (upload via Cloudinary), Catégorie.
*   **Gestion des Articles de Blog**: 
    *   Interface CRUD pour les articles de blog.
    *   Champs pour : Titre, Contenu (éditeur de texte riche), Auteur, Date de publication, Image d'aperçu (upload via Cloudinary), Images intégrées dans le contenu (upload via Cloudinary).
*   **Gestion des Demandes**: 
    *   Liste des demandes de contact et de soumission reçues, avec filtres et options de tri.
    *   Affichage détaillé de chaque demande.
    *   Possibilité de marquer une demande comme "traitée" ou "en attente".
*   **Gestion des Contenus Statiques**: 
    *   Interface pour modifier les textes et images des sections clés des pages (ex: texte de la section Hero, texte "À propos", éléments de la FAQ, témoignages).
    *   Upload d'images via Cloudinary pour ces sections.
*   **Gestion des Utilisateurs (Admin) dont la page sera nommé paramètres**: 
    *   Interface CRUD pour les comptes administrateurs (ajout, modification, suppression) avec gestion des rôles (si plusieurs niveaux d'accès sont envisagés).
    *    gestion des information de l'entreprise

*   **Gestion des images dont la page sera nommé Galerie**:
    *  ajoute des images
    *  gestion des images aussi

## 6. Performance et SEO

*   **Optimisation des Images**: Toutes les images seront traitées et optimisées via Cloudinary pour des temps de chargement rapides.
*   **Minification**: Les fichiers CSS et JavaScript seront minifiés pour réduire la taille des ressources.
*   **Chargement Asynchrone**: Le contenu dynamique sera chargé de manière asynchrone pour ne pas bloquer le rendu initial de la page.
*   **SEO Friendly**: Le site sera construit avec une structure HTML sémantique, des balises méta appropriées (titre, description, mots-clés), des URL conviviales et un fichier `sitemap.xml`.

## 7. Sécurité

*   **Authentification Admin**: La partie administration sera protégée par un système d'authentification robuste  les données seront stocker dans la base de données firestore avec gestion des sessions.
*   **Règles Firestore**: Des règles de sécurité strictes seront configurées dans Firebase Firestore pour contrôler l'accès aux données et prévenir les accès non autorisés.
*   **Validation des Formulaires**: Toutes les entrées des formulaires (contact, soumission) seront validées côté client et côté serveur (via Firebase Functions si nécessaire) pour prévenir les injections et les données malveillantes.

## 8. Livrables

À la fin du projet, les livrables suivants seront fournis :

*   L'ensemble des fichiers sources du site web (HTML, CSS, JavaScript) pour le frontend public.
*   L'ensemble des fichiers sources de la partie administration (`tprouge-ad.html` et ses scripts associés).
*   La configuration complète de Firebase (règles Firestore, structure de la base de données).
*   La configuration de Cloudinary.
*   Une documentation technique succincte expliquant l'architecture du site et les procédures de déploiement et de maintenance.

## 9. Conclusion

Ce cahier des charges fournit une feuille de route claire pour le développement du site web de Tapis Rouge Pro. En suivant ces spécifications, nous assurerons la création d'une plateforme numérique de haute qualité, répondant aux besoins de l'entreprise et offrant une expérience utilisateur exceptionnelle.
