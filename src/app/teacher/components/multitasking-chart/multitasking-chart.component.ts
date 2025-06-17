import { Component, computed, effect, Input, input, signal } from '@angular/core';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { PhoneLineChart, Session } from '../../../core/models/model.interface';
import { MatDialog } from '@angular/material/dialog';
import { MultitaskingTableComponent } from '../multitasking-table/multitasking-table.component';

@Component({
  selector: 'teacher-multitasking-chart',
  standalone: true,
  imports: [
    MatCardModule,
    BaseChartDirective,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './multitasking-chart.component.html',
  styleUrl: './multitasking-chart.component.css'
})
export class MultitaskingChartComponent {

  phoneUseData = input<PhoneLineChart | null>(null);
  @Input({ required: true }) session= signal<Session | null> (null);
  lineChartData = signal<ChartConfiguration<'line'>['data']>({
    labels: [],
    datasets: [],
  });

  constructor(private dialog:MatDialog) {
    effect(() => {
    const data = this.phoneUseData();
    if (!data) return;
    this.lineChartData.update(() => ({
      labels: data.labels,
      datasets: [
        {
          data: data.data,
          label: 'Porcentaje de estudiantes',
          fill: false,
          tension: 0,
          borderColor: '#3f51b5',
          pointBackgroundColor: '#3f51b5',
          pointBorderWidth: 2,
          pointRadius: 5,
        },
      ],
    }));
  }, { allowSignalWrites: true });
  }

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tiempo Transcurrido (minutos)',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Estudiantes',
        },
        ticks: {
          callback: (value) => Number.isInteger(value) ? value : '',
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: context => `${context.parsed.y} estudiantes`,
        },
      },
    },
  };
  showMultitaskingStudents(){
      if(!this.session()?.sessionId) return;
      this.dialog.open(MultitaskingTableComponent,{ 
        data: { sessionId: this.session()!.sessionId },
        minWidth:'400px',
        maxWidth: '900px'
      })
    }
   

}
