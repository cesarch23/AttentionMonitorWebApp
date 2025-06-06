export type RequestStatus= 'init' | 'failed' | 'sucess' | 'loading'
export type Gender = 'masculino' | 'femenino'
export type Role = 'ESTUDIANTE' | 'PROFESOR' 
export interface UserRegister{
    email:string;
    password:string;
    maternalLastname:string;
    paternalLastname:string;
    gender:Gender;
}