import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {QuestionConfig, QuestionConfigService} from 'src/app/shared/services/question-config.service';
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {User} from "../../../shared/models/user.model";
import {UserService} from "../../../shared/services/user.service";


@Component({
  selector: 'app-ergo-config-selected-page',
  templateUrl: './ergo-config-selected-page.component.html',
  styleUrl: './ergo-config-selected-page.component.scss'
})
export class ErgoConfigSelectedPageComponent implements OnInit, OnDestroy{
  public currentConfig: QuestionConfig;
  public selectedUser?: User;
  private configSubscription!: Subscription;
  private userSubscription!: Subscription;
  saveConfirmationVisible: boolean = false;

  availableOperations = [
    { key: 'addition', label: 'Addition' },
    { key: 'subtraction', label: 'Soustraction' },
    { key: 'multiplication', label: 'Multiplication' },
    { key: 'division', label: 'Division' }
  ];


  constructor(
    private questionConfigService: QuestionConfigService,
    private userService: UserService,
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
    });

    // Subscribe to config changes
    this.configSubscription = this.questionConfigService.getConfig().subscribe(config => {
      this.currentConfig = { ...config };
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


  onToggleChange(notion: keyof QuestionConfig, value: boolean): void {
    console.log(`Toggle change - ${notion}:`, value);
    this.currentConfig = {
      ...this.currentConfig,
      [notion]: value
    };
    this.questionConfigService.updateNotion(notion, value);
    console.log('After toggle - Current config:', this.currentConfig);
    // Force UI update - with proper type casting
    const allToggles = document.querySelectorAll('.settings-toggle');
    allToggles.forEach(toggle => {
      // Properly cast to HTMLElement to access style property
      const toggleEl = toggle as HTMLElement;
      const display = toggleEl.style.display;
      toggleEl.style.display = 'none';
      setTimeout(() => toggleEl.style.display = display, 0);
    });
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
    return this.currentConfig[key as keyof QuestionConfig] === true;
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
    this.onToggleChange(value as keyof QuestionConfig, !isCurrentlySelected);

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
    this.onToggleChange(key as keyof QuestionConfig, false);
  }


  onSaveConfig(): void {
    console.log('Saving config:', this.currentConfig);
    this.questionConfigService.updateConfig(this.currentConfig);
    this.saveConfirmationVisible = true;
    setTimeout(() => {
      this.saveConfirmationVisible = false;
    }, 3000);

  }


  get userIconPath(): string {
    return `assets/images/child-pps/${this.selectedUser?.icon || 'pp-9.png'}`;
  }


}

