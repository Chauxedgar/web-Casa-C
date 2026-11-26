import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  uid?: string;
  email?: string;
  displayName: string;
  perfilRiesgo: 'Conservador' | 'Moderado' | 'Agresivo';
  nivelRiesgo: string;
  horizontePrincipal: string;
  objetivo: string;
  capitalInicial?: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/users';

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(profile: Partial<UserProfile>): Observable<{ message: string; profile: UserProfile }> {
    return this.http.put<{ message: string; profile: UserProfile }>(`${this.apiUrl}/profile`, profile);
  }
}