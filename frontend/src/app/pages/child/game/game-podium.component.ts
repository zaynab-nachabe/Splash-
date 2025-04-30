import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {User} from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
    selector: 'app-game-podium',
    templateUrl: './game-podium.component.html',
    styleUrls: ['./game-podium.component.scss']
})
export class GamePodiumComponent implements OnInit{
    @ViewChild('gameMusic', { static: false }) gameMusicRef!: ElementRef<HTMLAudioElement>;

    public  user?: User;
    public userScore: number = 0;

    constructor(private route: ActivatedRoute, private userService: UserService) {}

    ngOnInit(): void {
        const state = this.route.snapshot.queryParams;
        this.user = JSON.parse(state['user'] || '{}');
        this.userScore = this.userService.getScore();
    }

    ngAfterViewInit(): void {
        this.startMusic();
    }

    private startMusic(): void {
        const audioElement = this.gameMusicRef.nativeElement;
        audioElement.play().catch((error) => {
            console.error('Error playing music:', error);
        });
    }
}