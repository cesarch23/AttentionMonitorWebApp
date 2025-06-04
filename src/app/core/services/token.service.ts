import { Injectable } from '@angular/core';
import { setCookie,getCookie,removeCookie } from 'typescript-cookie'
import { jwtDecode, JwtPayload} from 'jwt-decode'
@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }
  saveToken(token:string){
    setCookie('token',token,{expires:365,path:'/'})
  }
  getToken(){
    return getCookie('token')
  }
  removeToken(){
    removeCookie('token')
  }
  isValidToken():boolean{
    const token = getCookie('token');
    if(!token) return false;
    const decodeToken = jwtDecode<JwtPayload>(token);
    console.log(" token decodificado ",decodeToken);
    if(decodeToken && decodeToken.exp){
      const today = new Date();
      const tokenDate = new Date(0);
      tokenDate.setUTCSeconds(decodeToken.exp)
      return today.getTime() < tokenDate.getTime();
    }
    return false;

  }
}
