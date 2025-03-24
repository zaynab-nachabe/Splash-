import { Injectable } from "@angular/core";
import { User } from "../models/user.model";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class UserService{
    private users: User[] = [];
    public users$: BehaviorSubject<User[]> = new BehaviorSubject(this.users);

    constructor() {
        this.loadUsers();
    }

    //plus tard on utilisera les requêtes https
    private loadUsers(): void {
        this.users = [
            { name: "Eli KOPTER", age: "9", icon: "../../assets/images/child-pps/red_fish.png"}
        ]
        this.users$.next(this.users);
    }
    
}