import { Component, inject, OnDestroy, OnInit, signal, Signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MultitaskingChartComponent } from "../../components/multitasking-chart/multitasking-chart.component";
import { SomnolenceChartComponent } from "../../components/somnolence-chart/somnolence-chart.component";
import { AbsenceChartComponent } from "../../components/absence-chart/absence-chart.component";
import { AttentionChartComponent } from "../../components/attention-chart/attention-chart.component";
import { SessionsService } from '../../../core/services/sessions.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AbsentChart, LineChart, PhoneLineChart, RequestStatus, Session } from '../../../core/models/model.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { AttentionService } from '../../../core/services/attention.service';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatInputModule,
    MatIcon,
    MatButton,
    MatFormFieldModule,
    ReactiveFormsModule,
    MultitaskingChartComponent,
    SomnolenceChartComponent,
    AbsenceChartComponent,
    AttentionChartComponent
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnDestroy,OnInit {
    //nivelesAtencion=[80, 85, 75, 70, 60, 65, 68, 70, 75, 78, 80, 82, 85];
    
    conected: boolean= false;
    session = signal<Session | null>(null);
    sessionId = new FormControl<string | null>(null,Validators.required)
    
    phoneUseData:PhoneLineChart | null = null;
    phoneRequest:RequestStatus = 'init'
    messageErrorPhoneUse:string = 'Ocurrio un error';
   
    somnolenceData:LineChart | null = null;
    somnolenceRequest:RequestStatus = 'init'
    messageErrorSomn:string = 'Ocurrio un error';

    attenionAvrgInfo:LineChart | null = null;
    attenionAvrgRequest:RequestStatus = 'init'
    messageErrorAvrg:string = 'Ocurrio un error';
    
    absenceInfo = signal<AbsentChart>({data:[100,0]});
    absentRequest:RequestStatus = 'init'
    messageErrorAbsent:string = 'Ocurrio un error';
    
    private sessionServ = inject(SessionsService)
    private attentionServ = inject(AttentionService)
    private noticationServ = inject(NotificationService)
    private dataServ = inject(DataService)

    ngOnInit(): void {
      this.dataServ.idSession$.subscribe(sessionId=> this.sessionId.setValue(sessionId || '') )
    }

    conectarSesion(){
      this.sessionId.markAsTouched();
      if(this.sessionId.invalid) return;
      const id = this.sessionId.value;
      if(!id) return;
      this.sessionServ.getSessionById(id).subscribe({
        next:(session)=>{
          console.log("sesion de la peticion",session)
          this.session.update(()=>session)
          this.conected = true;
          this.noticationServ.show('Conectado. Espere mientra obtenemos los datos','success')
          this.chargeCharts()
        },
        error:(errorMessage)=>{
          this.noticationServ.show(errorMessage,'error')
          this.conected = false;
        }
      })

    }

    chargePhoneUse(sessionId:string){
      this.phoneRequest = 'loading'
      this.attentionServ.getUsePhoneLineChart(sessionId).subscribe({
        next:(data)=>{
          this.phoneRequest = 'success'
          this.phoneUseData = data
        },
        error:(messageError)=>{
          this.phoneRequest = 'failed'
          this.messageErrorPhoneUse = messageError;
        }
      })
    }
    chargeSomnolenceData(sessionId:string){
      this.somnolenceRequest = 'loading'
      this.attentionServ.getSomnolenceLineChart(sessionId).subscribe({
        next:(data)=>{
          this.somnolenceRequest = 'success'
          this.somnolenceData = data
        },
        error:(messageError)=>{
          this.somnolenceRequest = 'failed'
          this.messageErrorSomn = messageError;
        }
      })
    }
    chargeAbsentData(sessionId:string){
      this.absentRequest = 'loading'
      this.attentionServ.getAbsentChart(sessionId).subscribe({
        next:(data)=>{
          this.absentRequest = 'success'
          this.absenceInfo.set(data)
        
        },
        error:(messageError)=>{
          this.absentRequest = 'failed'
          this.messageErrorAbsent = messageError;
        }
      })
    }
    chargeAttentionAvrgData(sessionId:string){
      this.attenionAvrgRequest = 'loading'
      this.attentionServ.getAttentionAvrgChart(sessionId).subscribe({
        next:(data)=>{
          this.attenionAvrgRequest = 'success'
          this.attenionAvrgInfo = data
          
        },
        error:(messageError)=>{
          this.attenionAvrgRequest = 'failed'
          this.messageErrorAvrg = messageError;
        }
      })
    }

    updateCharts(){
      if(!this.sessionId.value) {
        this.noticationServ.show('Ingresa el codigo de la sesion','warning')
        return;
      }
      this.sessionServ.getSessionById(this.sessionId.value).subscribe({
        next:(session)=>{
          console.log("sesion de la peticion",session)
          this.session.update(()=>session)
          this.conected = true;
          this.noticationServ.show('Conectado. Espere mientra obtenemos los datos','success')
          this.chargeCharts()
        },
        error:(errorMessage)=>{
          this.noticationServ.show(errorMessage,'error')
          this.conected = false;
        }
      })
      
      
    }
    chargeCharts(){
      this.chargePhoneUse(this.sessionId.value || '');
      this.chargeSomnolenceData(this.sessionId.value || '');
      this.chargeAbsentData(this.sessionId.value || '');
      this.chargeAttentionAvrgData(this.sessionId.value || '');
    }
    ngOnDestroy(): void {
        this.absenceInfo.set({data:[100,0]})
    }
}
