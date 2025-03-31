import { Component } from '@angular/core';
import {childstatMock} from '../../../shared/mocks/childRanking-mock';

@Component({
  selector: 'app-child-stat-page',
  templateUrl: './child-stat-page.component.html',
  styleUrl: './child-stat-page.component.scss'
})
export class ChildStatPageComponent {

  childstat = childstatMock;

  getRank(userId: string) : number {
    return this.childstat[userId] || 0; //return 0 if the userId is not found
  }

  onSession2Click(): void{
    console.log("Session 2 clicked");
    //I don't know what to do next
  }

  onSession1Click(): void{
    console.log("Session 1 clicked");
  }
}
