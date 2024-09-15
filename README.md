# Usage

Cette extension Chrome permet aux utilisateurs de sélectionner des éléments sur une page web et de modifier leur couleur de fond de manière aléatoire.

## Prérequis

- **Node.js** (version 14 ou supérieure)

## Technologies utilisées

- **React.js**

### Choix technique

J'ai choisi **React** pour la création de cette extension pour les raisons suivantes :

- **Structure claire** : React apporte une architecture basée sur des composants, ce qui permet de mieux organiser le projet.
- **Gestion des états** : Sa capacité à gérer les états facilite la gestion d'éléments dynamiques, comme le bouton d'activation du mode de sélection.
- **Évolutivité** : React est facile à faire évoluer, ce qui permet d'ajouter de nouvelles fonctionnalités à l'avenir.

## Installation

1. Installer les dépendances :

   ```bash
   npm install

2. Compiler l'extension :

    ```bash
    npm run build

3. Ouvrir Chrome et accéder à chrome://extensions/.

4. Activer le mode développeur.

5. Charger l'extension non empaquetée :

6. Cliquer sur le bouton "Charger l'extension non empaquetée" et sélectionner le dossier build du projet généré par la commande npm run build.
