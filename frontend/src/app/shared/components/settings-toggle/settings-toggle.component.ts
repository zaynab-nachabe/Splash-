import { Component, EventEmitter, Input, Output, ElementRef, Renderer2, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-settings-toggle',
  templateUrl: './settings-toggle.component.html',
  styleUrl: './settings-toggle.component.scss'
})
export class SettingsToggleComponent implements OnChanges {
  @Input() checked = false;
  @Output() valueChange = new EventEmitter<boolean>();

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['checked']) {
      this.updateToggleState();
    }
  }

  ngAfterViewInit() {
    this.updateToggleState();
  }

  private updateToggleState() {
    // Get the root element
    const toggleEl = this.el.nativeElement as HTMLElement;

    // Find the label element
    const labelEl = toggleEl.querySelector('label') as HTMLElement;
    if (!labelEl) return;

    // Update the class based on the checked state
    if (this.checked) {
      this.renderer.addClass(labelEl, 'activate');
    } else {
      this.renderer.removeClass(labelEl, 'activate');
    }

    // Find the input and ensure its checked state matches
    const inputEl = toggleEl.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (inputEl) {
      inputEl.checked = this.checked;
    }
  }

  onInputChange(event: Event) {
    const newValue = (event.target as HTMLInputElement).checked;
    this.checked = newValue; // Update internal state
    this.valueChange.emit(newValue);
    this.updateToggleState(); // Force update
  }
}
