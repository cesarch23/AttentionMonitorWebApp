import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private idSession =  new BehaviorSubject<string | null>(null)
  idSession$ = this.idSession.asObservable();
  constructor() { }

  setIdSession(idSession:string){
    this.idSession.next(idSession)
  }
  getIdSession(){
    return this.idSession$;
  }
}
