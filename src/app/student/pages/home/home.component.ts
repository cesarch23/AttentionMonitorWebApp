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
  ObjectDetectorResult,
  NormalizedLandmark} from '@mediapipe/tasks-vision';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../../core/services/notification.service';
import { RequestStatus, Session } from '../../../core/models/model.interface';
import { SessionsService } from '../../../core/services/sessions.service';
import { DateTime } from 'luxon';
import { AuthService } from '../../../core/services/auth.service';
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
export class HomeComponent implements OnDestroy {
  
  private attentionServ = inject(AttentionService)
  private notificationServ = inject(NotificationService)
  private sessionServ = inject(SessionsService)
  private snackBar = inject(MatSnackBar);
  private authServ = inject(AuthService)

  sessionId = new FormControl<string | null>(null,Validators.required)
  errorMessage = '';
  actividades:{activity:string,time:number}[] = []
  sessionActiva!:Session;
  activityColumns = ['actividad','time'] 
  activityDataSource = new MatTableDataSource<{activity:string,time:number}>(this.actividades)
  conected:boolean = false; 
  conectRequestStatus:RequestStatus = 'init'
  isCameraActive = false;
  faceLandmarker!: FaceLandmarker;
  objectDetector!: ObjectDetector;
  videoInterval: any;
  modelosListos = false;
  earThreshold = 0.2;
  lastElapsedSent: number | null = null;


  attention:AttentionInfo = {
    minutesElapsedInSession: 0,
    usePhone: false,
    minutesUsePhone: 0,
    isSomnolence: false,
    numberOfYawns: 0, 
    minutesSomnolence: 0,
    isAbsent: false,
    minutesAbsent: 0,
    attention: 0,
    isConnectedFromBegining: true,
    studentId: '', 
    session: { sessionId: '' }, // se llenará al conectarse a la sesión
};

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
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
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
    this.notificationServ.show('Modelos cargados correctamente, ya puedes conectarte a la sesión', 'success');
  }

  conectToSession() {
    if (!this.sessionId.value?.trim() || !this.modelosListos) {
      this.notificationServ.show('Espere por favor, esta cargando los archivos','warning')
      return;
    }
    this.conectRequestStatus = 'loading'
    // inicia

    this.sessionServ.getSessionById(this.sessionId.value).subscribe({
      next:(session:Session)=>{
        this.sessionActiva = structuredClone(session);
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
    this.videoInterval = setInterval(() => this.detectFrame(), 10000); // cada 10 seg
  }

  async detectFrame() {
    if (!this.modelosListos) return;
    console.log("modelos listos para deteccion")
    const video = this.videoRef.nativeElement;
    const now = performance.now();
    
    try{
        const faceResult: FaceLandmarkerResult = await this.faceLandmarker.detectForVideo(video, now);
        const objectResult: ObjectDetectorResult = await this.objectDetector.detectForVideo(video, now);
        console.log("obj restult ",objectResult)
    
        this.evaluateSomnolence(faceResult);
        this.evaluateObjects(objectResult);
    }
    catch(e){
        console.log("Error al detectar objetos o somnolencia: ", e);
    }
    const elapsedMinutes = this.getElapsedMinutesIfMultipleOfTen();

    if( elapsedMinutes !==null ){
        this.enviarAttentionInfo(elapsedMinutes);
        this.resetAttentionInfo();
        
    }    
  }
  
  evaluateSomnolence(result: FaceLandmarkerResult) {
    if (result.faceLandmarks.length === 0) return;
    const [leftEAR, rightEAR] = this.getEyesEAR(result.faceLandmarks[0]);
    const avgEAR = (leftEAR + rightEAR) / 2;

    if (avgEAR < this.earThreshold) {
      this.minutesSomnolence++;
      if (this.minutesSomnolence >= 1 ) {
        this.isSomnolence = true;
        this.attention.isSomnolence = true;
        this.attention.minutesSomnolence = this.minutesSomnolence*6/60;        
        this.pushActividad('Somnolencia', this.minutesSomnolence*6/60)
        this.alerta("Somolencia detectada ")
      }
    } else {
      this.minutesSomnolence = 0;
      this.isSomnolence = false;
    }
  }
  evaluateObjects(resultObj: ObjectDetectorResult) {
    console.log("detections ", resultObj.detections)
    if(resultObj.detections.length === 0 ) return;
    const hasPhone = resultObj.detections.some(d => d.categories[0].categoryName === 'cell phone');
    const hasPerson = resultObj.detections.some(d => d.categories[0].categoryName === 'person');
    
    console.log("hay person ",hasPerson,)
    console.log("has phone init ",hasPhone)
    //
    
    if (hasPerson) {
        this.minutesAbsent++;
        if (this.minutesAbsent >= 1)  {
            this.isAbsent = true;
            this.attention.isAbsent = true;
            this.attention.minutesAbsent = this.minutesAbsent*6/60;
            this.pushActividad('Ausencia', this.minutesAbsent);
            this.alerta('Ausencia detectada');
            
        }
            
    } else {
      this.minutesAbsent = 0;
      this.isAbsent = false;
    }

    if (hasPhone) {
      this.minutesUsePhone++;
      console.log("use phone ",this.usePhone)
      if (!this.usePhone) {
          this.usePhone = true;
          this.attention.usePhone = true;
          this.attention.minutesUsePhone = this.minutesUsePhone*6/60;
          this.pushActividad('Uso de celular', this.minutesUsePhone);
          this.alerta('Uso de celular detectado');
      }
    } else {
      this.usePhone = false;
      this.minutesUsePhone = 0;
    }
  }
  getEyesEAR(landmarks: NormalizedLandmark[]): [number, number] {
    const dist = (a: NormalizedLandmark, b: NormalizedLandmark) => Math.hypot(a.x - b.x, a.y - b.y);

    const leftEAR = (
      dist(landmarks[159], landmarks[145]) +
      dist(landmarks[160], landmarks[144])
    ) / (2.0 * dist(landmarks[33], landmarks[133]));

    const rightEAR = (
      dist(landmarks[386], landmarks[374]) +
      dist(landmarks[385], landmarks[380])
    ) / (2.0 * dist(landmarks[362], landmarks[263]));

    return [leftEAR, rightEAR];
  }

  alerta(msg: string) {
    const audio = new Audio('/alerts/alert.mp3');
    audio.play();
    this.snackBar.open(msg, 'OK', { duration: 5000 }).onAction().subscribe(() => 
      {
        audio.pause()
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

  enviarAttentionInfo(minutesElapsedInSession: number = 10) {
    const attentionSend = structuredClone(this.attention);
    attentionSend.session.sessionId = this.sessionActiva.sessionId;
    attentionSend.studentId = this.authServ.studentProfile$()?.studentId || '';
    attentionSend.minutesElapsedInSession = minutesElapsedInSession;

    this.attentionServ.registerAttention(attentionSend).subscribe(() => {
        console.log("envio de datos: ", attentionSend)
       
    });
  }

  resetAttentionInfo() {
    //clearInterval(this.videoInterval);
    this.attention = {
        minutesElapsedInSession: 0,
        usePhone: false,
        minutesUsePhone: 0,
        isSomnolence: false,
        numberOfYawns: 0, 
        minutesSomnolence: 0,
        isAbsent: false,
        minutesAbsent: 0,
        attention: 0,
        isConnectedFromBegining: true,
        studentId: '', 
        session: { sessionId: '' }
    };
    this.isSomnolence = false;
    this.isAbsent = false;
    this.usePhone = false;
    this.minutesSomnolence = 0;
    this.minutesAbsent = 0;
    this.minutesUsePhone = 0;
    this.minuteCounter = 0;
  }
  isNowWithinSession(session: Session): boolean {
    const now = DateTime.now();
    // es string o Date
    let sessionDateLuxon: DateTime;
    if (typeof session.date === 'string') {
      // string tipo "YYYY-MM-DD"
      sessionDateLuxon = DateTime.fromISO(session.date);
    } else {
      sessionDateLuxon = DateTime.fromJSDate(session.date);
    }

    const sessionDateStr = sessionDateLuxon.toISODate(); // "YYYY-MM-DD"

    const startDateTime = DateTime.fromISO(`${sessionDateStr}T${session.startHours}`);
    const endDateTime = DateTime.fromISO(`${sessionDateStr}T${session.endHours}`);

    const isSameDay = now.hasSame(startDateTime, 'day');
    const isInTimeRange = now >= startDateTime && now <= endDateTime;

    return isSameDay && isInTimeRange;
  }
  getElapsedMinutesIfMultipleOfTen(): number | null {
    const ZONE = 'America/Lima'; // zona horaria real

    const now = DateTime.now().setZone(ZONE);

    // Convertir session.date a ISO string si es Date
    const sessionDateStr = 
      typeof this.sessionActiva.date === 'string'
        ? this.sessionActiva.date
        : DateTime.fromJSDate(this.sessionActiva.date).toISODate();

    const startDateTime = DateTime.fromISO(`${sessionDateStr}T${this.sessionActiva.startHours}`, { zone: ZONE });
    const elapsed = Math.floor(now.diff(startDateTime, 'minutes').minutes);
    
    if (elapsed > 0 && elapsed % 2 === 0 && elapsed <= this.sessionActiva.sessionDurationMinutes && elapsed !== this.lastElapsedSent) {
        this.lastElapsedSent = elapsed;
        return elapsed;
    }

    return null;
  }
  ngOnDestroy(): void {
      clearInterval(this.videoInterval)
  }

}
  