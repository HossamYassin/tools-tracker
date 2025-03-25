import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  catchError,
  delay,
  Observable,
  retryWhen,
  scan,
  throwError,
} from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; // API URL from environment file
  private retryCount = environment.retryCount;
  private retryDelay = environment.retryDelay;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        retryWhen((errors) =>
          errors.pipe(
            scan((retryCount, error) => {
              if (retryCount > this.retryCount) {
                throw error; // Stop retrying after 3 attempts
              }
              console.warn(`Retrying... Attempt ${retryCount + 1}`);
              return retryCount + 1;
            }, 0),
            delay(this.retryDelay)
          )
        ),
        catchError(this.handleError)
      );
  }

  storeToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken(); // Checks if the token exists
  }

  logout() {
    localStorage.removeItem('token');
  }

  private handleError(error: any) {
    console.error('Error occurred:', error);
    return throwError(
      () => new Error('Something went wrong, please try again later.')
    );
  }
}
