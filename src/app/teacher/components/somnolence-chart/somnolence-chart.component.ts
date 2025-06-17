import { Component, effect, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { LineChart } from '../../../core/models/model.interface';

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
    somnolenceData = input<LineChart | null>(null);
  
    lineChartData = signal<ChartConfiguration<'line'>['data']>({
      labels: [],
      datasets: [],
      
    });
  
    constructor() {
      effect(() => {
      const data = this.somnolenceData();
      if (!data) return;
      this.lineChartData.update(() => ({
        labels: data.labels,
        datasets: [
          {
            data: data.data,
            label: 'Número de Estudiantes',
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
          text: 'Número de estudiantes',
        },
        ticks: {
          callback: (value) => Number.isInteger(value) ? value : '',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: context => `${context.parsed.y} de estudiantes`,
        },
      },
    },
  };

  
} 
