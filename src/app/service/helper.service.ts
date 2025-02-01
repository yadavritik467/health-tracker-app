import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { WorkoutsEnum } from '../enum/enum';
import { Users } from '../interface/interface';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  private users: Users[] = [];
  private usersSubject = new BehaviorSubject<Users[]>([]);
  private itemsPerPageSubject = new BehaviorSubject<number>(5);
  public currentPageSubject = new BehaviorSubject<number>(1);
  public totalPagesSubject = new BehaviorSubject<number>(0);

  itemsPerPage$ = this.itemsPerPageSubject.asObservable();
  currentPage$ = this.currentPageSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();
  users$ = this.usersSubject.asObservable();

  constructor(private readonly toastr: ToastrService) {
    this.loadUsersFromStorage();
    this.totalPagesSubject.next(
      Math.ceil(this.users.length / this.itemsPerPageSubject.value)
    );
    this.sliceUserData();
  }

  private loadUsersFromStorage() {
    const storedUsers = localStorage.getItem('userData');
    this.users = storedUsers ? JSON.parse(storedUsers) : this.getDefaultUsers();
    this.updateUserState();
  }

  private getDefaultUsers(): Users[] {
    return [
      {
        id: 1,
        name: 'John Doe',
        noOfWorkouts: 2,
        workouts: [
          { type: 'Running', minutes: '30' },
          { type: 'Cycling', minutes: '45' },
        ],
      },
      {
        id: 2,
        name: 'Jane Smith',
        noOfWorkouts: 2,
        workouts: [
          { type: 'Swimming', minutes: '60' },
          { type: 'Running', minutes: '20' },
        ],
      },
      {
        id: 3,
        name: 'Mike Johnson',
        noOfWorkouts: 2,
        workouts: [
          { type: 'Yoga', minutes: '50' },
          { type: 'Cycling', minutes: '40' },
        ],
      },
    ];
  }

  private updateUserState() {
    localStorage.setItem('userData', JSON.stringify(this.users));
    this.usersSubject.next([...this.users]);
  }

  getUsers(): Users[] {
    return this.users;
  }

  addWorkout(data: { name: string; workoutType: string; minutes: string }) {
    const user = this.findOrCreateUser(data.name);

    if (user.workouts.some((workout) => workout.type === data.workoutType)) {
      this.toastr.error('Workout Type already exists', 'Error');
      return;
    }

    user.workouts.push({
      type: data.workoutType,
      minutes: data.minutes,
    });
    user.noOfWorkouts = user.workouts.length;

    this.updateUserState();

    this.totalPagesSubject.next(
      Math.ceil(this.users.length / this.itemsPerPageSubject.value)
    );

    const newTotalPages = this.totalPagesSubject.value;
    if (this.currentPageSubject.value < newTotalPages) {
      this.currentPageSubject.next(newTotalPages);
    }

    this.sliceUserData();

    this.toastr.success('Workout detail added successfully', '', {
      timeOut: 1500,
    });
  }

  private findOrCreateUser(name: string): Users {
    let user = this.users.find(
      (u) => u.name.toLowerCase() === name.toLowerCase()
    );

    if (!user) {
      user = {
        id: this.users?.length + 1,
        name,
        workouts: [],
        noOfWorkouts: 0,
      };
      this.users.push(user);
    }
    return user;
  }

  // filtering user
  searchByName(query: string) {
    const filterUser = this.users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );
    return this.usersSubject.next([...filterUser]);
  }

  filterByWorkoutType(type: string) {
    const filterUser =
      type === WorkoutsEnum.ALL
        ? this.users
        : this.users.filter((user) =>
            user.workouts.some(
              (workout) => workout?.type?.toLowerCase() === type.toLowerCase()
            )
          );

    return this.usersSubject.next([...filterUser]);
  }

  // pagination

  setItemsPerPage(val: number) {
    this.itemsPerPageSubject.next(val);
    this.totalPagesSubject.next(
      Math.ceil(this.users.length / this.itemsPerPageSubject.value)
    );
    this.sliceUserData();
  }

  sliceUserData() {
    const startIndex =
      (this.currentPageSubject.value - 1) * this.itemsPerPageSubject.value;
    const endIndex = startIndex + this.itemsPerPageSubject.value;
    const userSliced = this.users.slice(startIndex, endIndex);
    this.usersSubject.next([...userSliced]);
  }

  prevPage() {
    const currentPage =
      this.currentPageSubject.value > 1 ? this.currentPageSubject.value - 1 : 1;
    this.currentPageSubject.next(currentPage);
    this.sliceUserData();
  }
  nextPage() {
    const currentPage =
      this.currentPageSubject.value < this.totalPagesSubject.value
        ? this.currentPageSubject.value + 1
        : this.totalPagesSubject.value;
    this.currentPageSubject.next(currentPage);
    this.sliceUserData();
  }
}
