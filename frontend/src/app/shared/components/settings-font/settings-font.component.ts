import { Component, EventEmitter, Output } from '@angular/core';
import {FontService} from '../../services/font.service';
import { OnInit } from '@angular/core';
@Component({
  selector: 'app-settings-font',
  templateUrl: './settings-font.component.html',
  styleUrl: './settings-font.component.scss'
})
export class SettingsFontComponent implements OnInit{
  fonts : string[] = [];

  constructor(private fontService: FontService){}


  onFontChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedFont = target.value;
    this.fontService.setSelectedFont(selectedFont);
  }

  ngOnInit(){
    this.fonts = this.fontService.getFonts();
    console.log("Available fonts: ", this.fonts);
  }
}
