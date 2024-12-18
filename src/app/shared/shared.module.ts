import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddUpdateClienteComponent } from './components/add-update-cliente/add-update-cliente.component';
import { MantencionClienteComponent } from './components/mantencion-cliente/mantencion-cliente.component';



@NgModule({
  declarations: [HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    AddUpdateClienteComponent,
    MantencionClienteComponent
  ],
  exports:[HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    ReactiveFormsModule,
    AddUpdateClienteComponent,
    MantencionClienteComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class SharedModule { }
