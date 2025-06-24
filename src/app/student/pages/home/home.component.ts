import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AttentionService } from '../../../core/services/attention.service';
import { 
  FilesetResolver, 
  FaceLandmarker, 
  ObjectDetector, 
  Detection, 
  FaceLandmarkerOptions, 
  ObjectDetectorOptions, 
  FaceLandmarkerResult,
  ObjectDetectorResult} from '@mediapipe/tasks-vision';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../../core/services/notification.service';
import { RequestStatus, Session } from '../../../core/models/model.interface';
import { SessionsService } from '../../../core/services/sessions.service';
import { DateTime } from 'luxon';
export interface AttentionInfo {
  minutesElapsedInSession: number;
  usePhone: boolean;
  minutesUsePhone: number;
  isSomnolence: boolean;
  numberOfYawns: number;
  minutesSomnolence: number;
  isAbsent: boolean;
  minutesAbsent: number;
  attention: number;
  isConnectedFromBegining: boolean;
  studentId: string;
  session: { sessionId: string };
}
interface Activity { activity: string; time: number }
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
  private attentionServ = inject(AttentionService)
  private notificationServ = inject(NotificationService)
  private sessionServ = inject(SessionsService)
  private snackBar = inject(MatSnackBar);

  sessionId = new FormControl<string | null>(null,Validators.required)
  errorMessage = '';
  actividades:{activity:string,time:number}[] = [
    // {activity:"Somnolencia",time:8},
    // {activity:"Uso de telefono",time:8}
  ]
  sessionActiva!:Session;
  activityColumns = ['actividad','time'] 
  activityDataSource = new MatTableDataSource<{activity:string,time:number}>(this.actividades)
  conected:boolean = false; 
  conectRequestStatus:RequestStatus = 'init'
  isCameraActive = false;
  attention!:AttentionInfo;
  faceLandmarker!: FaceLandmarker;
  objectDetector!: ObjectDetector;
  videoInterval: any;
  modelosListos = false;

   @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  // Estados
  isSomnolence = false;
  isAbsent = false;
  usePhone = false;
  minutesSomnolence = 0;
  minutesAbsent = 0;
  minutesUsePhone = 0;
  minuteCounter = 0;

  async activarCamara() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.videoRef.nativeElement.srcObject = stream;
    this.videoRef.nativeElement.play();
    this.isCameraActive = true;
    await this.loadModels();
  }

  async loadModels() {
    const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm');
    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { 
        modelAssetPath: '/models/face_landmarker.task',
        delegate:'GPU'
       },
      runningMode: 'VIDEO',
    });

    this.objectDetector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: { 
        modelAssetPath: '/models/efficientdet_lite0.tflite',
        delegate:'GPU'
       },
      scoreThreshold: 0.1,
      runningMode: 'VIDEO',
      categoryAllowlist: ['person', 'cell phone'],
    });
    this.modelosListos = true;
    this.notificationServ.show('Modelos cargados correctamente', 'success');
  }

  conectToSession() {
    if (!this.sessionId.value?.trim() || !this.modelosListos) {
      console.log("modelos aun no estan listos")
      return;
    }
    this.conectRequestStatus = 'loading';
    // retornamos la sesion, si es que el tiempo corresponde al inicio o ya inicio entonces conectamos o sino le decimo que aun no se analiza pro que la sesion no inicia

    this.sessionServ.getSessionById(this.sessionId.value).subscribe({
      next:(session:Session)=>{
        this.sessionActiva = {...session}
        console.log("session activa: ",this.sessionActiva)
        if(this.isNowWithinSession(session)){
          
          this.attentionServ.conectToSesion(this.sessionId.value!).subscribe({
            next: (isConected) => {
              if(isConected){
                this.conected = isConected;
                this.conectRequestStatus = 'success';
                this.notificationServ.show('Conexión establecida', 'success');
                this.iniciarAnalisis();
              }else{
                this.notificationServ.show('Conexión no establecido, intentelo nuevamente', 'warning');
              }
              
            },
            error: (messageError) => {
              this.conected = false;
              this.conectRequestStatus = 'failed';
              this.notificationServ.show(messageError, 'error');
            },
          });
        }
        else{
          this.notificationServ.show('No logro conectarse,verifique que la sesión este activa','warning')
        }
      },
      error:(messageError)=>{
        this.notificationServ.show(messageError,'error')
      }
    })

    

  }

  async iniciarAnalisis() {
    //this.minuteCounter = 0;
    //inicializamos el tiempo de sesion de intervalos de 10 minutos
    this.videoInterval = setInterval(() => this.detectFrame(), 1000); // cada 1 segundo hace el analisis
  }

  async detectFrame() {
    if (!this.modelosListos) return;
    const video = this.videoRef.nativeElement;
    const now = performance.now();

    const faceResult: FaceLandmarkerResult = await this.faceLandmarker.detectForVideo(video, now);
    const objectResult: ObjectDetectorResult = await this.objectDetector.detectForVideo(video, now);

    // SOMNOLENCIA: Ojos cerrados (simplificado)
    // const eyesClosed = this.ojosCerrados(faceResult);
    // if (eyesClosed) {
    //   //iniciarlizar el tiempo de somnolencia
    //   this.minutesSomnolence++;
    //   // se verifica si el tiempo es mayor a 2 minutos es somnolencia y mandamos alarta
    
    //   this.isSomnolence = this.minutesSomnolence >= 1;
    //   this.pushActividad('Somnolencia', this.minutesSomnolence);
    //   console.log("detecciont de somolencia")
    //   this.alerta('Somnolencia detectada');
    // } 
    // else {
    //   this.minutesSomnolence = 0;
    //   this.isSomnolence = false;
    // }

    //AUSENCIA
    const hasPerson = objectResult.detections.some(d =>
      d.categories[0].categoryName == 'person');
    if (!hasPerson) {
      // no se detecto person entonces se inicio el temporizador
      this.minutesAbsent++;
      this.isAbsent = this.minutesAbsent >= 1;
      // se muestra alerta 
      this.pushActividad('Ausencia', this.minutesAbsent);
    } else {
      console.log('Person detectada');
      // ya regreso el person
      //entonces se inicializa el tiempo
      this.minutesAbsent = 0;
      this.isAbsent = false;
    }

    // USO DE CELULAR
    // const hasPhone = objectResult.detections.some(d =>
    //   d.categories[0].categoryName === 'cell phone');
    // if (hasPhone) {
    //   //VERIFICO CUANTO TIEMPO PASO, SI ES MULTIPLO DE 10 LO ENVIO EL DATO SI NO PASO. ADEMAS CONTROLO E INICIALIZO EL TIEMPO DE USO TELEFONO
    //   this.minutesUsePhone++;
    //   this.usePhone = true;
    //   this.pushActividad('Uso de celular', this.minutesUsePhone);
    //   console.log("detecciont de telefono")
    // } else {
    //   this.usePhone = false;
    // }

    // this.minuteCounter++;
    
    // if (this.getElapsedMinutesIfMultipleOfTen(this.sessionActiva)) {
    // if (this.minuteCounter>=2) {
        this.enviarAttentionInfo();
        this.resetAnalisis();
    // }
  }

  ojosCerrados(result: FaceLandmarkerResult): boolean {
    if (result.faceLandmarks.length === 0) return false;
    // Aquí deberías implementar el cálculo del EAR (eye aspect ratio) para mayor precisión
    return false;
  }

  alerta(msg: string) {
    // const audio = new Audio('/assets/sounds/alert.mp3');
    // audio.play();
    console.log("alerta: ",msg);
    this.snackBar.open(msg, 'OK', { duration: 10000 }).onAction().subscribe(() => 
      {
        //audio.pause()
      });
  }

  pushActividad(actividad: string, time: number) {
    const index = this.actividades.findIndex(a => a.activity === actividad);
    if (index >= 0) {
      this.actividades[index].time = time;
    } else {
      this.actividades.push({ activity: actividad, time });
    }
    this.activityDataSource.data = [...this.actividades];
  }

  enviarAttentionInfo() {
    //enviando datos

    const info: AttentionInfo = {
      minutesElapsedInSession: 10,
      usePhone: this.usePhone,
      minutesUsePhone: this.minutesUsePhone,
      isSomnolence: this.isSomnolence,
      numberOfYawns: 0, // este dato no está aún calculado
      minutesSomnolence: this.minutesSomnolence,
      isAbsent: this.isAbsent,
      minutesAbsent: this.minutesAbsent,
      attention: 10 - (this.minutesSomnolence + this.minutesUsePhone + this.minutesAbsent),
      isConnectedFromBegining: true,
      studentId: '3e1cb06f-e215-45fb-900b-5915976b8909',
      session: { sessionId: this.sessionId.value! },
    };
    console.log("envio de datos: ", info)
    // this.attentionServ.registerAttention(info).subscribe(() => {
    //   this.notificationServ.show('Atención registrada', 'success');
    // });
  }

  resetAnalisis() {
    clearInterval(this.videoInterval);
    this.minutesSomnolence = 0;
    this.minutesUsePhone = 0;
    this.minutesAbsent = 0;
    this.minuteCounter = 0;
    this.iniciarAnalisis();
  }
  isNowWithinSession(session: Session): boolean {
    const now = DateTime.now();

    // Detectar si es string o Date
    let sessionDateLuxon: DateTime;
    if (typeof session.date === 'string') {
      // Aceptamos string tipo "YYYY-MM-DD"
      sessionDateLuxon = DateTime.fromISO(session.date);
    } else {
      // Si es tipo Date nativo
      sessionDateLuxon = DateTime.fromJSDate(session.date);
    }

    const sessionDateStr = sessionDateLuxon.toISODate(); // "YYYY-MM-DD"

    const startDateTime = DateTime.fromISO(`${sessionDateStr}T${session.startHours}`);
    const endDateTime = DateTime.fromISO(`${sessionDateStr}T${session.endHours}`);

    const isSameDay = now.hasSame(startDateTime, 'day');
    const isInTimeRange = now >= startDateTime && now <= endDateTime;

    return isSameDay && isInTimeRange;
  }
  getElapsedMinutesIfMultipleOfTen(session: Session): number | null {
    const ZONE = 'America/Lima'; // o tu zona horaria real

    const now = DateTime.now().setZone(ZONE);

    // Convertir session.date a ISO string si es Date
    const sessionDateStr = 
      typeof session.date === 'string'
        ? session.date
        : DateTime.fromJSDate(session.date).toISODate();

    // Combinar fecha con hora de inicio
    const startDateTime = DateTime.fromISO(`${sessionDateStr}T${session.startHours}`, { zone: ZONE });

    // Calcular minutos transcurridos
    const elapsed = Math.floor(now.diff(startDateTime, 'minutes').minutes);

    // Validar si es múltiplo de 10 y menor o igual al límite
    if (elapsed > 0 && elapsed % 1 === 0 && elapsed <= session.sessionDurationMinutes) {
      return elapsed;
    }

    return null;
  }

}
  