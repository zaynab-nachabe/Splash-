import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-settings-font',
  templateUrl: './settings-font.component.html',
  styleUrl: './settings-font.component.scss'
})
export class SettingsFontComponent {
  fonts : string[] = ['Arial', 'Courier New', 'Times New Roman', 'Verdana', 'Cursive'];
  @Output() fontSelected = new EventEmitter<string>();

  onFontChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedFont = target.value;
    this.fontSelected.emit(selectedFont);
  }
}
