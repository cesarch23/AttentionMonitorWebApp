import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

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
   @Input() nivelesAtencion: number[] = [];

  
  public readonly tiempoLabels: string[] = Array.from({ length: 13 }, (_, i) => `${i * 10} min`);

  
  public get lineChartData(): ChartConfiguration<'line'>['data'] {
    return {
      labels: this.tiempoLabels,
      datasets: [
        {
          data: this.nivelesAtencion,
          label: 'Nivel de Atención (%)',
          borderColor: '#1e88e5',
          backgroundColor: 'rgba(30, 136, 229, 0.3)',
          pointBackgroundColor: '#1e88e5',
          pointRadius: 4,
          fill: true,
          tension: 0,
        },
      ],
    };
  }

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tiempo (minutos)',
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Nivel de atención (%)',
        },
        ticks: {
          callback: value => `${value}%`,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: context => `${context.parsed.y}% de atención`,
        },
      },
    },
  };

}
