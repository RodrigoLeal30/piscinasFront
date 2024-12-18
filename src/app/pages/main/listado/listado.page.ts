import { Component, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { Cliente } from 'src/app/models/cliente.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateClienteComponent } from 'src/app/shared/components/add-update-cliente/add-update-cliente.component';
import { ModalController } from '@ionic/angular';
import { MantencionClienteComponent } from 'src/app/shared/components/mantencion-cliente/mantencion-cliente.component';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.page.html',
  styleUrls: ['./listado.page.scss'],
})
export class ListadoPage implements OnInit {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = []; // Lista de clientes filtrados
  searchQuery: string = ''; // Consulta del buscador

  constructor(
    public firebaseSvc: FirebaseService,
    public utilsSvc: UtilsService,
    public modalController: ModalController
  ) {}

  ngOnInit() {
    this.getClientes(); // Obtener clientes al inicializar
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  ionViewWillEnter() {
    this.getClientes(); // Refrescar lista al entrar
  }

  // ============ Mostrar Clientes =========
  getClientes() {
    const path = `users/${this.user().uid}/clientes`;

    const sub = this.firebaseSvc.getCollectionData(path).subscribe({
      next: (res: any) => {
        this.clientes = res.map((cliente: Cliente) => ({
          ...cliente,
          total: cliente.total || 0, // Asegurar que el total sea un número
        }));
        this.filteredClientes = [...this.clientes];
        sub.unsubscribe();
      },
      error: (err) => {
        console.error('Error al obtener clientes:', err);
      },
    });
  }

  // ========= Buscar Clientes =========
  searchClientes() {
    const query = this.searchQuery.toLowerCase();
    this.filteredClientes = this.clientes.filter((cliente) =>
      (cliente.name?.toLowerCase() || '').includes(query) ||
      (cliente.apellido?.toLowerCase() || '').includes(query) ||
      (cliente.email?.toLowerCase() || '').includes(query) ||
      (cliente.telefono?.toString() || '').includes(query) ||
      (cliente.direccion?.toLowerCase() || '').includes(query) ||
      (cliente.comuna?.toLowerCase() || '').includes(query) // Permitir búsqueda por comuna
    );
  }

  // ========= Asignar clase CSS según la comuna =========
  getCardClass(comuna: string): string {
    const normalizedComuna = comuna.trim().toLowerCase(); // Normalizar el texto
    const colorClasses = {
      'peñalolen': 'comuna-penalolen',
      'las condes': 'comuna-condes',
      'la florida': 'comuna-florida',
      'la reina': 'comuna-reina',
      'macul': 'comuna-macul',
    };
  
    return colorClasses[normalizedComuna] || 'comuna-default';
  }

  // ========= Eliminar Cliente =========
  async eliminarCliente(cliente: Cliente) {
    const confirm = await this.utilsSvc.presentAlert({
      header: '¿Eliminar cliente?',
      message: `¿Estás seguro de que deseas eliminar al cliente "${cliente.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.utilsSvc.loading();
            await loading.present();

            const path = `users/${this.user().uid}/clientes/${cliente.id}`;
            try {
              await this.firebaseSvc.deleteDocument(path);
              this.utilsSvc.presentToast({
                message: `Cliente "${cliente.name}" eliminado correctamente.`,
                color: 'success',
                duration: 2500,
                position: 'bottom',
              });
              this.getClientes(); // Recargar lista
            } catch (error) {
              console.error('Error al eliminar cliente:', error);
              this.utilsSvc.presentToast({
                message: 'Hubo un error al eliminar el cliente.',
                color: 'danger',
                duration: 2500,
                position: 'bottom',
              });
            } finally {
              loading.dismiss();
            }
          },
        },
      ],
    });
  }

  // ========= Editar Cliente =========
  editarCliente(cliente: Cliente) {
    this.utilsSvc.presentModal({
      component: AddUpdateClienteComponent,
      cssClass: 'add-Update-modal',
      componentProps: { cliente }, // Pasar cliente para edición
    }).then((data) => {
      if (data?.success) {
        this.getClientes(); // Recargar lista
      }
    });
  }

  // Botón de cerrar sesión
  signOut() {
    this.firebaseSvc.signOut();
  }

  addUpdateCliente(cliente?: Cliente) {
    this.utilsSvc.presentModal({
      component: AddUpdateClienteComponent,
      cssClass: 'add-Update-modal',
      componentProps: cliente ? { cliente } : {},
    }).then((data) => {
      if (data?.success) {
        this.getClientes(); // Refrescar la lista después de guardar o actualizar
      }
    });
  }

  mantencionClientes(cliente: Cliente) {
    this.utilsSvc.presentModal({
      component: MantencionClienteComponent,
      cssClass: 'mantencion-cliente',
      componentProps: {
        cliente,
        refreshClientes: () => this.getClientes(), // Pasar la función de refresco
      },
    });
  }
}