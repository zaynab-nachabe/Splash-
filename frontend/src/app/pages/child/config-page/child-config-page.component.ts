import { Component } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user.model';
import { ChildConfigService } from 'src/app/shared/services/child-config.service';

@Component({
  selector: 'app-child-config-page',
  templateUrl: './child-config-page.component.html',
  styleUrl: './child-config-page.component.scss'
})
export class ChildConfigPageComponent {
    user!: User;
    musicEnabled: boolean = true;
    effectsEnabled: boolean = true;

    constructor(private userService: UserService, private childConfigService: ChildConfigService) {
        this.userService.selectedUser$.subscribe((user: User | null) => {
            if (user) {
                this.user = user;
                this.childConfigService.loadUserConfig(this.user); // Load config from backend
            } else {
                console.warn('No user selected in config page.');
            }
        });
        this.childConfigService.musicEnabled$.subscribe((val: boolean) => this.musicEnabled = val);
        this.childConfigService.effectsEnabled$.subscribe((val: boolean) => this.effectsEnabled = val);
    }

    ngOnInit() {
        if (this.user) {
            this.childConfigService.loadUserConfig(this.user);
        }
        console.log(this.user);
    }

    toggleMusic() {
        console.log('Toggling music:', !this.musicEnabled, this.effectsEnabled);
        this.childConfigService.updateToggles(!this.musicEnabled, this.effectsEnabled);
        this.musicEnabled = !this.musicEnabled;
    }
    toggleEffects() {
        console.log('Toggling effects:', this.musicEnabled, !this.effectsEnabled);
        this.childConfigService.updateToggles(this.musicEnabled, !this.effectsEnabled);
        this.effectsEnabled = !this.effectsEnabled;
    }
}
