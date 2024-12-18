import { Component, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { Cliente } from 'src/app/models/cliente.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateClienteComponent } from 'src/app/shared/components/add-update-cliente/add-update-cliente.component';
import { addIcons } from 'ionicons';
import { library, playCircle, radio, search } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(
    private firebaseSvc: FirebaseService, 
    private utilSvc: UtilsService
  ) {}

  
  ngOnInit() {
  }




// boton de cerrar sesion
  signOut(){
    this.firebaseSvc.signOut();
  }



}


