import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  sessionTimeout: any; // Timer para cerrar sesión automáticamente
  sessionDuration = 30 * 60 * 1000; // Duración de la sesión en milisegundos (30 minutos)

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      this.firebaseSvc
        .sign(this.form.value as User)
        .then((res) => {
          this.getUserInfo(res.user.uid);
          this.startSessionTimer(); // Iniciar el timer de la sesión
        })
        .catch((error) => {
          console.error(error);

          this.utilsSvc.presentToast({
            message: 'Error: Credenciales incorrectas.',
            duration: 2500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle-outline',
          });
        })
        .finally(() => {
          loading.dismiss();
        });
    }
  }

  async getUserInfo(uid: string) {
    const loading = await this.utilsSvc.loading();
    await loading.present();

    const path = `users/${uid}`;

    this.firebaseSvc
      .getDocument(path)
      .then((user: User) => {
        this.utilsSvc.saveInLocalStorage('user', user);
        this.utilsSvc.routerLink('/main/home');
        this.form.reset();

        this.utilsSvc.presentToast({
          message: `Te damos la Bienvenida ${user.name}`,
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'person-circle-outline',
        });
      })
      .catch((error) => {
        console.error(error);
        this.utilsSvc.presentToast({
          message: 'Error al obtener información del usuario.',
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  // ======== Iniciar el timer para cerrar sesión ========
  startSessionTimer() {
    // Limpiar el timer previo si existe
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    // Configurar un nuevo timer
    this.sessionTimeout = setTimeout(() => {
      this.firebaseSvc.signOut();
      this.utilsSvc.saveInLocalStorage('user', null);
      this.utilsSvc.routerLink('/auth');
      this.utilsSvc.presentToast({
        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        duration: 3000,
        color: 'warning',
        position: 'middle',
        icon: 'time-outline',
      });
    }, this.sessionDuration); // 30 minutos
  }
}