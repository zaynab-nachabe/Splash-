import {UserService} from '../../services/user.service';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})

export class SearchBarComponent{
  @Output() searchText = new EventEmitter<string>();

  searchTerm: string='';

  constructor(private userService: UserService) {}

  onSearch(): void{
    this.searchText.emit(this.searchTerm);
  }
}