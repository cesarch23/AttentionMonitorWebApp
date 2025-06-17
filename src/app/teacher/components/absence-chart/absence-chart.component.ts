import { AfterViewInit, Component, computed, effect, input, Input, OnChanges, Signal, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ArcElement, Chart, ChartConfiguration, ChartData, ChartType, Legend, Tooltip } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AbsentChart } from '../../../core/models/model.interface';
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
  /** 2️⃣ Recibe un Signal con los datos (o null) */
  @Input({ required: true }) absentData!: Signal<AbsentChart | null>;


  /** Opciones del gráfico */
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
   
    const input = this.absentData();
    const values = input?.data?.length === 2
      ? input.data
      : [20, 10];

    return {
      labels: ['Ausentes', 'No Ausentes'],
      datasets: [
        {
          data: values,
          backgroundColor: ['#e53935', '#43a047'],
        },
      ],
    };
  });
   
}
