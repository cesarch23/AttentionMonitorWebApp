import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MultitaskingChartComponent } from "../../components/multitasking-chart/multitasking-chart.component";
import { SomnolenceChartComponent } from "../../components/somnolence-chart/somnolence-chart.component";
import { AbsenceChartComponent } from "../../components/absence-chart/absence-chart.component";
import { AttentionChartComponent } from "../../components/attention-chart/attention-chart.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatInputModule,
    MatIcon,
    MatButton,
    MatFormFieldModule,
    MultitaskingChartComponent,
    SomnolenceChartComponent,
    AbsenceChartComponent,
    AttentionChartComponent
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    nivelesAtencion=[80, 85, 75, 70, 60, 65, 68, 70, 75, 78, 80, 82, 85];
}
