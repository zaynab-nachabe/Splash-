import { Component, EventEmitter, Output } from '@angular/core';
import {ConfigService} from '../../services/font.service';
import { OnInit } from '@angular/core';
@Component({
  selector: 'app-settings-font',
  templateUrl: './settings-font.component.html',
  styleUrl: './settings-font.component.scss'
})
export class SettingsFontComponent implements OnInit{
  fonts : string[] = ['Arial', 'Courier New', 'Times New Roman', 'Verdana', 'Cursive'];

  constructor(private configService: ConfigService){}

  //i no know if we need this
  @Output() fontSelected = new EventEmitter<string>();

  onFontChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedFont = target.value;
    this.configService.setSelectedFont(selectedFont);
  }

  ngOnInit(){
    console.log("Available fonts: ", this.fonts);
  }
}
