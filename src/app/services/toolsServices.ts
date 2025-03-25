import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  catchError,
  delay,
  map,
  Observable,
  retry,
  retryWhen,
  scan,
  throwError,
} from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../models/ApiResponse';
import { Appointment } from '../models/Appointment';
import { ToolsTransactions } from '../models/ToolsTransactions';
import { Tool } from '../models/Tool';
import { Transaction } from '../models/Transactions';

@Injectable({
  providedIn: 'root',
})
export class ToolsService {
  private apiUrl = `${environment.apiUrl}/tools/transactions`;
  private apiTransactionsListUrl = `${environment.apiUrl}/transactions`;
  private apiToolUrl = `${environment.apiUrl}/tools`;
  private retryCount = environment.retryCount;
  private retryDelay = environment.retryDelay;
  private apiTransactionsUrl = `${environment.apiUrl}/appointments`;
  private http = inject(HttpClient);

  geToolsTransactions(): Observable<ApiResponse<ToolsTransactions[]>> {
    return this.http.get<ApiResponse<ToolsTransactions[]>>(this.apiUrl).pipe(
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

  getTools(): Observable<ApiResponse<Tool[]>> {
    return this.http.get<ApiResponse<Tool[]>>(this.apiToolUrl).pipe(
      map((response) => ({
        ...response,
        data: response.data?.map((tool) => ({
          ...tool,
          statusName: tool.statusId === 1 ? 'Available' : 'Borrowed',
        })),
      })),
      retryWhen((errors) =>
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= this.retryCount) {
              throw error; // Stop retrying after 3 attempts
            }
            console.warn(`Retrying... Attempt ${retryCount + 1}`);
            return retryCount + 1;
          }, 0),
          delay(this.retryDelay)
        )
      ),
      catchError((error) => {
        console.error('Error fetching tools:', error);
        return throwError(
          () => new Error('Failed to fetch tools. Please try again later.')
        );
      })
    );
  }

  addTool(tool: Tool): Observable<ApiResponse<Tool>> {
    return this.http.post<ApiResponse<Tool>>(this.apiToolUrl, tool).pipe(
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

  updateTool(tool: Tool): Observable<ApiResponse<Tool>> {
    return this.http
      .put<ApiResponse<Tool>>(`${this.apiToolUrl}/${tool.id}`, tool)
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

  deleteTool(toolId: number): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiToolUrl}/${toolId}`)
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

  getTransactionsByToolId(
    toolId: number
  ): Observable<ApiResponse<ToolsTransactions[]>> {
    return this.http
      .get<ApiResponse<ToolsTransactions[]>>(
        `${this.apiTransactionsListUrl}/tool/${toolId}`
      )
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

  private handleError(error: any) {
    console.error('Error occurred:', error);
    return throwError(
      () => new Error('Something went wrong, please try again later.')
    );
  }
}
