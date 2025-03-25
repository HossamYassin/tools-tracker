import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToolsTableComponent } from '../tools-table/tools-table.component';
import * as signalR from '@microsoft/signalr';
import { environment } from '../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [FormsModule, ToolsTableComponent, RouterModule],
})
export class HomeComponent {
  apiUrl = `${environment.hubUrl}`;
  toastr = inject(ToastrService);
  private hubConnection!: signalR.HubConnection;

  constructor(private router: Router) {}

  ngOnInit() {
    this.startSignalRConnection();
  }

  startSignalRConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.apiUrl + '/toolNotificationHub')
      .build();

    this.hubConnection.start().catch((err) => console.error(err));

    this.hubConnection.on('ToolAvailable', (tool: string) => {
      console.log('tool', tool);
      //Swal.fire('Success', `Tool ${tool} is now available!`, 'success');
      this.toastr.info(`Tool ${tool} is now available!`, 'Tool available!');
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
