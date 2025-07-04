import { Component } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user.model';
import { ChildConfigService } from 'src/app/shared/services/child-config.service';
import { AVATAR_PRICES, Avatar } from '../../../shared/models/avatar.model';

@Component({
  selector: 'app-child-config-page',
  templateUrl: './child-config-page.component.html',
  styleUrl: './child-config-page.component.scss'
})
export class ChildConfigPageComponent {
    user!: User;
    musicEnabled: boolean = true;
    effectsEnabled: boolean = true;
    showScore: boolean = true;
    playerImages: string[] = AVATAR_PRICES.map(a => a.path);
    selectedPlayerImage: string | null = null;
    crabSpeed: 'slow' | 'fast' = 'slow';
    avatars = AVATAR_PRICES;
    limitedLives: boolean = true;

    constructor(private userService: UserService, private childConfigService: ChildConfigService) {
        this.userService.selectedUser$.subscribe((user: User | null) => {
            if (user) {
                console.log('User updated in config page:', user);
                this.user = {...user};
                this.childConfigService.loadUserConfig(this.user);
                this.showScore = this.user.showScore ?? true;
                console.log('Current user money:', this.user.money);
            } else {
                console.warn('No user selected in config page.');
            }
        });
        this.childConfigService.musicEnabled$.subscribe((val: boolean) => this.musicEnabled = val);
        this.childConfigService.effectsEnabled$.subscribe((val: boolean) => this.effectsEnabled = val);
        this.childConfigService.crabSpeed$.subscribe((speed: string) => {
            if (speed === 'slow' || speed === 'fast') {
                this.crabSpeed = speed;
            } else {
                this.crabSpeed = 'slow';
            }
        });
        this.childConfigService.limitedLives$.subscribe((val: boolean) => this.limitedLives = val);
    }

    ngOnInit() {
        if (this.user?.userId) {
            this.userService.getUserById(this.user.userId).subscribe({
                next: (updatedUser) => {
                    if (updatedUser) {
                        this.user = updatedUser;
                        console.log('Fetched fresh user data:', updatedUser);
                        this.initializeConfigs();
                    }
                },
                error: (err) => console.error('Error fetching user:', err)
            });
        }
    }

    private initializeConfigs() {
        this.childConfigService.loadUserConfig(this.user);
        this.showScore = this.user.showScore ?? true;
        this.selectedPlayerImage = this.user.selectedPlayerImage || this.playerImages[0];
        this.crabSpeed = this.user.crabSpeed || 'slow';
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
    toggleShowScore() {
        this.showScore = !this.showScore;
        this.childConfigService.updateShowScore(this.showScore);
    }

    selectPlayerImage(img: string) {
        this.selectedPlayerImage = img;
        this.childConfigService.updateSelectedPlayerImage(img);
    }

    updateCrabSpeed(speed: 'slow' | 'fast') {
        this.crabSpeed = speed;
        this.childConfigService.updateCrabSpeed(speed);
    }

    get isFastCrabs(): boolean {
        return this.crabSpeed === 'fast';
    }

    toggleCrabSpeed(isFast: boolean) {
        const newSpeed: 'slow' | 'fast' = isFast ? 'fast' : 'slow';
        this.updateCrabSpeed(newSpeed);
    }

    isAvatarUnlocked(avatarId: string): boolean {
        return this.childConfigService.isAvatarUnlocked(avatarId);
    }

    getUserMoney(): number {
        return this.user?.money ?? 0;
    }

    handleAvatarClick(avatar: Avatar) {
        if (this.isAvatarUnlocked(avatar.id)) {
            this.selectPlayerImage(avatar.path);
        } else if (this.getUserMoney() >= avatar.price) {
            this.purchaseAvatar(avatar);
        }
    }

    private purchaseAvatar(avatar: Avatar) {
        if (!this.user) return;
        
        this.childConfigService.purchaseAvatar(avatar).subscribe({
            next: (updatedUser: User) => {
                this.user = updatedUser;
                // Update selected avatar
                this.selectedPlayerImage = avatar.path;
                // Force UI refresh
                this.initializeConfigs();
                console.log('Avatar purchased successfully:', avatar.id);
            },
            error: (err) => console.error('Error purchasing avatar:', err)
        });
    }

    toggleLimitedLives() {
        this.limitedLives = !this.limitedLives;
        this.childConfigService.updateLimitedLives(this.limitedLives);
    }
}