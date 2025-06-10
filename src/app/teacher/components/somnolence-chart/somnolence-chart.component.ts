import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'teacher-somnolence-chart',
  standalone: true,
  imports: [
    MatCardModule,
    BaseChartDirective,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './somnolence-chart.component.html',
  styleUrl: './somnolence-chart.component.css'
})
export class SomnolenceChartComponent {
   public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['0 min', '10 min', '20 min', '30 min', '40 min', '50 min', '60 min'],
    datasets: [
      {
        data: [20, 35, 50, 45, 65, 80, 75],
        label: 'Nivel de somnolencia',
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
        max: 100,
        title: {
          display: true,
          text: 'Porcentaje de Estudiantes (%)',
        },
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: context => `${context.parsed.y}% de estudiantes`,
        },
      },
    },
  };

  
} 
