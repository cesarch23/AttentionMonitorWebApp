import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogContent } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Attention, RequestStatus } from '../../../core/models/model.interface';
import { AttentionService } from '../../../core/services/attention.service';

@Component({
  selector: 'app-multitasking-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSort,
    MatSortModule,
    MatDialogContent
  ],
  templateUrl: './multitasking-table.component.html',
  styleUrl: './multitasking-table.component.css'
})
export class MultitaskingTableComponent implements OnInit,AfterViewInit{
     
    itemsColumns = ['paternalLastname','Actividad','minutesUsePhone','description','minutesElapsedInSession'] 
    dataSource = new MatTableDataSource<Attention>()
    readonly data = inject<{sessionId:string}>(MAT_DIALOG_DATA);
    private attentionServ = inject(AttentionService)
    attentionRequestStatus:RequestStatus = 'init'
    messageError:string='Error';


    ngOnInit(): void {
      this.attentionServ.getAttentionMultitaskingDetails(this.data.sessionId).subscribe({
        next:(attentions)=>{
          this.attentionRequestStatus='success'
          this.dataSource.data = attentions;
          
        },
        error:(messageError)=>{
          this.attentionRequestStatus='failed'
          this.messageError= messageError;
        }
      })

    }
    @ViewChild(MatPaginator) paginator?: MatPaginator
    @ViewChild(MatSort) sort?:MatSort
   
    ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator ? this.paginator : null;
      this.dataSource.sort= this.sort ? this.sort : null;
    }
}
