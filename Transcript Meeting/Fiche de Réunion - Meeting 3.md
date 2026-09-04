# **Compte Rendu \- Suivi Technique (Meeting 3 pur)**

## **1\. Introduction**

Ce document consigne uniquement les nouveautés, ajustements et retours techniques discutés lors de la session de suivi 3, en excluant tout élément des réunions antérieures.

## **2\. Interface Organisateur & Formulaire d'Événement**

> * **Workflow de Création :** Amélioration de l'ergonomie des étapes (Steps) lors de la création d'un événement.  
> * **Localisation & Parking :** Ajout des champs obligatoires pour l'adresse sur la carte (Google Maps) et le lien du parking avec positionnement dédié.  
> * **Propriété de l'Événement :** Chaque événement doit obligatoirement être rattaché à l'organisateur connecté.

## **3\. Restauration & Gestion des Menus**

> * **Choix de Restauration :** Possibilité de configurer plusieurs options (Buffet libre, Service à table, ou Mixte).  
> * **Gestion des Plats & Upload :** Nécessité d'ajouter un module d'upload d'images pour les plats personnalisés (sans liens externes depuis Internet) et prise en compte de la taille des fichiers.

## **4\. Gestion des Invités & Invitations**

> * **Tableau de Bord des Invités :** Affichage global des invités avec pagination et boutons de navigation rapide (filtrage par statuts : en attente, confirmés, déclinés).  
> * **Sécurité des Liens d'Invitation :**  
  * Masquage des identifiants numériques directs (remplacement par un système de cryptage/tokens pour éviter l'estimation du nombre total d'invités).  
  * Expiration programmée des liens d'invitation après la date de l'événement.  
  * Ajout d'une option de désinscription ou de signalement d'erreur (ex: mauvais destinataire).  
> * **Parcours de Confirmation (RSVP) :** L'invité peut visualiser le menu détaillé, choisir ses préférences (halal, végétarien, sans sucre) et déclarer ses allergies via un champ de texte libre. Bouton "Accepter" mis en valeur (70% de l'espace) par rapport à "Décliné" (30%).

## **5\. Module Financier**

> * **Paiements & Abonnements :** Mise en suspens temporaire de la logique de facturation/paiement des abonnements pour prioriser les fonctionnalités métiers.  
> * **Suivi des Règlements Événement :** Saisie libre des acomptes (Espèces ou Virement) avec affichage clair du montant total, du montant réglé et du reste à payer.