import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  public errorMessage = '';
  actividades:{activity:string,percentage:number,time:number}[] = [
    {activity:"Somnolencia",percentage:12,time:8},
    {activity:"Uso de telefono",percentage:96,time:8}
  ]
  activityColumns = ['actividad','time'] 
  activityDataSource = new MatTableDataSource<{activity:string,percentage:number,time:number}>(this.actividades)
      
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
 
      this.activityDataSource.paginator = this.paginator ? this.paginator : null;
      this.activityDataSource.sort= this.sort ? this.sort : null;
  }
  
  @ViewChild(MatPaginator) paginator?: MatPaginator
  @ViewChild(MatSort) sort?:MatSort
     
 public isCameraActive = false;

  public activarCamara(): void {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.isCameraActive = true;
        this.videoRef.nativeElement.srcObject = stream;
        this.videoRef.nativeElement.play();
      })
      .catch((err) => {
        this.isCameraActive = false;
        this.handleCameraError(err);
      });
  }

  private handleCameraError(error: any): void {
    console.error('Error al acceder a la cámara:', error);

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      this.errorMessage = 'Permiso denegado para usar la cámara. Habilítalo desde la configuración del navegador.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      this.errorMessage = 'No se encontró ninguna cámara disponible.';
    } else {
      this.errorMessage = 'No se pudo acceder a la cámara. Intenta recargar la página o usar otro navegador.';
    }
  }
}
