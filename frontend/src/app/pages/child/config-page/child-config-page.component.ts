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
    showScore: boolean = true;
    playerImages: string[] = [];
    selectedPlayerImage: string | null = null;
    backgroundBrightness: number = 0.8;


    constructor(private userService: UserService, private childConfigService: ChildConfigService) {
        this.userService.selectedUser$.subscribe((user: User | null) => {
            if (user) {
                this.user = user;
                this.childConfigService.loadUserConfig(this.user);
                this.showScore = this.user.showScore ?? true;
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
            this.showScore = this.user.showScore ?? true;
        }
        this.playerImages = [
            '../../../../assets/images/game/player/dory.png',
            '../../../../assets/images/game/player/nemo.png',
            '../../../../assets/images/game/player/red_fish.png',
            '../../../../assets/images/game/player/yellow_fish.png'
        ];
        // load the selected image from user config
        // this.selectedPlayerImage = this.user.selectedPlayerImage;
        this.backgroundBrightness = 0.8; // Default value, or load from user config if available
 
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
    toggleShowScore() {
        this.showScore = !this.showScore;
        this.childConfigService.updateShowScore(this.showScore);
    }

    selectPlayerImage(img: string) {
    this.selectedPlayerImage = img;
    this.childConfigService.updateSelectedPlayerImage(img);
}

    onBrightnessChange(value: number) {
        this.backgroundBrightness = value;
        this.childConfigService.updateBackgroundBrightness(value);
    }
}
