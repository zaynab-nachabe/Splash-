import { Component } from '@angular/core';

@Component({
  selector: 'app-inner-box',
  template:`
    <div class="box-content">
      <ng-content></ng-content>
    </div>

  `,
  styleUrl: './inner-box.component.scss'
})

export class InnerBoxComponent {

}
