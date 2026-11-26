import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService, UserProfile } from '../../services/user';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(true);
  saving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  profile: UserProfile = {
    email: localStorage.getItem('casac_email') || '',
    displayName: '',
    perfilRiesgo: 'Moderado',
    nivelRiesgo: '4/7',
    horizontePrincipal: '5-10 años',
    objetivo: 'Crecimiento',
    capitalInicial: 0
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.profile = { ...this.profile, ...data };
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.onLogout();
        } else {
          this.errorMessage.set('No se pudo cargar el perfil desde Firestore.');
        }
      }
    });
  }

  onRiskChange(perfil: 'Conservador' | 'Moderado' | 'Agresivo'): void {
    this.profile.perfilRiesgo = perfil;
    const mapNivel: Record<string, string> = {
      Conservador: '2/7',
      Moderado: '4/7',
      Agresivo: '6/7'
    };
    this.profile.nivelRiesgo = mapNivel[perfil];
  }

  onSave(): void {
    this.saving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.userService.updateProfile(this.profile).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Perfil actualizado en Firestore. Nexo Advisor usará estos parámetros.');
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Error al guardar los cambios del perfil.');
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}