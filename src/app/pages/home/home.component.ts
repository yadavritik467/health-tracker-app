import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription, take, tap } from 'rxjs';
import { WorkoutsEnum } from 'src/app/enum/enum';
import { Users, Workouts } from 'src/app/interface/interface';
import { HelperService } from 'src/app/service/helper.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  subscription: Subscription = new Subscription();
  workoutForm: FormGroup;
  workoutsOpt = WorkoutsEnum;
  users: Observable<Users[]> = this.helperService.users$;
  workoutTypes = Object.values(WorkoutsEnum);
  itemsPerPage$: Observable<number> = this.helperService.itemsPerPage$;
  currentPage$: Observable<number> = this.helperService.currentPage$;
  totalPages$: Observable<number> = this.helperService.totalPages$;
  invalid: boolean = false;

  constructor(private fb: FormBuilder, private helperService: HelperService) {
    this.workoutForm = this.fb.group({
      name: ['', Validators.required],
      workoutType: ['', Validators.required],
      minutes: ['', [Validators.required, Validators.min(1)]],
    });
  }

  addWorkout() {
    this.invalid = true;
    if (this.workoutForm.valid) {
      this.helperService.addWorkout(this.workoutForm.value);
      this.workoutForm.reset();
      this.invalid = false;
    }
  }

  getTotalMinutes(workouts: Workouts[]) {
    return workouts.reduce((acc, curr) => acc + Number(curr.minutes), 0);
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.helperService.searchByName(value);
  }

  onSelectionChange(event: Event) {
    const value = (event.target as HTMLInputElement)?.value;
    this.helperService.filterByWorkoutType(value);
  }

  updatePagination(event: Event) {
    const value = Number((event.target as HTMLInputElement)?.value);
    this.helperService.setItemsPerPage(value);
  }

  prevPage() {
    this.helperService.prevPage();
  }

  nextPage() {
    this.helperService.nextPage();
  }
}
