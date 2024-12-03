import { UserService } from './../../../common/services/auth.service';
import { Component, OnInit } from '@angular/core';


 import { FirestoreService } from '../../../common/services/firestore.service';

import { UserI } from 'src/app/common/models/users.models';
import { OverlayEventDetail } from '@ionic/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';


@Component({
  standalone: true,
  imports: [
CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosPage implements OnInit {

 usuarios: UserI[] = [];
   usuariosPendientes: any[] = [];



  constructor(
    private firestoreService: FirestoreService,
    private UserService: UserService,

  ) {}

    ngOnInit(): void {
    this.cargarUsuarios();

        this.cargarUsuariosPendientes();

  }

  async cargarUsuarios() {
    try {
      this.usuarios = await this.UserService.getAllUsers();
      console.log('Usuarios cargados:', this.usuarios);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  }



async cargarUsuariosPendientes() {
  try {
    this.usuariosPendientes = await this.UserService.getPendingUsers();
    console.log('Usuarios pendientes cargados:', this.usuariosPendientes);
  } catch (error) {
    console.error('Error cargando usuarios pendientes:', error);
  }
}

 async eliminarUsuario(usuario: UserI) {
  const confirmacion = window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${usuario.nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmacion) return;

  console.log('Eliminando usuario:', usuario);

  try {
    await this.firestoreService.deleteUser(usuario);
    this.usuarios = this.usuarios.filter((u) => u.id !== usuario.id);
    console.log(`Usuario eliminado: ${usuario.id}`);
    window.alert('Usuario eliminado con éxito.');
  } catch (error) {
    console.error('Error eliminando el usuario:', error);
    window.alert('Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
  }
}



 async eliminarUsuarioPendiente(usuario: any) {
  const confirmacion = window.confirm(`¿Estás seguro de que quieres eliminar al usuario pendiente "${usuario.nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmacion) return;

  console.log('Eliminando usuario pendiente:', usuario);

  try {
    await this.UserService.deletePendingUser(usuario.id);
    this.usuariosPendientes = this.usuariosPendientes.filter((u) => u.id !== usuario.id);
    console.log(`Usuario pendiente eliminado: ${usuario.id}`);
    window.alert('Usuario pendiente eliminado con éxito.');
  } catch (error) {
    console.error('Error eliminando el usuario pendiente:', error);
    window.alert('Error al eliminar el usuario pendiente. Por favor, inténtalo de nuevo.');
  }
}


async aprobarUsuario(usuario: any) {
  console.log('Aprobando usuario:', usuario);

  try {
    await this.UserService.approveUser(usuario.id);

    // Eliminar el usuario de la lista de usuarios pendientes
    this.usuariosPendientes = this.usuariosPendientes.filter((u) => u.id !== usuario.id);

    // Cargar la lista de usuarios nuevamente
    this.cargarUsuarios();

    console.log(`Usuario aprobado: ${usuario.id}`);
    window.alert('Usuario aprobado con éxito.');
  } catch (error) {
    console.error('Error aprobando el usuario:', error);
    window.alert('Error al aprobar el usuario. Por favor, inténtalo de nuevo.');
  }
}




}
