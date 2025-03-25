import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  showLayout: boolean = true;
  title: string = '';

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      console.log(this.router.url);
      this.showLayout = this.router.url !== '/';
      console.log(this.showLayout);
    });
  }
}
