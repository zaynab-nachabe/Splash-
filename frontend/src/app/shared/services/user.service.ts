import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { LocalStorageService } from "./localStorage.service";

import { User } from "../models/user.model";
import { MOCK_USER } from "../mocks/user.mock";

@Injectable({
    providedIn: 'root'
})

/**
 * Remarques & Interrogations:
 *      Confirmer la bonne utilisation de BehaviorSubject, plûtot que Observable
 */
export class UserService{
    private users: User[] = [];
    public users$: BehaviorSubject<User[]> = new BehaviorSubject(this.users);

    private LOCAL_STORAGE_USERS_KEY = "users";
    private LOCAL_STORAGE_SELECTED_USER_KEY = "selectedUser"
    private selectedUser!: User;
    public selectedUser$: BehaviorSubject<User> = new BehaviorSubject(this.selectedUser);

  constructor(private localStorageService: LocalStorageService) {
    // Try to load the selected user from localStorage
    const storedUser = this.localStorageService.getData(this.LOCAL_STORAGE_SELECTED_USER_KEY);
    if (storedUser) {
      try {
        this.selectedUser = JSON.parse(storedUser) as User;
        this.selectedUser$.next(this.selectedUser);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        // Clear invalid data
        this.localStorageService.removeData(this.LOCAL_STORAGE_SELECTED_USER_KEY);
      }
    }

    // Load users from mock or localStorage
    this.loadUsers();
  }

  //plus tard on utilisera les requêtes https
  private loadUsers(): void {
    // First try to load from localStorage
    const storedUsers = this.localStorageService.getData(this.LOCAL_STORAGE_USERS_KEY);

    if (storedUsers) {
      try {
        this.users = JSON.parse(storedUsers) as User[];
      } catch (e) {
        console.error('Error parsing stored users:', e);
        // Fallback to mock data if there's an error
        this.users = MOCK_USER;
      }
    } else {
      // If no users in localStorage, use mock data
      this.users = MOCK_USER;
    }

    // Update the BehaviorSubject
    this.users$.next(this.users);
  }

  public selectUser(userId: User['userId']): void {
    this.selectedUser = this.users.find(user => user.userId === userId)!;
    if (this.selectedUser) {
      this.selectedUser$.next(this.selectedUser);
      this.localStorageService.saveData(
        this.LOCAL_STORAGE_SELECTED_USER_KEY,
        JSON.stringify(this.selectedUser)
      );
    }
  }

  public addUser(user: User): void {
    // Get current users
    const users = [...this.users$.getValue()];
    // Add new user
    users.push(user);
    // Update the users array
    this.users = users;
    // Update the BehaviorSubject
    this.users$.next(users);
    // Save to localStorage
    this.saveUsersToLocalStorage(users);
  }

  private saveUsersToLocalStorage(users: User[]): void {
    this.localStorageService.saveData(
      this.LOCAL_STORAGE_USERS_KEY,
      JSON.stringify(users)
    );
  }
}
