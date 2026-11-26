import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  message: string;
  uid: string;
  email: string;
  idToken?: string;
  expiresIn?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        if (res.idToken) {
          localStorage.setItem('casac_idToken', res.idToken);
          localStorage.setItem('casac_uid', res.uid);
          localStorage.setItem('casac_email', res.email);
        }
      })
    );
  }

  register(email: string, password: string, displayName: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      email,
      password,
      displayName
    });
  }

  logout(): void {
    localStorage.removeItem('casac_idToken');
    localStorage.removeItem('casac_uid');
    localStorage.removeItem('casac_email');
  }
}
