import { Component, effect, input, Input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { LineChart, Session } from '../../../core/models/model.interface';
import { MatDialog } from '@angular/material/dialog';
import { AttentionTableComponent } from '../attention-table/attention-table.component';

@Component({
  selector: 'teacher-attention-chart',
  standalone: true,
  imports: [
      MatCardModule,
      BaseChartDirective,
      MatButtonModule,
      MatIcon,
  ],
  templateUrl: './attention-chart.component.html',
  styleUrl: './attention-chart.component.css'
})
export class AttentionChartComponent {
  @Input({ required: true }) session= signal<Session | null> (null);
  attentionData = input<LineChart | null>(null);
  
  lineChartData = signal<ChartConfiguration<'line'>['data']>({
      labels: [],
      datasets: [],
    });
  
  constructor(private dialog:MatDialog) {
      effect(() => {
      const data = this.attentionData();
      if (!data) return;
      this.lineChartData.update(() => ({
        labels: data.labels,
        datasets: [
          {
            data: data.data,
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
            text: 'nivel de atención ',
          },
          ticks: {
            callback: (value) => Number.isInteger(value) ? `${value}%` : '',
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: context => `${context.parsed.y}% de nivel de atencion en promedio`,
          },
        },
      },
    };

  showAttentionStudents(){
      if(!this.session()?.sessionId) return;
      this.dialog.open(AttentionTableComponent,{ 
        data: { sessionId: this.session()!.sessionId },
        minWidth:'400px',
        maxWidth: '900px'
      })
    }

  //  @Input() nivelesAtencion: LineChart | null = null;

  
  // public readonly tiempoLabels: string[] = Array.from({ length: 13 }, (_, i) => `${i * 10} min`);

  
  // public get lineChartData(): ChartConfiguration<'line'>['data'] {
  //   return {
  //     labels: this.tiempoLabels,
  //     datasets: [
  //       {
  //         data: this.nivelesAtencion,
  //         label: 'Nivel de Atención (%)',
  //         borderColor: '#1e88e5',
  //         backgroundColor: 'rgba(30, 136, 229, 0.3)',
  //         pointBackgroundColor: '#1e88e5',
  //         pointRadius: 4,
  //         fill: true,
  //         tension: 0,
  //       },
  //     ],
  //   };
  // }

  // public lineChartOptions: ChartOptions<'line'> = {
  //   responsive: true,
  //   scales: {
  //     x: {
  //       title: {
  //         display: true,
  //         text: 'Tiempo (minutos)',
  //       },
  //     },
  //     y: {
  //       beginAtZero: true,
  //       max: 100,
  //       title: {
  //         display: true,
  //         text: 'Nivel de atención (%)',
  //       },
  //       ticks: {
  //         callback: value => `${value}%`,
  //       },
  //     },
  //   },
  //   plugins: {
  //     legend: {
  //       display: false,
  //     },
  //     tooltip: {
  //       callbacks: {
  //         label: context => `${context.parsed.y}% de atención`,
  //       },
  //     },
  //   },
  // };

}
