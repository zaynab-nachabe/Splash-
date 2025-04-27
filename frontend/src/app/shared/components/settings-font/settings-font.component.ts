import { Component, EventEmitter, Output } from '@angular/core';
import {ConfigService} from '../../services/config.service';

@Component({
  selector: 'app-settings-font',
  templateUrl: './settings-font.component.html',
  styleUrl: './settings-font.component.scss'
})
export class SettingsFontComponent {
  fonts : string[] = ['Arial', 'Courier New', 'Times New Roman', 'Verdana', 'Cursive'];

  constructor(private configService: ConfigService){}

  //i no know if we need this
  @Output() fontSelected = new EventEmitter<string>();

  onFontChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedFont = target.value;
    this.configService.setSelectedFont(selectedFont);
  }
}
