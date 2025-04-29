import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-ergo-stat-selected-page',
  templateUrl: './ergo-stat-selected-page.component.html',
  styleUrl: './ergo-stat-selected-page.component.scss'
})
export class ErgoStatSelectedPageComponent implements OnInit {

  activeTab: string = 'total';

// Define tabs structure
mainTabs = [
  { id: 'total', label: 'TOTAL' },
  { id: 'derniere', label: 'Dernière partie' }
];

sections = [
  {
    title: 'HISTORIQUE',
    tabs: [
      { id: 'session2', label: 'Session 2' },
      { id: 'session1', label: 'Session 1' }
    ]
  }
];

constructor() { }

ngOnInit(): void {
}

onTabChange(tabId: string): void {
  this.activeTab = tabId;
  // TODO: add logic to change displayed content
}
}

