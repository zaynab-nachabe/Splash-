import { Component } from '@angular/core';
import { FontSelectorService } from 'src/app/shared/services/font-selector.service';
@Component({
  selector: 'app-ergo-lobby-game',
  templateUrl: './ergo-lobby-game.component.html',
  styleUrl: './ergo-lobby-game.component.scss'
})
export class ErgoLobbyGameComponent {
  constructor(private fontSelectorService: FontSelectorService) {}
  onFontSelected(font: string){
    this.fontSelectorService.setSelectedFont(font);
  }
}
