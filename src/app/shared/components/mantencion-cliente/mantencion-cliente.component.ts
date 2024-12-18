import { Component, Input, OnInit } from '@angular/core';
import { Cliente } from 'src/app/models/cliente.model';
import { EmailService } from 'src/app/services/email.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-mantencion-cliente',
  templateUrl: './mantencion-cliente.component.html',
  styleUrls: ['./mantencion-cliente.component.scss'],
})
export class MantencionClienteComponent implements OnInit {
  @Input() cliente: Cliente;
  @Input() refreshClientes: () => void; // Función para refrescar la lista
  precioMantencion: number | null = null;
  descripcionMantencion: string = ''; // Propiedad para la descripción
  fotoMantencion: string | null = null; // Propiedad para la foto

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private emailService: EmailService
  ) {}

  ngOnInit() {
    this.cliente.total = Number(this.cliente.total) || 0;
    this.cliente.mantenciones = Number(this.cliente.mantenciones) || 0;
  }

  async agregarMantencion() {
    if (this.precioMantencion === null || this.precioMantencion <= 0 || isNaN(this.precioMantencion)) {
      this.utilsSvc.presentToast({
        message: 'Por favor ingrese un precio válido para la mantención.',
        color: 'danger',
        duration: 2500,
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
      return;
    }
  
    if (!this.descripcionMantencion.trim()) {
      this.utilsSvc.presentToast({
        message: 'Por favor ingrese una descripción para la mantención.',
        color: 'danger',
        duration: 2500,
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
      return;
    }
  
    const updatedMantenciones = this.cliente.mantenciones + 1;
    const updatedTotal = this.cliente.total + this.precioMantencion;
    const path = `users/${this.utilsSvc.getFromLocalStorage('user').uid}/clientes/${this.cliente.id}`;
    const currentDateTime = new Date().toLocaleString(); // Obtener fecha y hora actuales
    const loading = await this.utilsSvc.loading();
    await loading.present();
  
    try {
      // Actualizar datos en Firebase
      await this.firebaseSvc.updateDocument(path, {
        mantenciones: updatedMantenciones,
        total: updatedTotal,
      });
  
      // Actualizar datos localmente
      this.cliente.mantenciones = updatedMantenciones;
      this.cliente.total = updatedTotal;
  
      if (updatedMantenciones === 5) {
        // Cerrar automáticamente en la quinta mantención
        await this.handleAutomaticClosure(path, currentDateTime);
      } else if (updatedMantenciones === 4) {
        // Preguntar si cerrar el mes en la cuarta mantención
        await this.handleManualClosure(path, currentDateTime);
      } else {
        // Si no es la cuarta ni la quinta mantención, solo enviar correo
        await this.sendMaintenanceEmail(currentDateTime);
      }
  
      this.utilsSvc.presentToast({
        message: `Mantención realizada. Total acumulado: $${updatedTotal.toLocaleString('en-US')}`,
        color: 'success',
        duration: 2500,
        position: 'bottom',
        icon: 'checkmark-circle-outline',
      });
  
      this.utilsSvc.dismissModal({ success: true });
    } catch (error) {
      console.error('Error durante la mantención:', error);
      this.utilsSvc.presentToast({
        message: 'Hubo un error al procesar la mantención.',
        color: 'danger',
        duration: 3000,
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
    } finally {
      loading.dismiss();
    }
  }
  async handleAutomaticClosure(path: string, currentDateTime: string) {
    await this.emailService.verificarMantenciones({
      ...this.cliente,
      descripcion: this.descripcionMantencion, // Asegurar que envía la descripción actual
      fechaHora: currentDateTime,
      fotoMantencion: this.fotoMantencion, // Adjuntar foto
    }).subscribe({
      next: async () => {
        await this.firebaseSvc.updateDocument(path, { mantenciones: 0, total: 0 });
        this.cliente.mantenciones = 0;
        this.cliente.total = 0;

        this.utilsSvc.presentToast({
          message: 'Mes cerrado automáticamente. Correo de resumen enviado.',
          color: 'success',
          duration: 3000,
          position: 'bottom',
          icon: 'checkmark-circle-outline',
        });

        // Llamar a la función para refrescar la lista
        if (this.refreshClientes) {
          this.refreshClientes();
        }
      },
      error: (err) => {
        console.error('Error al cerrar el mes automáticamente:', err);
        this.utilsSvc.presentToast({
          message: 'Hubo un error al cerrar el mes automáticamente.',
          color: 'danger',
          duration: 3000,
          position: 'bottom',
          icon: 'alert-circle-outline',
        });
      },
    });
  }

  async handleManualClosure(path: string, currentDateTime: string) {
    const confirm = await this.utilsSvc.presentAlert({
      header: '¿Cerrar el mes?',
      message: `Este cliente tiene 4 mantenciones. ¿Deseas cerrar el mes y enviar el resumen?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: async () => {
            // Enviar correo de la cuarta mantención si el usuario elige no cerrar el mes
            await this.sendMaintenanceEmail(currentDateTime);
          },
        },
        {
          text: 'Sí',
          handler: async () => {
            await this.emailService.cerrarMes({
              ...this.cliente,
              descripcion: this.descripcionMantencion, // Asegurar que envía la descripción actual
              fechaHora: currentDateTime,
              fotoMantencion: this.fotoMantencion, // Adjuntar foto
            }).subscribe({
              next: async () => {
                await this.firebaseSvc.updateDocument(path, { mantenciones: 0, total: 0 });
                this.cliente.mantenciones = 0;
                this.cliente.total = 0;

                this.utilsSvc.presentToast({
                  message: 'Mes cerrado y correo de resumen enviado.',
                  color: 'success',
                  duration: 3000,
                  position: 'bottom',
                  icon: 'checkmark-circle-outline',
                });

                // Llamar a la función para refrescar la lista
                if (this.refreshClientes) {
                  this.refreshClientes();
                }
              },
              error: (err) => {
                console.error('Error al cerrar el mes:', err);
                this.utilsSvc.presentToast({
                  message: 'Hubo un error al cerrar el mes.',
                  color: 'danger',
                  duration: 3000,
                  position: 'bottom',
                  icon: 'alert-circle-outline',
                });
              },
            });
          },
        },
      ],
    });
  }

  async sendMaintenanceEmail(currentDateTime: string) {
    const emailPayload: any = {
      ...this.cliente,
      fechaHora: currentDateTime,
      descripcion: this.descripcionMantencion, // Descripción
    };
  
    // Verifica si hay foto y la adjunta
    if (this.fotoMantencion) {
      emailPayload.fotoMantencion = this.fotoMantencion; // Enviar la foto tomada como Base64
      console.log('Foto Base64 antes de enviar al backend:', this.fotoMantencion);
    }
  
    // Enviar correo
    await this.emailService.enviarCorreo(emailPayload).subscribe({
      next: () => {
        this.utilsSvc.presentToast({
          message: 'Mantención realizada y correo enviado.',
          color: 'success',
          duration: 2500,
          position: 'bottom',
          icon: 'checkmark-circle-outline',
        });
      },
      error: (err) => {
        console.error('Error al enviar el correo:', err);
        this.utilsSvc.presentToast({
          message: 'Mantención realizada, pero hubo un error al enviar el correo.',
          color: 'warning',
          duration: 2500,
          position: 'bottom',
          icon: 'alert-circle-outline',
        });
      },
    });
  }
  async tomarFoto() {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl, // Base64
        source: CameraSource.Camera,
        quality: 90,
      });

      if (photo?.dataUrl) {
        this.fotoMantencion = photo.dataUrl; // Asignar la foto
        console.log('Foto tomada:', this.fotoMantencion);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      this.utilsSvc.presentToast({
        message: 'Error al tomar la foto. Intenta nuevamente.',
        color: 'danger',
        duration: 2500,
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
    }
  }

  cerrarModal() {
    this.utilsSvc.dismissModal({ success: true });
  }
}
