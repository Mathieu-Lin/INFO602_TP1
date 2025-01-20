import { Component } from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

@Component({
  selector: 'app-root',
  template: `
    <div class="file-upload-container">
      <!-- Affichage conditionnel : si le fichier est non chargé -->
      <div *ngIf="!dictionary">
        <p>↓ Saisir votre fichier .mt ↓</p>
        <input type="file" id="fileInput" (change)="onFileSelect($event)"/>
        <button (click)="onUpload()">Upload</button>
      </div>

      <!-- Affichage du contenu du fichier après l'upload -->
      <div *ngIf="dictionary" class="file-content">
        <!-- Affichage du tableau des transitions pour la section "Transitions" -->
        <div class="transitions" *ngIf="transitionsTable">
          <h4>Tableau des Transitions :</h4>
          <table class="transitions-table">
            <thead>
            <tr>
              <th class="header-cell">État</th>
              <th class="header-cell" *ngFor="let symbol of inputSymbols">{{ symbol }}</th>
            </tr>
            </thead>
            <tbody>
            <tr *ngFor="let row of transitionsTable">
              <td class="state-cell">{{ row.state }}</td>
              <td
                class="transition-cell"
                *ngFor="let transition of row.transitions; let colIdx = index"
                [ngClass]="{'highlight-cell': isHighlighted(row.state, colIdx)}">
                {{ transition }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="simulation-container" *ngIf="dictionary">
        <h4>Simulation :</h4>

        <div>
          <label for="tapeInput">Entrée du ruban :</label>
          <input id="tapeInput" [(ngModel)]="tapeInput" placeholder="101+110" />
          <button (click)="initializeSimulation()">Démarrer la simulation</button>
        </div>

        <div *ngIf="tape.length > 0">
          <h4>Ruban :</h4>
          <div class="current-state">
            <span><strong>État courant :</strong> {{ currentState }}</span><br>
            <span><strong>État final :</strong> {{ finalStates }}</span>
          </div>

          <div class="tape-visualization">
    <span *ngFor="let cell of tape; let idx = index"
          [class.head]="idx === headPosition">{{ cell }}</span>
          </div>

          <button (click)="simulateStep()">Étape suivante</button>
          <button (click)="simulateAll()">Exécuter tout</button>
        </div>
      </div>

    </div>
  `,
  imports: [
    NgIf,
    NgForOf,
    FormsModule,
    NgClass
  ],
  styleUrls: ['./styles.css']
})
export class DemoComponent {
  selectedFile: File | null = null;
  dictionary: { sections: Record<string, any[]>; comments: string[] } | null = null;
  transitionsTable: { state: string; transitions: string[] }[] | null = null;
  inputSymbols: string[] = []; // Les symboles d'entrée
  currentState: string = ''; // L'état courant de la machine.
  tape: string[] = []; // Le ruban sous forme d'un tableau de caractères.
  headPosition: number = 0; // Position de la tête sur le ruban.
  tapeInput: string = '';
  finalStates: string[] = []; // Liste des états finaux

  objectKeys = Object.keys; // Utilisé pour parcourir les sections

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Vérifiez le format du fichier
      if (!this.selectedFile.name.endsWith('.mt')) {
        alert('Veuillez sélectionner un fichier .mt uniquement.');
        this.selectedFile = null;
      }
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      alert('Aucun fichier sélectionné ou fichier invalide.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result as string;
      this.dictionary = this.parseFileContent(content); // Analyse le fichier et l'assigne

      if (this.dictionary) {
        this.generateTransitionsTable(); // Générez le tableau des transitions
      }

      // Si le fichier est vide ou mal structuré
      if (!this.dictionary || Object.keys(this.dictionary.sections).length === 0) {
        alert('Le fichier est vide ou mal formaté.');
        this.dictionary = null; // Réinitialiser
      }
    };

    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier.');
    };

    reader.readAsText(this.selectedFile);
  }

  parseFileContent(content: string): { sections: Record<string, any[]>; comments: string[] } {
    const lines = content.split('\n').map(line => line.trim());
    const sections: Record<string, any[]> = {};
    const comments: string[] = [];
    let currentSection: string | null = null;

    lines.forEach(line => {
      if (!line) return;
      if (line.startsWith('**/') && line.endsWith('/**')) {
        comments.push(line.slice(2, -2).trim());
        return;
      }

      if (line.startsWith('/**') && line.endsWith('**/')) {
        currentSection = line.slice(3, -3).trim();
        sections[currentSection] = [];
        return;
      }

      if (currentSection && sections[currentSection]) {
        sections[currentSection].push(line);
      }
    });

    return { sections, comments };
  }

  generateTransitionsTable(): void {
    const transitionsSection = this.dictionary?.sections['Transitions'];
    const tapeAlphabetSection = this.dictionary?.sections['Tape alphabet'];

    // Vérifiez si la section "Transitions" et "Tape alphabet" existe
    if (!transitionsSection || !tapeAlphabetSection) {
      this.transitionsTable = null;
      return;
    }

    // Obtenir le Tape Alphabet (colonnes du tableau)
    this.inputSymbols = tapeAlphabetSection; // Remplace Input symbols par Tape alphabet

    // Extraire les transitions et les organiser par état
    const transitionsByState: Record<string, Record<string, string>> = {};

    transitionsSection.forEach(transition => {
      // Décomposez chaque transition "etat,symbole->etatSuivant,symboleEcrit,Déplacement"
      const [currentState, symbolToRead, nextState, symbolToWrite, move] = transition
        .replace(/->/g, ',') // Remplace "->" par une virgule pour simplifier l'analyse
        .split(',');

      // Initialiser l'état si nécessaire
      if (!transitionsByState[currentState]) {
        transitionsByState[currentState] = {};
      }

      // Ajouter la transition pour le symbole lu
      transitionsByState[currentState][symbolToRead] = `${nextState}, ${symbolToWrite}, ${move}`;
    });

    // Construire les données formatées pour le tableau HTML
    this.transitionsTable = Object.keys(transitionsByState).map(state => {
      const transitions = this.inputSymbols.map(
        symbol => transitionsByState[state][symbol] || '' // Affiche une cellule vide si aucune transition
      );
      return { state, transitions };
    });
  }

  simulateStep(): boolean {
    if (!this.currentState || !this.transitionsTable || this.headPosition < 0) {
      alert('Erreur : Initialisation incorrecte ou machine dans un état invalide.');
      return false;
    }

    // Si l'état actuel est un état final, la machine s'arrête
    if (this.isFinalState()) {
      alert(`La machine est terminée avec succès dans l'état final : ${this.currentState}`);
      return false; // Arrêtez la simulation ici
    }

    const currentSymbol = this.tape[this.headPosition] || '#'; // Lit le symbol du ruban
    const currentStateTransitions = this.transitionsTable.find(t => t.state === this.currentState);

    if (!currentStateTransitions) {
      alert(`Erreur : Aucune transition trouvée pour l'état ${this.currentState}`);
      return false;
    }

    // Obtenez la transition pour le symbole lu
    const transitionIndex = this.inputSymbols.indexOf(currentSymbol);
    const transition = currentStateTransitions.transitions[transitionIndex];

    if (!transition) {
      alert(`Erreur : Transition introuvable pour l'état ${this.currentState} et le symbole ${currentSymbol}`);
      return false;
    }

    const [nextState, writeSymbol, move] = transition.split(',');

    // Modifier le ruban, changer l'état, et bouger la tête
    this.tape[this.headPosition] = writeSymbol.trim();
    this.currentState = nextState.trim();

    // Déplacement de la tête
    this.headPosition += move.trim() === 'R' ? 1 : -1;

    return true; // La simulation peut continuer
  }

  simulateAll(): void {
    while (this.simulateStep()) {
      this.logCurrentState();
    }

    // Vérifiez si l'état final est atteint après la boucle
    if (!this.isFinalState()) {
      alert(`Erreur : La machine s'est arrêtée dans l'état ${this.currentState}, qui n'est pas un état final.`);
      return;
    } else {
      alert('Simulation terminée avec succès ! Ruban final : ' + this.tape.join(''));
    }

  }

  logCurrentState(): void {
    console.log(`État courant : ${this.currentState}`);
    console.log(`Ruban : ${this.tape.join('')}`);
    console.log(`Position de la tête : ${this.headPosition}`);
  }


  initializeSimulation(): void {
    if (!this.tapeInput || !this.dictionary?.sections['Initial state'] || !this.dictionary?.sections['Final states']) {
      alert('Veuillez fournir un ruban valide, un état initial et des états finaux dans la configuration.');
      return;
    }

    // Ajout des symboles blancs au début et à la fin du ruban
    const blankSymbol = this.dictionary.sections['Blank symbol'][0]; // Symbole blanc (#)
    this.tape = [blankSymbol, ...this.tapeInput.split(''), blankSymbol];

    this.currentState = this.dictionary.sections['Initial state'][0]; // Premier état initial
    this.headPosition = 1; // Position de départ, juste après le symbole blanc

    this.finalStates = this.dictionary.sections['Final states']; // Liste des états finaux
    console.log('Simulation initialisée avec le ruban :', this.tape.join(''));
  }

  isFinalState(): boolean {
    return this.finalStates.includes(this.currentState);
  }

  isHighlighted(state: string, colIdx: number): boolean {
    const currentSymbol = this.tape[this.headPosition] || '#'; // Lire le symbole sous la tête
    const columnIndex = this.inputSymbols.indexOf(currentSymbol); // Trouver l'index correspondant à ce symbole

    // Vérifiez si nous sommes dans la bonne ligne (état) ET la bonne colonne (symbole correspondant)
    return state === this.currentState && colIdx === columnIndex;
  }
}
bootstrapApplication(DemoComponent);
