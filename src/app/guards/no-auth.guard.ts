import { CanActivateFn, ActivatedRouteSnapshot, UrlTree,RouterStateSnapshot , CanActivate, GuardResult, MaybeAsync} from '@angular/router';
import { Observable } from 'rxjs'; 
import { inject, Injectable } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})

export class NoAuthGuard implements CanActivate{
 

  constructor(
    private firebaseSvc: FirebaseService, 
    private utilSvc: UtilsService
  ) {}
 
 canActivate(
  route: ActivatedRouteSnapshot,
 state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree{

  let user = localStorage.getItem('user')


  return new Promise((resolve)=>{

    this.firebaseSvc.getAuth().onAuthStateChanged((auth) =>{

      if(!auth) resolve(true);
      
      else{
        this.utilSvc.routerLink('/main/home');
        resolve(false);
      }
    })
  });
 }
}