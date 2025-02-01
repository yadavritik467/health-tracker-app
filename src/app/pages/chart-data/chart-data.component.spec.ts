import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartDataComponent } from './chart-data.component';
import { HelperService } from 'src/app/service/helper.service';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { Users } from 'src/app/interface/interface';

// Mock HelperService and ToastrService
describe('ChartDataComponent', () => {
  let component: ChartDataComponent;
  let fixture: ComponentFixture<ChartDataComponent>;
  let helperServiceSpy: jasmine.SpyObj<HelperService>;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    // Create a spy for HelperService
    helperServiceSpy = jasmine.createSpyObj('HelperService', ['getUsers']);
    toastrServiceSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
    ]);

    helperServiceSpy.getUsers.and.returnValue([
      {
        id: 1,
        name: 'John Doe',
        noOfWorkouts: 2,
        workouts: [
          { type: 'Running', minutes: '30' },
          { type: 'Cycling', minutes: '45' },
        ],
      },
    ]);

    TestBed.configureTestingModule({
      declarations: [ChartDataComponent],
      providers: [
        { provide: HelperService, useValue: helperServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(ChartDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize chart data correctly', () => {
    // Mock user data
    const mockUsers: Users[] = [
      {
        id: 1,
        name: 'John Doe',
        noOfWorkouts: 2,
        workouts: [
          { type: 'Running', minutes: '30' },
          { type: 'Cycling', minutes: '45' },
        ],
      },
    ];

    helperServiceSpy.getUsers.and.returnValue(mockUsers);
    component.ngOnInit();

    expect(component.userWorkouts.length).toBe(1);
    expect(component.labels.length).toBe(2);
    expect(component.datasets.length).toBe(1);
    expect(component.datasets[0].data.length).toBe(2);
  });

  it('should update chart when user index changes', () => {
    // Mock user data
    const mockUsers = [
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
          { type: 'Yoga', minutes: '50' },
          { type: 'Swimming', minutes: '60' },
        ],
      },
    ];

    helperServiceSpy.getUsers.and.returnValue(mockUsers);
    component.ngOnInit();
    component.updateUserChart(1);

    expect(component.userIndex).toBe(1);
    expect(component.labels).toEqual(['Yoga', 'Swimming']);
    expect(component.datasets[0].data).toEqual([50, 60]);
  });

  it('should create chart after user index is updated', () => {
    // Mock user data
    const mockUsers = [
      {
        id: 1,
        name: 'John Doe',
        noOfWorkouts: 2,
        workouts: [
          { type: 'Running', minutes: '30' },
          { type: 'Cycling', minutes: '45' },
        ],
      },
    ];

    helperServiceSpy.getUsers.and.returnValue(mockUsers);
    component.ngOnInit();

    // Create chart
    spyOn(component, 'createChart');
    component.updateUserChart(0); // Selecting the same user (no change in data)

    expect(component.createChart).toHaveBeenCalled();
  });

  it('should clean up chart when component is destroyed', () => {
    const chartMock = jasmine.createSpyObj('Chart', ['destroy']);
    component.chart = chartMock;
    component.ngOnDestroy();
    expect(chartMock.destroy).toHaveBeenCalled();
  });
});
