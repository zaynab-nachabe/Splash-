import { Injectable } from "@angular/core";
import { BehaviorSubject, EMPTY, Observable } from "rxjs";
import { User } from "../models/user.model";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userScore: number = 0;
  private users: User[] = [];
  public users$: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  public selectedUser$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  private readonly apiUrl = 'http://localhost:9428/api/users';

  constructor(private http: HttpClient) {
    this.fetchUsersFromBackend();
  }
  fetchUsersFromBackend(): void {
    this.http.get<User[]>(this.apiUrl).subscribe(users => {
      this.users = users;
      this.users$.next(users);
    });
  }

  addUser(user: User): void {
    this.http.post<User>(this.apiUrl, user).subscribe(newUser => {
      this.users.push(newUser);
      this.users$.next(this.users);
    });
  }

  updateUser(user: User): void {
    this.http.put<User>(`${this.apiUrl}/${user.userId}`, user).subscribe(updatedUser => {
      const idx = this.users.findIndex(u => u.userId === user.userId);
      if (idx !== -1) {
        this.users[idx] = updatedUser;
        this.users$.next(this.users);
      }
    });
  }

  selectUser(userId: string): void {
    const foundUser = this.users.find(user => user.userId === userId);
    if (foundUser) {
      this.selectedUser$.next(foundUser);
    }
  }

  getUsers(): Observable<User[]> {
    return this.users$.asObservable();
  }

  getUserById(userId: string): Observable<User | undefined> {
    return new Observable(subscriber => {
      const user = this.users.find(u => u.userId === userId);
      subscriber.next(user);
      subscriber.complete();
    });
  }

  deleteUser(userId: string): void {
    this.http.delete(`${this.apiUrl}/${userId}`).subscribe(() => {
      this.users = this.users.filter(user => user.userId !== userId);
      this.users$.next(this.users);
      if (this.selectedUser$.getValue()?.userId === userId) {
        this.selectedUser$.next(this.users.length > 0 ? this.users[0] : null);
      }
    });
  }

  getScore(): number {
    return this.userScore;
  }

  setScore(score: number): void {
    this.userScore = score;
  }

  updateUserMoney(userId: string, newAmount: number) {
    if (this.selectedUser$.getValue()?.userId === userId) {
      const updatedUser = { ...this.selectedUser$.getValue(), money: newAmount };
      return this.http.put<User>(`${this.apiUrl}/${userId}`, updatedUser).pipe(
        tap((user: User) => {
          this.selectedUser$.next(user);
        })
      );
    }
    return EMPTY;
  }

  addMoney(userId: string, amount: number) {
    const selectedUser = this.selectedUser$.getValue();
    if (selectedUser?.userId === userId) {
      const currentMoney = selectedUser?.money || 0;
      return this.updateUserMoney(userId, currentMoney + amount);
    }
    return EMPTY;
  }

  updateMoney(userId: string, amount: number) {
    const user = this.selectedUser$.getValue();
    if (user) {
      const currentMoney = user?.money || 0;
      const updatedUser = { ...user, money: currentMoney + amount };

      return this.http.put<User>(`${this.apiUrl}/${userId}`, updatedUser).pipe(
        tap((updatedUser: User) => {
          this.selectedUser$.next(updatedUser);
        })
      );
    }
    return EMPTY;
  }
}
