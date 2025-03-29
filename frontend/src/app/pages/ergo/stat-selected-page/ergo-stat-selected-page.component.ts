import { Component } from '@angular/core';
import { gamestatMock } from '../../../shared/mocks/gamestat-mock';
@Component({
  selector: 'app-ergo-stat-selected-page',
  templateUrl: './ergo-stat-selected-page.component.html',
  styleUrl: './ergo-stat-selected-page.component.scss'
})
export class ErgoStatSelectedPageComponent {
  gamestat = gamestatMock;
}
