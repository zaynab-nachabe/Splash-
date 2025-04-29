import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tab-box',
  templateUrl: './tab-box.component.html',
  styleUrls: ['./tab-box.component.scss']
})
export class TabBoxComponent {
  @Input() tabs: { id: string, label: string }[] = [];
  @Input() sections: { title: string, tabs: { id: string, label: string }[] }[] = [];
  @Input() activeTabId: string = '';

  @Output() tabSelected = new EventEmitter<string>();

  onTabClick(tabId: string): void {
    this.activeTabId = tabId;
    this.tabSelected.emit(tabId);
  }
}
