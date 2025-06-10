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
          // Get the most recent game (assuming sorted by date descending, otherwise sort)
          const lastGame = statsArray
            .filter(stat => !stat.isTotal)
            .sort((a, b) => (b.date ? new Date(b.date).getTime() : 0) - (a.date ? new Date(a.date).getTime() : 0))[0];

          if (lastGame && lastGame.heatmapData) {
            const sorted = lastGame.heatmapData
              .filter(item => item.keyCode.startsWith('Key'))
              .sort((a, b) => b.errorFrequency - a.errorFrequency)
              .slice(0, 5);

            this.topMissedLetters = sorted.map(item => ({
              key: item.keyCode.replace('Key', ''),
              label: item.keyCode.replace('Key', '')
            }));
          } else {
            this.topMissedLetters = [];
          }
        } else {
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


  onToggleChange(notion: keyof UserConfig, value: boolean): void {
    console.log(`Toggle change - ${notion}:`, value);
    this.currentConfig = {
      ...this.currentConfig,
      [notion]: value
    };
    this.questionConfigService.updateNotion(notion, value);
    console.log('After toggle - Current config:', this.currentConfig);
    // Force UI update - with proper type casting
    /*const allToggles = document.querySelectorAll('.settings-toggle');
    allToggles.forEach(toggle => {
      // Properly cast to HTMLElement to access style property
      const toggleEl = toggle as HTMLElement;
      const display = toggleEl.style.display;
      toggleEl.style.display = 'none';
      setTimeout(() => toggleEl.style.display = display, 0);
    });
    */
    // Also force Angular change detection
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

  onFrequencyInput(input: HTMLInputElement, key: string) {
    const value = input.value;
    // Allow empty (for backspace), or valid float
    if (!/^\d*\.?\d*$/.test(value) && value !== '') {
      alert('seul les caracteres numeriaues sont autorisées');
      input.value = value.replace(/[^0-9.]/g, '');
    }
    this.onQuestionFrequencyChange(key, input.value);
  }


}

