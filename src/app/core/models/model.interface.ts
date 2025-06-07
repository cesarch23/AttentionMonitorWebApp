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
export interface Course{
    courseId:string;
    name:string;
    teacherId:string;
}
export interface UserProfile{
    email:string;
    name:string;
    maternalLastname:string;
    paternalLastname:string;
    gender:Gender;
    rol:Role;

}
export interface TeacherProfile extends UserProfile {
    teacherId:string;
    courses:Course[];
}
export interface StudentProfile extends UserProfile{
    studentId:string;
}