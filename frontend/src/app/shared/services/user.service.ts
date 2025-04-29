import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { LocalStorageService } from "./localStorage.service";
import { User } from "../models/user.model";
import { MOCK_USER } from "../mocks/user.mock";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userScore: number = 0;
  private users: User[] = [];
  public users$: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  private LOCAL_STORAGE_USERS_KEY = "users";
  private LOCAL_STORAGE_SELECTED_USER_KEY = "selectedUser";

  // Use non-null assertion to satisfy TypeScript
  private selectedUser!: User;
  public selectedUser$: BehaviorSubject<User> = new BehaviorSubject<User>(null as unknown as User);

  private _noUserSelected: boolean = false;
  private _usersInitialized: boolean = false;

  constructor(private localStorageService: LocalStorageService) {
    // Initialize users once
    this.initializeUsers();
  }

  // Initialize users once when service is created
  private initializeUsers(): void {
    if (this._usersInitialized) {
      return;
    }

    console.log("[UserService] Initializing users");

    // Load users and selected user
    this.loadUsersFromStorage();
    this.loadSelectedUserFromStorage();

    // Mark as initialized
    this._usersInitialized = true;
  }

  // Load users from localStorage or mock data
  private loadUsersFromStorage(): void {
    console.log("[UserService] Loading users from storage");

    const storedUsersString = this.localStorageService.getData(this.LOCAL_STORAGE_USERS_KEY);
    let usersNeedSaving = false;

    if (storedUsersString) {
      try {
        const parsedUsers = JSON.parse(storedUsersString) as User[];

        if (parsedUsers && Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          // Use the stored users
          console.log("[UserService] Found users in storage:", parsedUsers.length);
          this.users = parsedUsers;
        } else {
          // Load mock users if stored array is empty
          console.log("[UserService] Stored users array is empty, loading mock users");
          this.users = [...MOCK_USER];
          usersNeedSaving = true;
        }
      } catch (e) {
        // If parsing fails, use mock data
        console.error("[UserService] Error parsing stored users, loading mock users", e);
        this.users = [...MOCK_USER];
        usersNeedSaving = true;
      }
    } else {
      // If no stored users, use mock data
      console.log("[UserService] No users found in storage, loading mock users");
      this.users = [...MOCK_USER];
      usersNeedSaving = true;
    }

    // Update the BehaviorSubject
    this.users$.next(this.users);

    // Save mock users to storage if needed
    if (usersNeedSaving) {
      this.saveUsersToLocalStorage(this.users);
    }
  }

  // Load selected user from localStorage
  private loadSelectedUserFromStorage(): void {
    console.log("[UserService] Loading selected user from storage");

    const storedUserString = this.localStorageService.getData(this.LOCAL_STORAGE_SELECTED_USER_KEY);

    if (storedUserString) {
      try {
        const parsedUser = JSON.parse(storedUserString) as User;

        // Find this user in the loaded users array
        const foundUser = this.users.find(u => u.userId === parsedUser.userId);

        if (foundUser) {
          // Use the user from our loaded array to ensure consistency
          console.log("[UserService] Found stored selected user:", foundUser.name);
          this.selectedUser = foundUser;
          this.selectedUser$.next(this.selectedUser);
          this._noUserSelected = false;
          return;
        } else {
          console.warn("[UserService] Stored selected user not found in users array");
        }
      } catch (e) {
        console.error("[UserService] Error parsing stored selected user", e);
      }
    }

    // Fallback: select first user if available
    this.selectFirstAvailableUser();
  }

  // Select the first available user
  private selectFirstAvailableUser(): void {
    if (this.users.length > 0) {
      console.log("[UserService] Selecting first available user:", this.users[0].name);
      this.selectedUser = this.users[0];
      this.selectedUser$.next(this.selectedUser);
      this._noUserSelected = false;

      // Save to localStorage
      this.localStorageService.saveData(
        this.LOCAL_STORAGE_SELECTED_USER_KEY,
        JSON.stringify(this.selectedUser)
      );
    } else {
      console.warn("[UserService] No users available to select");
      this._noUserSelected = true;
    }
  }

  // Save users to localStorage
  private saveUsersToLocalStorage(users: User[]): void {
    console.log("[UserService] Saving users to localStorage:", users.length);
    this.localStorageService.saveData(
      this.LOCAL_STORAGE_USERS_KEY,
      JSON.stringify(users)
    );
  }

  // Public methods

  public get noUserSelected(): boolean {
    return this._noUserSelected;
  }

  public selectUser(userId: User['userId']): void {
    const foundUser = this.users.find(user => user.userId === userId);
    if (foundUser) {
      console.log("[UserService] Selecting user:", foundUser.name);
      this.selectedUser = foundUser;
      this.selectedUser$.next(this.selectedUser);
      this._noUserSelected = false;

      // Save to localStorage
      this.localStorageService.saveData(
        this.LOCAL_STORAGE_SELECTED_USER_KEY,
        JSON.stringify(this.selectedUser)
      );
    } else {
      console.warn("[UserService] User not found for selection:", userId);
    }
  }

  public setScore(score: number): void {
    this.userScore = score;
  }

  public getScore(): number {
    return this.userScore;
  }

  public addUser(user: User): void {
    console.log("[UserService] Adding user:", user.name);

    // Get current users (make a copy)
    const updatedUsers = [...this.users];

    // Add new user
    updatedUsers.push(user);

    // Update the users array
    this.users = updatedUsers;

    // Update the BehaviorSubject
    this.users$.next(this.users);

    // Save to localStorage
    this.saveUsersToLocalStorage(this.users);

    // If no user was selected, select this one
    if (this._noUserSelected) {
      this.selectUser(user.userId);
    }
  }

  public getSelectedUser(): User {
    return this.selectedUser;
  }

  public getUsers(): Observable<User[]> {
    return of([...this.users]);
  }

  public getUserById(userId: string): Observable<User | undefined> {
    return this.getUsers().pipe(
      map((users: User[]) => users.find((user: User) => user.userId === userId))
    );
  }

  public deleteUser(userId: string): void {
    console.log("[UserService] Deleting user:", userId);

    // Check if the user exists
    const userIndex = this.users.findIndex(user => user.userId === userId);

    if (userIndex === -1) {
      console.warn("[UserService] User not found for deletion:", userId);
      return;
    }

    // Check if we're deleting the selected user
    const isSelectedUser = this.selectedUser && this.selectedUser.userId === userId;

    // Create a new array without the deleted user
    const updatedUsers = this.users.filter(user => user.userId !== userId);

    // Update the users array
    this.users = updatedUsers;

    // Update the BehaviorSubject
    this.users$.next(this.users);

    // Save to localStorage (even if empty)
    this.saveUsersToLocalStorage(this.users);

    // Handle selected user if needed
    if (isSelectedUser) {
      if (this.users.length > 0) {
        // Select the first available user
        this.selectUser(this.users[0].userId);
      } else {
        // If no users left, remove selectedUser from localStorage
        this.localStorageService.removeData(this.LOCAL_STORAGE_SELECTED_USER_KEY);
        this._noUserSelected = true;
      }
    }
  }

  public ensureUserSelected(): boolean {
    return !this._noUserSelected && this.users.length > 0;
  }
}
