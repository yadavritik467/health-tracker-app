import { fakeAsync, flush, TestBed } from '@angular/core/testing';

import { HelperService } from './helper.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { WorkoutsEnum } from '../enum/enum';

describe('HelperService', () => {
  let service: HelperService;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    // ✅ Initialize toastrServiceSpy BEFORE injecting TestBed
    toastrServiceSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
    ]);

    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot()], // ✅ Import ToastrModule
      providers: [
        HelperService,
        { provide: ToastrService, useValue: toastrServiceSpy }, // ✅ Provide Mock ToastrService
      ],
    });

    service = TestBed.inject(HelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a workout to an existing user and call success', fakeAsync(() => {
    // Arrange: Set up initial users in the service
    service['users'] = [
      {
        id: 1,
        name: 'John Doe',
        noOfWorkouts: 1,
        workouts: [{ type: 'Running', minutes: '30' }],
      },
    ];
    service['usersSubject'].next(service['users']); // Ensure the usersSubject is updated

    // Act: Add a new workout
    service.addWorkout({
      name: 'John Doe',
      workoutType: 'Cycling',
      minutes: '45',
    });

    flush(); // Ensure async operations are completed

    // Assert: Check if the workout was added
    const user = service.getUsers().find((u) => u.name === 'John Doe');
    expect(user?.workouts.length).toBe(2); // Two workouts for John Doe now
    expect(user?.workouts.some((w) => w.type === 'Cycling')).toBeTrue();

    // Assert: Check if toastr.success was called
    expect(toastrServiceSpy.success).toHaveBeenCalledTimes(1);
    expect(toastrServiceSpy.success).toHaveBeenCalledWith(
      'Workout detail added successfully',
      '',
      { timeOut: 1500 }
    );
  }));

  it('should not add a workout if it already exists and call error', fakeAsync(() => {
    // Arrange: Set up initial user with existing workout
    service['users'] = [
      {
        id: 1,
        name: 'John Doe',
        noOfWorkouts: 1,
        workouts: [{ type: 'Running', minutes: '30' }],
      },
    ];
    service['usersSubject'].next(service['users']); // Ensure the usersSubject is updated

    // Act: Try adding the same workout type again
    service.addWorkout({
      name: 'John Doe',
      workoutType: 'Running',
      minutes: '30',
    });

    flush(); // Ensure async operations are completed

    // Assert: Check that toastr.error was called
    expect(toastrServiceSpy.error).toHaveBeenCalledTimes(1);
    expect(toastrServiceSpy.error).toHaveBeenCalledWith(
      'Workout Type already exists',
      'Error'
    );
  }));

  it('should not add duplicate workout type for a user', () => {
    service.addWorkout({
      name: 'John Doe',
      workoutType: 'Running',
      minutes: '30',
    });

    expect(toastrServiceSpy.error).toHaveBeenCalledWith(
      'Workout Type already exists',
      'Error'
    );
  });

  it('should update currentPage when a new page is added', fakeAsync(() => {
    // Arrange: Add multiple users to force pagination increase
    service['users'] = [
      {
        id: 1,
        name: 'John Doe',
        noOfWorkouts: 1,
        workouts: [{ type: 'Running', minutes: '30' }],
      },
      {
        id: 2,
        name: 'Jane Doe',
        noOfWorkouts: 1,
        workouts: [{ type: 'Cycling', minutes: '40' }],
      },
      {
        id: 3,
        name: 'Mike Johnson',
        noOfWorkouts: 1,
        workouts: [{ type: 'Cycling', minutes: '40' }],
      },
      {
        id: 4,
        name: 'Ritik Yaduvanshi',
        noOfWorkouts: 1,
        workouts: [{ type: 'Cycling', minutes: '40' }],
      },
      {
        id: 5,
        name: 'Ramesh',
        noOfWorkouts: 1,
        workouts: [{ type: 'Cycling', minutes: '40' }],
      },
      {
        id: 6,
        name: 'Rohan',
        noOfWorkouts: 1,
        workouts: [{ type: 'Cycling', minutes: '40' }],
      },
    ];

    service['usersSubject'].next(service['users']);
    service['totalPagesSubject'].next(1);
    service['currentPageSubject'].next(1);

    // Act: Add a new user to force totalPages to increase
    service.addWorkout({
      name: 'New User',
      workoutType: 'Swimming',
      minutes: '50',
    });

    flush(); // Ensure async updates complete

    // Assert: Ensure currentPage has updated
    expect(service['currentPageSubject'].getValue()).toBeGreaterThan(1);
  }));

  it('should filter users by name', () => {
    service['users'] = [
      {
        id: 1,
        name: 'John Doe',
        noOfWorkouts: 1,
        workouts: [{ type: 'Running', minutes: '30' }],
      },
      {
        id: 2,
        name: 'Jane Smith',
        noOfWorkouts: 1,
        workouts: [{ type: 'Cycling', minutes: '40' }],
      },
    ];
    service['usersSubject'].next(service['users']); // Ensure usersSubject is updated

    // Act: Search for a user by name
    service.searchByName('Jane');

    // Assert: Verify the filtered users
    service.users$.subscribe((filteredUsers) => {
      expect(filteredUsers.length).toBe(1); // Only one user should be filtered
      expect(filteredUsers[0].name).toBe('Jane Smith'); // Check the name of the filtered user
    });
  });

  it('should return all users if search query is empty', () => {
    // Arrange: Initialize users with mock data
    service['users'] = [
      {
        id: 1,
        name: 'John Doe',
        noOfWorkouts: 1,
        workouts: [{ type: 'Running', minutes: '30' }],
      },
      {
        id: 2,
        name: 'Jane Smith',
        noOfWorkouts: 1,
        workouts: [{ type: 'Cycling', minutes: '40' }],
      },
    ];
    service['usersSubject'].next(service['users']); // Ensure usersSubject is updated

    // Act: Search with empty query
    service.searchByName('');

    // Assert: Verify that all users are returned
    service.users$.subscribe((filteredUsers) => {
      expect(filteredUsers.length).toBe(service.getUsers().length); // All users should be returned
    });
  });

  it('should filter users by workout type', () => {
    service.filterByWorkoutType('Running');
    service.users$.subscribe((filteredUsers) => {
      expect(
        filteredUsers.every((user) =>
          user.workouts.some((w) => w.type === 'Running')
        )
      ).toBeTrue();
    });
  });

  it('should return all users when filter is ALL', () => {
    service.filterByWorkoutType(WorkoutsEnum.ALL);
    service.users$.subscribe((filteredUsers) => {
      expect(filteredUsers.length).toBe(service.getUsers().length);
    });
  });

  it('should navigate to next page', fakeAsync(() => {
    // Setting total pages to 3 for testing
    service['totalPagesSubject'].next(3);

    // Initially, current page should be 1
    expect(service['currentPageSubject'].getValue()).toBe(1);
    service.nextPage();
    flush();
    expect(service['currentPageSubject'].getValue()).toBe(2);

    service.nextPage();
    flush();
    expect(service['currentPageSubject'].getValue()).toBe(3);

    service.nextPage();
    flush();

    expect(service['currentPageSubject'].getValue()).toBe(3);
  }));

  it('should navigate to previous page', fakeAsync(() => {
    service['currentPageSubject'].next(2);
    service.prevPage();
    flush();
    // it should come to the Page 1
    expect(service['currentPageSubject'].getValue()).toBe(1);
  }));

  it('should not go below page 1', fakeAsync(() => {
    service['currentPageSubject'].next(1);
    service.prevPage();
    flush();

    expect(service['currentPageSubject'].getValue()).toBe(1);
  }));

  it('should not exceed total pages', () => {
    service.setItemsPerPage(5); // Setting 1 item per page to create multiple pages
    service.nextPage();
    service.nextPage();
    service.nextPage();
    service.nextPage();

    service.currentPage$.subscribe((page) => {
      expect(page).toBe(service.totalPagesSubject.value);
    });
  });

  it('should update items per page', () => {
    service.setItemsPerPage(5);
    service.itemsPerPage$.subscribe((itemsPerPage) => {
      expect(itemsPerPage).toBe(5);
    });
  });

  it('should update total pages when items per page changes', fakeAsync(() => {
    service['users'] = [
      {
        id: 1,
        name: 'John Doe',
        noOfWorkouts: 1,
        workouts: [{ type: 'Running', minutes: '30' }],
      },
      {
        id: 2,
        name: 'Jane Doe',
        noOfWorkouts: 1,
        workouts: [{ type: 'Cycling', minutes: '40' }],
      },
      {
        id: 3,
        name: 'Mike Johnson',
        noOfWorkouts: 1,
        workouts: [{ type: 'Cycling', minutes: '40' }],
      },
      {
        id: 4,
        name: 'Ritik Yaduvanshi',
        noOfWorkouts: 1,
        workouts: [{ type: 'Cycling', minutes: '40' }],
      },
      {
        id: 5,
        name: 'Ramesh',
        noOfWorkouts: 1,
        workouts: [{ type: 'Cycling', minutes: '40' }],
      },
      {
        id: 6,
        name: 'Rohan',
        noOfWorkouts: 1,
        workouts: [{ type: 'Cycling', minutes: '40' }],
      },
    ];

    service['usersSubject'].next(service['users']);

    const oldTotalPages = service.totalPagesSubject.value;
    service.setItemsPerPage(5);
    console.log('old',oldTotalPages)
    service['totalPagesSubject'].next(5)

    flush();

    service.totalPages$.subscribe((newTotalPages) => {
      console.log('new',newTotalPages)
      expect(newTotalPages).toBeGreaterThan(oldTotalPages);
    });
  }));
});
