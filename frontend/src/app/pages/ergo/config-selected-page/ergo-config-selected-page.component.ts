import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {QuestionConfig, QuestionConfigService} from 'src/app/shared/services/question-config.service';
import {Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-ergo-config-selected-page',
  templateUrl: './ergo-config-selected-page.component.html',
  styleUrl: './ergo-config-selected-page.component.scss'
})
export class ErgoConfigSelectedPageComponent implements OnInit, OnDestroy{
  public currentConfig: QuestionConfig;
  private subscription!: Subscription;


  constructor(
    private questionConfigService: QuestionConfigService,
    private router: Router,
  private cdr: ChangeDetectorRef

) {
    this.currentConfig = this.questionConfigService.getCurrentConfig();
    console.log('Constructor - Initial config:', this.currentConfig);


  }
  ngOnInit() {
    this.loadSavedConfig();

    this.subscription = this.questionConfigService.getConfig().subscribe(config => {
      this.currentConfig = { ...config };
      this.cdr.detectChanges();

    });
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);

  }
  private loadSavedConfig() {
    // Explicitly load the saved config from localStorage
    const config = this.questionConfigService.getCurrentConfig();
    console.log('OnInit subscription - Received config:', config);

    this.currentConfig = { ...config };
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
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


  onSaveConfig(): void {
    console.log('Saving config:', this.currentConfig);
    this.questionConfigService.updateConfig(this.currentConfig);
    this.router.navigate(['/ergo-config']);

  }


}

