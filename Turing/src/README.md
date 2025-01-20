### Documentation technique détaillée
Ce document présente une documentation approfondie des techniques utilisées dans l'application, expliquant à la fois les choix de structure, de style et les principes fondamentaux qui permettent de créer un simulateur de machine de Turing interactif.
### 1. **Points clés de la structure Angular**
#### a. **Composant principal `DemoComponent`**
Le composant central gère à la fois la logique et l'interface utilisateur. Il utilise :
- **Directives conditionnelles et structurelles** :
  - `*ngIf`: Permet d'afficher ou de masquer dynamiquement des sections de l'interface en fonction de l'état de l'application (comme le fichier chargé ou le tableau des transitions).
  - `*ngFor`: Sert à parcourir et afficher dynamiquement les listes (comme les symboles de l'alphabet ou les transitions de la machine).

- **Binding bidirectionnel** :
  - Avec `[(ngModel)]`, les champs d'entrée utilisateur comme `tapeInput` sont synchronisés bidirectionnellement avec les données du composant, facilitant l'interaction avec l'utilisateur.

#### b. **Bootstrap de l'application avec Angular**
Le fichier `main.ts` utilise la méthode `bootstrapApplication` pour initialiser l'application Angular avec le composant principal (`DemoComponent`) et sa configuration (`appConfig`).
#### c. **Modules Angular utilisés**
- **FormsModule** : Nécessaire pour les formulaires et le binding bidirectionnel (`[(ngModel)]`).
- **NgForOf, NgIf, NgClass** : Fournissent des fonctionnalités de manipulation conditionnelle et dynamique du DOM.

### 2. **Gestion des fichiers d'entrée `.mt`**
#### a. **Vérification et lecture du fichier**
Lorsqu'un fichier est sélectionné par l'utilisateur :
- La méthode `onFileSelect()` :
  - Vérifie que le fichier est au format `.mt`.
  - Stocke le fichier dans la variable `selectedFile`.

- La méthode `onUpload()` :
  - Lit le contenu avec `FileReader`.
  - Appelle `parseFileContent()` pour analyser le contenu et structurer les données en sections, selon des balises spécifiques comme :
``` plaintext
    /** Transitions **/
    état,symbole->étatSuivant,symboleEcrit,direction
```
- Si le fichier est correctement structuré, le tableau des transitions est généré.

#### b. **Structure attendue d'un fichier `.mt`**
Voici un exemple de format valide :
``` plaintext
/** Transitions **/
q0,0->q1,1,R
q1,1->q2,0,L

/** Tape alphabet **/
0
1

/** Initial state **/
q0
```
Chaque section est identifiée par des balises spécifiques (`/** Section **/`). Les transitions et les autres données sont regroupées sous leur section respective.
#### c. **Génération du tableau des transitions**
Les données dans la section `Transitions` sont analysées et converties en une structure adaptée au tableau HTML. Exemple :
``` typescript
[
  { state: "q0", transitions: ["q1, 1, R"] },
  { state: "q1", transitions: ["q2, 0, L"] }
]
```
Cela permet de remplir dynamiquement les colonnes et cellules à l'aide de `*ngFor`.
### 3. **Simulation de la machine de Turing**
L'application implémente les étapes classiques de la simulation d'une machine de Turing.
#### a. **Initialisation**
La fonction `initializeSimulation()` configure :
- Le ruban :
  - Ajout de symboles blancs (`#`) au début et à la fin de l'entrée utilisateur.
  - Conversion de l'entrée utilisateur (`tapeInput`) en tableau (`tape`).

- L'état initial (`currentState`).
- Les états finaux (`finalStates`).

Exemple : Avec une entrée `101`, le ruban devient :
``` typescript
tape = ["#", "1", "0", "1", "#"];
```
#### b. **Exécution de la simulation**
Les fonctions principales utilisées ici sont :
- **`simulateStep()`** :
  - Cette fonction applique une transition à la machine pour une seule étape :
    - Lit le symbole sous la tête.
    - Trouve la règle de transition pour l'état actuel et le symbole lu.
    - Met à jour l'état, le ruban et la position de la tête suivant la transition.

Exemple de transition : `q0,0 -> q1,1,R` :
- `q0` (état courant) et `0` (symbole lu).
- État suivant : `q1`.
- Écriture : remplace `0` par `1` sur le ruban.
- Déplacement : déplace la tête vers la droite (R).

- **`simulateAll()`** :
  - Appelle `simulateStep()` en boucle jusqu'à atteindre un état final ou une erreur.
  - Vérifie à chaque étape si la machine s'est arrêtée.

#### c. **États finaux**
La méthode `isFinalState()` vérifie si l'état courant est dans la liste des états finaux (`finalStates`).
### 4. **Interface utilisateur (CSS et DOM)**
L'interface est conçue pour être intuitive et accessible.
#### a. **Styles de base**
- **Police et arrière-plan** :
  - Une image inspirée d'Alan Turing est utilisée comme fond d'écran, centrée et redimensionnée pour couvrir l'écran. Exemple CSS :
``` css
    body {
      font-family: Arial, sans-serif;
      background-image: url("../assets/alan-turing-and-turing-machine.jpg");
      background-size: cover;
      background-position: center;
    }
```
- **Container centré** :
  - Le conteneur principal utilise `flexbox` pour centrer les éléments sur la page :
``` css
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
```
#### b. **Ruban de la machine**
Le ruban est affiché sous forme de cases successives avec des symboles. La cellule sous la "tête de lecture" est mise en avant avec une classe CSS spécifique :
``` css
.tape-visualization span.head {
  background-color: #4caf50; /* Vert clair */
  color: white;
}
```
#### c. **Tableau des transitions**
Le tableau est stylisé pour une meilleure lisibilité :
- Couleurs d'en-tête et de survol.
- Bords arrondis et ombres portées.
- Mise en évidence de la cellule correspondant à la transition en cours :
``` css
    .highlight-cell {
      background-color: #ffeb3b; /* Jaune clair */
      font-weight: bold;
    }
```
### 5. **Points techniques avancés**
#### a. **Utilisation de `FileReader`**
Le fichier `.mt` est lu de manière asynchrone avec `FileReader.readAsText()`, ce qui permet une interaction utilisateur fluide sans bloquer le fil principal.
#### b. **Données dynamiques et DOM virtuel**
Angular utilise un DOM virtuel ; les modifications comme la mise à jour du ruban ou des transitions ne nécessitent pas d'ajouts manuels dans le DOM. Par exemple, les bindings avec `*ngFor` et `*ngIf` rendent l'affichage réactif en synchronisant les données directement avec le DOM visuel.
#### c. **Gestion des erreurs et validité**
- Toutes les entrées sont vérifiées pour éviter les erreurs d'exécution :
  - Validation des fichiers (`.mt` uniquement).
  - Vérification de la structure des transitions.
  - Gestion des cas où aucune transition n'est possible pour un état donné.

### 6. **Résumé**
L'application repose sur une combinaison de techniques modernes d'Angular et d'éléments classiques de la simulation d'une machine de Turing. Les points clés comprennent la modularité, la gestion asynchrone des fichiers, une interface utilisateur intuitive et une simulation entièrement configurable. Ces techniques assurent un haut niveau de maintenabilité et d'extensibilité pour répondre aux futures évolutions du projet.
