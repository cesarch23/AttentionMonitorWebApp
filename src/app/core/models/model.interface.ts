import { DateTime } from "luxon";

export type RequestStatus= 'init' | 'failed' | 'success' | 'loading'
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
    gender:string;
    rol:Role;

}
export interface UpdatePassword{
    current:string;
    novel:string;
}
export interface UserUpdate{
    email:string;
    name:string; 
    maternalLastname:string; 
    paternalLastname:string; 
    gender:Gender
}
export interface TeacherProfile extends UserProfile {
    teacherId:string;
    courses:Course[];
}
export interface StudentProfile extends UserProfile{
    studentId:string;
}
export interface Session {
    sessionId: string;
    description: string;
    startHours: string; // format HH:mm:ss
    endHours: string; // format HH:mm:ss
    sessionDurationMinutes: number;
    date: Date; // YYYY-MM-DD
    numberStudentConected: number;
    course: Course;  
}
export interface SessionDialogData{
    sessionId?: string;
    description?: string;
    startHours?: string; // format HH:mm:ss
    endHours?: string; // format HH:mm:ss
    sessionDurationMinutes?: number;
    date?: Date; // YYYY-MM-DD
    numberStudentConected?: number;
    course?: Course; 
    title:string;
    isEdit:boolean;
}
export interface SessionForm{
    /**description
startHours
endHours
date
courseId
     * 
     */
    
}
export interface SessionRegister {
    description: string;
    startHours: string;  
    endHours: string; 
    sessionDurationMinutes: number;
    date: Date;  
    course: {
        courseId: string;
    }
}