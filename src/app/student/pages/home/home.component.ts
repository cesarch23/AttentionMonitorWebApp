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
  private audio: HTMLAudioElement | null = null

  private somnolenceStartTime: DateTime | null = null;
  private absenceStartTime: DateTime | null = null;
  private phoneStartTime: DateTime | null = null;
  
  // Umbrales de tiempo en milisegundos
  private readonly SOMNOLENCE_THRESHOLD_S = 120; // 2 minutos = 120 segundos
  private readonly ABSENCE_THRESHOLD_S = 120;    // 2 minutos
  private readonly PHONE_THRESHOLD_S = 180;      // 3 minutos



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

  // States
  isSomnolence = false;
  isAbsent = false;
  usePhone = false;

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
        modelAssetPath: '/models/efficientdet_lite0_32.tflite',
        delegate:'GPU'
       },
      scoreThreshold: 0.45,
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
    this.videoInterval = setInterval(() => {
      this.detectFrame()
    }, 2000); // cada 5 seg
  }

  async detectFrame() {
    if (!this.modelosListos) return;
    // console.log("modelos listos para deteccion")
    const video = this.videoRef.nativeElement;
    const now = performance.now();
    
    try{
        const now2 = DateTime.now()
        const faceResult: FaceLandmarkerResult = this.faceLandmarker.detectForVideo(video, now);
        const objectResult: ObjectDetectorResult = await this.objectDetector.detectForVideo(video, now);
        // console.log("obj restult ",objectResult)
    
        this.evaluateSomnolence(faceResult, now2);
        this.evaluateObjects(objectResult, now2);
        const elapsedMinutes = this.getElapsedMinutesIfMultipleOfTen();
        // console.log("after elapsed: ",elapsedMinutes) 

        if( elapsedMinutes !==null ){
            this.enviarAttentionInfo(elapsedMinutes);
            this.resetAttentionInfo();     
        } 
    }
    catch(e){
        console.log("Error al detectar objetos o somnolencia ");
    }   
  }

  evaluateSomnolence(result: FaceLandmarkerResult,currentTime:DateTime) {
    if (result.faceLandmarks.length === 0) return;
    const [leftEAR, rightEAR] = this.getEyesEAR(result.faceLandmarks[0]);
    const avgEAR = (leftEAR + rightEAR) / 2;

    if (avgEAR < this.earThreshold) {
      if (this.somnolenceStartTime === null) {
        this.somnolenceStartTime = currentTime;
      }
      const somnolenceTime = currentTime.diff(this.somnolenceStartTime, 'seconds').seconds;
      if (somnolenceTime >= this.SOMNOLENCE_THRESHOLD_S && !this.isSomnolence) {
        this.isSomnolence = true;
        this.attention.isSomnolence = true;
        this.alerta("Somolencia detectada ")
      }
    } else {
      // Ojos abiertos
      if (this.somnolenceStartTime !== null && this.isSomnolence) {
        // Calcular tiempo total de somnolencia y agregarlo al acumulado
        const totalSomnolenceTime = currentTime.diff(this.somnolenceStartTime,'minutes').minutes;
        this.attention.minutesSomnolence += totalSomnolenceTime;

        if(this.attention.minutesSomnolence>0)
          this.pushActividad('Somnolencia', this.attention.minutesSomnolence)
      }
      this.somnolenceStartTime = null;
      this.isSomnolence = false;
    }
  }
  evaluateObjects(resultObj: ObjectDetectorResult, currentTime:DateTime) {
    // console.log("detections ", resultObj.detections)
    let hasPhone = resultObj.detections.some(d =>d.categories[0].categoryName === 'cell phone');
    let hasPerson = resultObj.detections.some(d =>d.categories[0].categoryName === 'person');
    
    // console.log("hay person: ",hasPerson)
    // console.log("has phone: ",hasPhone)
    
    if (!hasPerson) {
        if (this.absenceStartTime === null) {
          this.absenceStartTime = currentTime;
        }
        const absenceTime = currentTime.diff(this.absenceStartTime,'seconds').seconds;

        if (absenceTime >= this.ABSENCE_THRESHOLD_S && !this.isAbsent)  {
            this.attention.isAbsent = true;
            this.isAbsent = true;         
            this.alerta('Ausencia detectada');
        }
            
    } else {
      //Persona presente
      if (this.absenceStartTime !== null && this.isAbsent) {
        const totalAbsenceTime = currentTime.diff(this.absenceStartTime,'minutes').minutes;//EN MINUTOS
        this.attention.minutesAbsent += totalAbsenceTime;
        if(this.attention.minutesAbsent>0)
          this.pushActividad('Ausencia', this.attention.minutesAbsent);
      }
      this.absenceStartTime = null
      this.isAbsent = false;
    }

    if (hasPhone) {
      // console.log("use phone ",this.usePhone)
      if (this.phoneStartTime === null) {
        this.phoneStartTime = currentTime
      }
      const phoneTime = currentTime.diff(this.phoneStartTime,'seconds').seconds;

      if (phoneTime >= this.PHONE_THRESHOLD_S && !this.usePhone) {
          this.usePhone = true
          this.attention.usePhone = true
          this.alerta('Uso de celular detectado')
      }
    } else {
      //No hay teléfono - reset del temporizador
      if (this.phoneStartTime !== null && this.usePhone) {
        const totalPhoneTime = currentTime.diff(this.phoneStartTime,'minutes').minutes;// cambiar a minutos
        this.attention.minutesUsePhone += totalPhoneTime;
        if(this.attention.minutesUsePhone>0)
            this.pushActividad('Uso de celular', this.attention.minutesUsePhone)
      }
      this.phoneStartTime = null
      this.usePhone = false
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

     // Si no hay audio creado, lo inicializamos
    if (!this.audio) {
      this.audio = new Audio('/alerts/alert.mp3');
    }

    // Solo reproducimos si NO está sonando ya
    if (this.audio.paused) {
      this.audio.play();
    }

    // Mostramos el snackbar
    this.snackBar.open(msg, 'OK', { duration: 10000 })
      .onAction()
      .subscribe(() => {
        if (this.audio) {
          this.audio.pause();
        }
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
        // console.log("data sended: ", attentionSend)
       
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
     //cambiar por 10 para que sea cada 10 minutos 
    if (elapsed > 0 && elapsed % 10 === 0 && elapsed <= this.sessionActiva.sessionDurationMinutes && elapsed !== this.lastElapsedSent) {
        this.lastElapsedSent = elapsed;
        return elapsed;
    }
    return null;
    
  }
  stopCamara(){
    // Detener cámara
    this.isCameraActive = false;
    if (this.videoRef?.nativeElement?.srcObject) {
      const stream = this.videoRef.nativeElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }
  ngOnDestroy(): void {
    clearInterval(this.videoInterval)
    
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    this.stopCamara();
  }
  disconectToSession(){
    clearInterval(this.videoInterval)
    this.stopCamara();
    this.conected = false;
    
  }

}
  