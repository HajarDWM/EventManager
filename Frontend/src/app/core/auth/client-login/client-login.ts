import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientAuthService } from '../services/client-auth.service';

@Component({
  selector: 'app-client-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-login.html',
  styleUrls: ['./client-login.scss']
})
export class ClientLogin {
  private readonly clientAuthService = inject(ClientAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public accessLinkToken = signal('');
  public isLoading = signal(false);
  public errorMessage = signal('');

  constructor() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.accessLinkToken.set(token);
        this.login(); // Auto-login if token is in URL
      }
    });
  }

  public login(): void {
    if (!this.accessLinkToken().trim()) {
      this.errorMessage.set('Veuillez entrer votre jeton d\'accès.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.clientAuthService.login(this.accessLinkToken()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.router.navigate(['/client/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Lien d\'accès invalide ou expiré. Veuillez vérifier votre jeton.');
        console.error(err);
      }
    });
  }
}
