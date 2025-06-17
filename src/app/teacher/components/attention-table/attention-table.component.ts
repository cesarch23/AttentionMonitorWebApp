import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Attention, RequestStatus } from '../../../core/models/model.interface';
import { MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { AttentionService } from '../../../core/services/attention.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-attention-table',
  standalone: true,
  imports: [
      MatTableModule,
      MatPaginatorModule,
      MatSort,
      MatSortModule,
      MatDialogContent
  ],
  templateUrl: './attention-table.component.html',
  styles: ''
})
export class AttentionTableComponent implements OnInit,AfterViewInit  {
  itemsColumns = ['paternalLastname','actividad','minutesUsePhone','description','minutesElapsedInSession'] 
  dataSource = new MatTableDataSource<Attention>()
  readonly data = inject<{sessionId:string}>(MAT_DIALOG_DATA);
  private attentionServ = inject(AttentionService)
  attentionRequestStatus:RequestStatus = 'init'
  messageError:string='Error';
      
      
    ngOnInit(): void {
      this.attentionRequestStatus='loading'
      this.attentionServ.getAttentionDetails(this.data.sessionId).subscribe({
        next:(attentions)=>{
          this.attentionRequestStatus='success'
          this.dataSource.data = attentions;
          console.log("attentnion ", attentions)
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
