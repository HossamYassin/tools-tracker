import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = 'Bad Request!';
            break;
          case 401:
            errorMessage = 'Unauthorized! Please log in again.';
            break;
          case 403:
            errorMessage = 'Forbidden! You do not have permission.';
            break;
          case 404:
            errorMessage = 'Resource not found!';
            break;
          case 500:
            errorMessage = 'Internal Server Error!';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.message}`;
        }
      }

      toastr.error(errorMessage, 'Error');
      return throwError(() => new Error(errorMessage));
    })
  );
};
