import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  Renderer2
} from '@angular/core';

@Component({
  selector: 'app-settings-toggle',
  templateUrl: './settings-toggle.component.html',
  styleUrl: './settings-toggle.component.scss'
})
export class SettingsToggleComponent implements OnChanges, OnInit {
  @Input() checked = false;
  @Output() valueChange = new EventEmitter<boolean>();
  @ViewChild('toggleLabel') toggleLabel: ElementRef | undefined;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    console.log('Toggle Init - checked value:', this.checked);
  }

  ngAfterViewInit() {
    this.updateClassState();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['checked']) {
      console.log('Toggle received checked:', changes['checked'].currentValue);
      // Wait until after view rendering then update
      setTimeout(() => this.updateClassState(), 0);
    }
  }

  private updateClassState() {
    if (this.toggleLabel) {
      if (this.checked) {
        this.renderer.addClass(this.toggleLabel.nativeElement, 'activate');
        console.log('Added activate class to toggle');
      } else {
        this.renderer.removeClass(this.toggleLabel.nativeElement, 'activate');
        console.log('Removed activate class from toggle');
      }
    }
  }

  onInputChange(event: Event) {
    const newValue = (event.target as HTMLInputElement).checked;
    this.valueChange.emit(newValue);
  }
}
