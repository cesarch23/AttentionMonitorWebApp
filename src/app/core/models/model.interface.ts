export type RequestStatus= 'init' | 'failed' | 'sucess' | 'loading'
export type Gender = 'masculino' | 'femenino'

export interface UserRegister{
    email:string;
    password:string;
    maternalLastname:string;
    paternalLastname:string;
    gender:Gender;
}