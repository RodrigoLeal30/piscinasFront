import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ModalOptions, ToastController, ToastOptions, AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  modalCtrl = inject(ModalController);
  alertCtrl = inject(AlertController);
  router = inject(Router);

  // ============ Loading ===========
  async loading() {
    const loader = await this.loadingCtrl.create({ spinner: 'crescent' });
    return loader;
  }

  // =========== Presentar Toast ===========
  async presentToast(opts: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    await toast.present();
  }

  // =========== Enruta a cualquier página disponible ===========
  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

  // ============ Guardar en Local Storage ============
  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  // ============ Obtener desde Local Storage ============
  getFromLocalStorage(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // =========== Modal ===========
  async presentModal(opts: ModalOptions) {
    const modal = await this.modalCtrl.create(opts);
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  dismissModal(data?: any) {
    return this.modalCtrl.dismiss(data);
  }

  // =========== Alerta ===========
  async presentAlert(opts: {
    header: string;
    message: string;
    buttons: Array<{ text: string; role?: string; handler?: () => void | Promise<void> }>;
  }) {
    const alert = await this.alertCtrl.create({
      header: opts.header,
      message: opts.message,
      buttons: opts.buttons
    });
    await alert.present();
  }

  getModalData() {
    const modalElement = this.modalCtrl.getTop(); // Obtiene el modal actual
    if (!modalElement) {
      return null;
    }
    return modalElement['componentProps'] || null; // Devuelve las propiedades pasadas al modal
  }
}
