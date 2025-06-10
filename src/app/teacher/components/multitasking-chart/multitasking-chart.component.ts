import { Component, ViewChild } from '@angular/core';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

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
  
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['0 min', '10 min', '20 min', '30 min', '40 min', '50 min', '60 min'],
    datasets: [
      {
        data: [12, 18, 24, 20, 28, 35, 30],
        label: 'Número de Estudiantes',
        fill: false,
        tension: 0,
        borderColor: '#3f51b5',
        pointBackgroundColor: '#3f51b5',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  public lineChartOptions: ChartOptions<'line'> = {
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
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: context => `${context.parsed.y} estudiantes`,
        },
      },
    },
  };

   

}
