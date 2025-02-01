import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartDataComponent } from './chart-data.component';
import { Route, RouterModule } from '@angular/router';

const routes: Route[] = [{ path: '', component: ChartDataComponent }];
@NgModule({
  declarations: [ChartDataComponent],
  imports: [CommonModule, RouterModule.forChild(routes), NgChartsModule],
})
export class ChartDataModule {}
