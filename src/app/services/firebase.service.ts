import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model'
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc,addDoc,collection, collectionData, query} from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import {getStorage, uploadString, ref, getDownloadURL} from 'firebase/storage';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private afAuth: AngularFireAuth,   // Inyecta AngularFireAuth en el constructor
    private firestore: AngularFirestore, // Firestore también está disponible a través de AngularFire
    private utilsSvc : UtilsService,
   
  ) {}


  // Autenticacion

  getAuth(){
    return getAuth();
  }


  // Acceder
  sign(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password)
  }


  // crear Usuario
  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password)
  }

  // Actualizar Usuario

  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName })
  }

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email)

  }


  // ======= cerrar Sesion ===========

  signOut(){
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsSvc.routerLink('/auth');
  }




  // ============ BASE DE DATOS =========

  // =========== obtener documentos de una coleccion 
  getCollectionData(path:string, collectionQuery?: any ){
    const ref = collection(getFirestore(), path)
    return collectionData(query(ref, collectionQuery), {idField: 'id'});
  }


  // ===== Setear un Documento =======
  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }


  //  === Obtener un Documento ======
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  //  === Agregar un Documento ======
  addDocument(path: string , data: any) {
    return addDoc(collection(getFirestore(), path), data);
  }

  updateDocument(path: string, data: any) {
    // Actualiza el documento en Firestore con el ID dado
    return setDoc(doc(getFirestore(), path), data, { merge: true });
  }

  async deleteDocument(path: string): Promise<void> {
    try {
      await this.firestore.doc(path).delete();
      console.log(`Documento en ${path} eliminado correctamente`);
    } catch (error) {
      console.error(`Error al eliminar el documento en ${path}:`, error);
      throw error;
    }
  }
  // 
 


}
