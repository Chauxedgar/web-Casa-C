import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

interface AdvisorResponse {
  advisor: string;
  reply: string;
  contextoCartera: {
    perfilRiesgo: string;
    nivelRiesgo: string;
    horizontePrincipal: string;
    objetivo: string;
  };
  timestamp: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  userEmail = localStorage.getItem('casac_email') || 'Inversor';
  prompt = '';
  loading = false;
  error = '';
  response: AdvisorResponse | null = null;

  askNexo(): void {
    if (!this.prompt.trim()) return;

    this.loading = true;
    this.error = '';

    this.http
      .post<AdvisorResponse>('http://localhost:3000/api/ai/ask', { message: this.prompt })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.response = res;
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 401 || err.status === 403) {
            this.onLogout();
          } else {
            this.error = 'No se pudo obtener respuesta de Nexo Advisor.';
          }
        }
      });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}