import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service'

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})

export class UserListComponent implements OnChanges{
  public userList: User[] = [];

  @Input() navigateTo: string = '/child-play';
  @Input() showAddButton: boolean = false;
  @Input() addButtonRoute: string = '';
  @Input() showDeleteButtons: boolean = false;
  @Input() users: User[] = [];


  showConfirmDeletePopup: boolean = false;
  userToDelete?: User;


  constructor(private userService: UserService,  private router: Router){}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['users']){
      this.userList = [... this.users];
    }
  }

  ngOnInit(): void {}

  selectUser(userId:User['userId']): void {
    this.userService.selectUser(userId);
    this.router.navigate([this.navigateTo]);
  }

  navigateToAddUser(): void {
    if (this.addButtonRoute) {
      this.router.navigate([this.addButtonRoute]);
    }
  }


  promptDeleteUser(event: Event, user: User): void {
    event.stopPropagation(); // Prevent navigation when clicking the X
    this.userToDelete = user;
    this.showConfirmDeletePopup = true;
  }


  confirmDeleteUser(): void {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.userId);
      this.showConfirmDeletePopup = false;
      this.userToDelete = undefined;
    }
  }

  cancelDeleteUser(): void {
    this.showConfirmDeletePopup = false;
    this.userToDelete = undefined;
  }


}
