import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { DataSets, Users } from 'src/app/interface/interface';
import { HelperService } from 'src/app/service/helper.service';

@Component({
  selector: 'app-chart-data',
  templateUrl: './chart-data.component.html',
  styleUrls: ['./chart-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartDataComponent implements OnInit, AfterViewInit, OnDestroy {
  labels: string[] = [];
  datasets: DataSets[] = [];
  userWorkouts: Users[] = [];
  userIndex: number = 0;
  chart: Chart | undefined;
  constructor(private helperService: HelperService) {}

  ngOnInit(): void {
    this.userWorkouts = this.helperService.getUsers();
    if (this.userWorkouts?.length) {
      this.addDataInChart(this.userWorkouts[0]);
    }
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  updateUserChart(i: number) {
    this.userIndex = i;
    this.addDataInChart(this.userWorkouts[i]);
    this.createChart();
  }

  addDataInChart(workoutData: Users) {
    this.labels = workoutData?.workouts?.map((data) => data?.type);
    this.datasets = [
      {
        label: '',
        data: workoutData?.workouts?.map((data) => Number(data?.minutes)),
        backgroundColor: ['#6a73fa'],
        barPercentage: 0.2,
      },
    ];
  }

  createChart() {
    const ctx = document.getElementById('workoutChart') as HTMLCanvasElement;
    ctx.height = 100;
    const data = {
      labels: this.labels,
      datasets: this.datasets,
    };

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
