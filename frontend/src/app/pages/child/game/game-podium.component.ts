import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {User} from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import * as confetti from 'canvas-confetti';

@Component({
    selector: 'app-game-podium',
    templateUrl: './game-podium.component.html',
    styleUrls: ['./game-podium.component.scss']
})
export class GamePodiumComponent implements OnInit{
    public  user?: User;
    public userScore: number = 0;

    constructor(private route: ActivatedRoute, private userService: UserService) {}

    ngOnInit(): void {
        const state = this.route.snapshot.queryParams;
        this.user = JSON.parse(state['user'] || '{}');
        this.userScore = this.userService.getScore();
        this.launchConfetti();
    }

    private launchConfetti(): void {
        const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
        const confettiInstance = confetti.create(canvas, {resize: true});

        const duration = 5 *1000;
        const end = Date.now() + duration;

        const frame = () => {
            confettiInstance({
                particleCount: 10,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
            });
            confettiInstance({
                particleCount: 10,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();
    }

}