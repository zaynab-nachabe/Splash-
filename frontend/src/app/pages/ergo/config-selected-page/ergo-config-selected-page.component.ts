import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UserConfig } from 'src/app/shared/models/user-config.model';
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { User } from "../../../shared/models/user.model";
import { UserService } from "../../../shared/services/user.service";
import { QuestionConfigService } from "../../../shared/services/question-config.service";
import { GameStatisticsService } from "../../../shared/services/game-statistics.service";


@Component({
  selector: 'app-ergo-config-selected-page',
  templateUrl: './ergo-config-selected-page.component.html',
  styleUrl: './ergo-config-selected-page.component.scss'
})
export class ErgoConfigSelectedPageComponent implements OnInit, OnDestroy {
  public currentConfig: UserConfig;
  public selectedUser?: User;
  private configSubscription!: Subscription;
  private userSubscription!: Subscription;
  saveConfirmationVisible: boolean = false;
  showAdvancedStats: boolean = false;
  frequencyWarning: string = '';

  availableOperations = [
    { key: 'addition', label: 'Addition' },
    { key: 'subtraction', label: 'Soustraction' },
    { key: 'multiplication', label: 'Multiplication' },
    { key: 'division', label: 'Division' },
    { key: 'rewrite', label: 'Chiffres' },
    { key: 'encryption', label: 'Caractères spéciaux' },
    { key: 'word', label: 'Mot français' }
  ];

  topMissedLetters: { key: string, label: string }[] = [];

  letterFrequencies: { [key: string]: number } = {};








  constructor(
    private questionConfigService: QuestionConfigService,
    private userService: UserService,
    private gameStatisticsService: GameStatisticsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.currentConfig = this.questionConfigService.getCurrentConfig();
    console.log('Constructor - Initial config:', this.currentConfig);
  }




  ngOnInit() {
    // First, get the selected user
    this.userSubscription = this.userService.selectedUser$.subscribe(user => {
      if (!user) {
        console.error('No user selected, navigating back to user selection');
        this.router.navigate(['/ergo-config']);
        return;
      }

      this.selectedUser = user;
      console.log('Selected user for configuration:', this.selectedUser);


      this.gameStatisticsService.getStatisticsForChild(this.selectedUser.userId).subscribe(statsArray => {
        if (statsArray && statsArray.length > 0) {
          // Sort games by date descending (most recent first)
          const games = statsArray
            .filter(stat => !stat.isTotal)
            .sort((a, b) => (b.date ? new Date(b.date).getTime() : 0) - (a.date ? new Date(a.date).getTime() : 0));

          // Take up to 5 most recent games
          const N = Math.min(5, games.length);
          const weights = [0.4, 0.2, 0.2, 0.1, 0.1].slice(0, N);

          // If fewer than 5 games, redistribute missing weight equally
          if (N < 5) {
            const missingWeight = 1 - weights.reduce((a, b) => a + b, 0);
            for (let i = 0; i < N; i++) {
              weights[i] += missingWeight / N;
            }
          }

          // Aggregate errorFrequency for each letter, weighted
          const letterScores: { [key: string]: number } = {};
          for (let i = 0; i < N; i++) {
            const game = games[i];
            if (game.heatmapData) {
              game.heatmapData
                .filter(item => item.keyCode.startsWith('Key'))
                .forEach(item => {
                  const key = item.keyCode;
                  if (!letterScores[key]) letterScores[key] = 0;
                  letterScores[key] += (item.errorFrequency || 0) * weights[i];
                });
            }
          }

          // Get top 5 letters by weighted errorFrequency
          const sorted = Object.entries(letterScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

          if (sorted.length === 0) {
            // Default letters if none missed
            this.topMissedLetters = [
              { key: 'W', label: 'W' },
              { key: 'Z', label: 'Z' },
              { key: 'Y', label: 'Y' },
              { key: 'K', label: 'K' },
              { key: 'X', label: 'X' }
            ];
          } else {
            this.topMissedLetters = sorted.map(([keyCode]) => ({
              key: keyCode.replace('Key', ''),
              label: keyCode.replace('Key', '')
            }));
          }
        }
        else {
          this.topMissedLetters = [];
        }
        this.cdr.detectChanges();
      });
    });



    // Subscribe to config changes
    this.configSubscription = this.questionConfigService.getConfig().subscribe(config => {
      this.currentConfig = { ...config } as UserConfig;
      console.log('Config loaded:', this.currentConfig);
      this.cdr.detectChanges();
    });




    // Force change detection after a small delay
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }



  ngOnDestroy() {
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }




  onToggleChange(key: string, value: boolean): void {
    const notion = key as keyof UserConfig;
    console.log(`Toggle change - ${notion}:`, value);
    this.currentConfig = {
      ...this.currentConfig,
      [notion]: value
    };

    // If toggled OFF, remove any user-typed frequency for this operation
    if (!value && this.currentConfig.questionFrequency) {
      delete this.currentConfig.questionFrequency[key];
      // Optionally, also update the backend/service
      this.questionConfigService.updateNotion('questionFrequency' as any, { ...this.currentConfig.questionFrequency });
    }

    this.questionConfigService.updateNotion(notion, value);
    console.log('After toggle - Current config:', this.currentConfig);

    this.cdr.detectChanges();
  }


  getSelectedOperations(): string[] {
    return Object.entries(this.currentConfig)
      .filter(([key, value]) => {
        // Only include operation-related config items that are true
        return value === true && this.availableOperations.some(op => op.key === key);
      })
      .map(([key]) => key);
  }

  isOperationSelected(key: string): boolean {
    return this.currentConfig[key as keyof UserConfig] === true;
  }

  getOperationLabel(key: string): string {
    const operation = this.availableOperations.find(op => op.key === key);
    return operation ? operation.label : key;
  }

  // Handle when an operation is selected from the dropdown
  handleOperationSelection(value: string): void {
    if (!value) return;

    // Toggle the operation state using the same callback as toggles
    const isCurrentlySelected = this.isOperationSelected(value);
    this.onToggleChange(value as keyof UserConfig, !isCurrentlySelected);

    // Reset the dropdown to placeholder
    setTimeout(() => {
      const select = document.querySelector('.operations-dropdown') as HTMLSelectElement;
      if (select) {
        select.value = '';
      }
    }, 0);
  }

  toggleOperation(key: string): void {
    // Set it to false (because clicking an active pill means removing it)
    this.onToggleChange(key as keyof UserConfig, false);
  }


  onSaveConfig(): void {
    console.log('Saving config:', this.currentConfig);
    this.questionConfigService.updateConfig(this.currentConfig);
    this.saveConfirmationVisible = true;
    setTimeout(() => {
      this.saveConfirmationVisible = false;
    }, 3000);

  }


  onNombreDeQuestionChange(value: string) {
    const num = Number(value);
    if (!isNaN(num) && num > 0) {
      this.currentConfig.nombresDeQuestion = num;
      this.questionConfigService.updateNotion('nombresDeQuestion' as any, num);
    }

  }

  toggleAdvancedStats() {
    this.showAdvancedStats = !this.showAdvancedStats;
  }

  onQuestionFrequencyChange(key: string, value: string) {
    const floatVal = parseFloat(value);
    if (!this.currentConfig.questionFrequency) {
      this.currentConfig.questionFrequency = {};
    }
    if (!isNaN(floatVal) && floatVal >= 0 && floatVal <= 1) {
      this.currentConfig.questionFrequency[key] = floatVal;
      this.questionConfigService.updateNotion('questionFrequency' as any, { ...this.currentConfig.questionFrequency });
    }

  }

  get userIconPath(): string {
    return `assets/images/child-pps/${this.selectedUser?.icon || 'pp-9.png'}`;
  }



  onNombreDeQuestionInput(input: HTMLInputElement) {
    const value = input.value;
    // Only show alert if a non-digit character is present and the last key was not Backspace
    // But since we can't get the key here, just don't alert if the value is empty (which happens after backspace)
    if (!/^\d*$/.test(value) && value !== '') {
      alert('seul les caracteres numeriaues sont autorisées');
      input.value = value.replace(/\D/g, '');
    }
    this.onNombreDeQuestionChange(input.value);
  }


  /*
  onFrequencyInput(input: HTMLInputElement, key: string) {
    const value = input.value;
    // Allow empty (for backspace), or valid float
    if (!/^\d*\.?\d*$/.test(value) && value !== '') {
      alert('seul les caracteres numeriaues sont autorisées');
      input.value = value.replace(/[^0-9.]/g, '');
    }
    this.onQuestionFrequencyChange(key, input.value);
  }
    */
  onFrequencyInput(input: HTMLInputElement, key: string, type: 'operation' | 'letter') {
    let value = input.value.trim();
    let num = Number(value);
    if (isNaN(num) || value === '') num = 0;

    if (type === 'operation') {
      if (!this.currentConfig.questionFrequency) {
        this.currentConfig.questionFrequency = {};
      }
      // Store as integer (percent)
      this.currentConfig.questionFrequency[key] = num / 100; // If you want to store as float
      // this.currentConfig.questionFrequency[key] = num; // If you want to store as integer

      // Check sum of all operation frequencies
      const sum = Object.values(this.currentConfig.questionFrequency)
        .map(v => typeof v === 'number' ? v * 100 : 0)
        .reduce((a, b) => a + b, 0);

      if (sum !== 100) {
        this.frequencyWarning = 'La somme des fréquences des types de questions doit être inferieur ou égale à 100.';
      } else {
        this.frequencyWarning = '';
      }
      this.questionConfigService.updateNotion('questionFrequency' as any, { ...this.currentConfig.questionFrequency });
    } else if (type === 'letter') {
      // Letter frequencies: 0–100 only
      if (num < 0 || num > 100) {
        this.frequencyWarning = 'La fréquence de chaque lettre doit être comprise entre 0 et 100.';
      } else {
        this.frequencyWarning = '';
      }
      this.letterFrequencies[key] = num;
      // Optionally update wherever you store letter frequencies
    }
  }


  getEffectiveOperationFrequency(opKey: string): number {
    // 1. If toggle is off, frequency is 0
    if (!this.isOperationSelected(opKey)) return 0;

    // 2. If user typed a frequency, use it
    const userValue = this.currentConfig.questionFrequency?.[opKey];
    if (userValue !== undefined && userValue !== null && !isNaN(Number(userValue))) {
      return Math.round(Number(userValue) * 100); // stored as 0-1 float, display as int
    }

    // 3. If toggle is on and no frequency typed, compute automatic frequency
    // Find all toggles ON
    const toggledOn = this.availableOperations.filter(op => this.isOperationSelected(op.key));
    // Find all toggles ON where user did NOT type a frequency
    const missing = toggledOn.filter(op => {
      const val = this.currentConfig.questionFrequency?.[op.key];
      return !(typeof val === 'number' && !isNaN(val));
    });

    // Sum of user-typed frequencies
    const sumTyped = toggledOn
      .map(op => Number(this.currentConfig.questionFrequency?.[op.key]))
      .filter(v => typeof v === 'number' && !isNaN(v))
      .reduce((a, b) => a + b, 0) * 100; // sum as integer

    const Y = missing.length;
    const X = sumTyped;
    if (Y === 0) return 0;
    return Math.max(0, Math.round((100 - X) / Y));
  }


  onMaxWordLengthInput(input: HTMLInputElement) {
  const value = input.value;
  const num = Number(value);
  if (!isNaN(num) && num > 0) {
    this.currentConfig.longueurMaximaleDesMots = num;
    this.questionConfigService.updateNotion('longueurMaximaleDesMots' as any, num);
  }
}

}

