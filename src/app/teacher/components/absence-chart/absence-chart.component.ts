import { AfterViewInit, Component, computed, effect, inject, input, Input, OnChanges, Signal, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ArcElement, Chart, ChartConfiguration, ChartData, ChartType, Legend, Tooltip } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AbsentChart, Session } from '../../../core/models/model.interface';
import { MatDialog } from '@angular/material/dialog';
import { MultitaskingTableComponent } from '../multitasking-table/multitasking-table.component';
import { AbsentTableComponent } from '../absent-table/absent-table.component';
Chart.register(ArcElement, Tooltip, Legend);
@Component({
  selector: 'teacher-absence-chart',
  standalone: true,
  imports: [
    MatCardModule,
    BaseChartDirective,
    MatButtonModule,
    MatIcon,
    BaseChartDirective,
  ],
  templateUrl: './absence-chart.component.html',
  styleUrl: './absence-chart.component.css'
})
export class AbsenceChartComponent {
   
  // @Input({ required: true }) absentData!: Signal<number[]>;
  absentData = input<number [] | null>([]);
  // attentionData = input<LineChart | null>(null);
  @Input({ required: true }) session= signal<Session | null> (null);
  private dialog = inject(MatDialog);
  
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          // Calcula porcentaje real a partir de cualquier par de valores
          label: ctx => {
            const ds = ctx.chart.data.datasets[0].data as number[];
            const total = ds.reduce((sum, v) => sum + v, 0);
            const pct = total > 0
              ? ((ctx.parsed as number / total) * 100).toFixed(2) + '%'
              : '0%';
            return `${ctx.label}: ${pct}`;
          },
        },
      },
    },
  };


  public pieChartData = computed<ChartData<'pie', number[], string>>(() => {
    console.log("recibiendo en chart",this.absentData())
    const input = this.absentData();
    const values = input?.length === 2
      ? [...input]
      : [0, 100];
    console.log("data recibido. ",input)
    return {
      labels: ['Presentes', 'Ausentes'],
      datasets: [
        {
          data: values,
          backgroundColor: ['#43a047','#e53935'],
        },
      ],
    };
  });
   
  showAbsentStudents(){
    if(!this.session()?.sessionId) return;
    this.dialog.open(AbsentTableComponent,{ 
      data: { sessionId: this.session()!.sessionId },
      minWidth:'400px',
      maxWidth: '900px'
    })
  }
}
