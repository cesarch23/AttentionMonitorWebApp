import { Component, Input, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'teacher-absence-chart',
  standalone: true,
  imports: [
    MatCardModule,
    BaseChartDirective,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './absence-chart.component.html',
  styleUrl: './absence-chart.component.css'
})
export class AbsenceChartComponent {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @Input() ausentes = 0;
  @Input() noAusentes = 0;

  public pieChartType: ChartType = 'pie';

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  public get pieChartData(): ChartData<'pie', number[], string | string[]> {
    return {
      labels: ['Ausentes', 'No Ausentes'],
      datasets: [
        {
          data: [this.ausentes, this.noAusentes],
          backgroundColor: ['#e53935', '#43a047'],
        },
      ],
    };
  }

 

   

}
