import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { WorkoutsEnum } from 'src/app/enum/enum';
import { HelperService } from 'src/app/service/helper.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let helperServiceSpy: jasmine.SpyObj<HelperService>;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    toastrServiceSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
    ]);
    helperServiceSpy = jasmine.createSpyObj('HelperService', [
      'addWorkout',
      'searchByName',
      'filterByWorkoutType',
      'setItemsPerPage',
      'prevPage',
      'nextPage',
    ]);

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [ReactiveFormsModule, FormsModule], // Required for form testing
      providers: [
        { provide: HelperService, useValue: helperServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test Form Initialization
  it('should initialize the workout form with default values', () => {
    expect(component.workoutForm).toBeDefined();
    expect(component.workoutForm.get('name')?.value).toBe('');
    expect(component.workoutForm.get('workoutType')?.value).toBe('');
    expect(component.workoutForm.get('minutes')?.value).toBe('');
  });

  // Test Form Validation
  it('should validate form fields correctly', () => {
    const form = component.workoutForm;
    form.get('name')?.setValue('');
    form.get('workoutType')?.setValue('');
    form.get('minutes')?.setValue('');

    expect(form.valid).toBeFalse(); // Form should be invalid

    form.get('name')?.setValue('John Doe');
    form.get('workoutType')?.setValue(WorkoutsEnum.RUNNING);
    form.get('minutes')?.setValue('30');

    expect(form.valid).toBeTrue(); // Now form should be valid
  });

  // Test `addWorkout()` Method
  it('should call addWorkout on helperService when form is valid', () => {
    spyOn(component, 'addWorkout').and.callThrough();

    component.workoutForm.setValue({
      name: 'John Doe',
      workoutType: 'Running',
      minutes: '30',
    });

    component.addWorkout();

    expect(helperServiceSpy.addWorkout).toHaveBeenCalledWith({
      name: 'John Doe',
      workoutType: 'Running',
      minutes: '30',
    });

    expect(component.workoutForm.value).toEqual({
      name: null,
      workoutType: null,
      minutes: null,
    });
  });

  // Test `applyFilter()` Method
  it('should call searchByName on helperService when filter is applied', () => {
    const event = { target: { value: 'Jane' } } as unknown as Event;

    component.applyFilter(event);

    expect(helperServiceSpy.searchByName).toHaveBeenCalledWith('Jane');
  });

  // Test `onSelectionChange()` Method
  it('should call filterByWorkoutType on helperService when workout type is selected', () => {
    const event = {
      target: { value: WorkoutsEnum.RUNNING },
    } as unknown as Event;

    component.onSelectionChange(event);

    expect(helperServiceSpy.filterByWorkoutType).toHaveBeenCalledWith(
      WorkoutsEnum.RUNNING
    );
  });

  // Test `updatePagination()` Method
  it('should call setItemsPerPage on helperService when pagination is updated', () => {
    const event = { target: { value: '5' } } as unknown as Event;

    component.updatePagination(event);

    expect(helperServiceSpy.setItemsPerPage).toHaveBeenCalledWith(5);
  });

  // Test `prevPage()` & `nextPage()` Methods
  it('should call prevPage on helperService when previous button is clicked', () => {
    component.prevPage();
    expect(helperServiceSpy.prevPage).toHaveBeenCalled();
  });

  it('should call nextPage on helperService when next button is clicked', () => {
    component.nextPage();
    expect(helperServiceSpy.nextPage).toHaveBeenCalled();
  });

  // Test `getTotalMinutes()` Calculation
  it('should correctly calculate total minutes', () => {
    const workouts = [
      { type: 'Running', minutes: '30' },
      { type: 'Cycling', minutes: '40' },
    ];
    expect(component.getTotalMinutes(workouts)).toBe(70);
  });
});
