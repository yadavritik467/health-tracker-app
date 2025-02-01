export interface Users {
  id: number;
  name: string;
  noOfWorkouts: number;
  workouts: Workouts[];
}
export interface Workouts {
  type: string;
  minutes: string;
}

export interface DataSets {
  label: string;
  data: number[];
  backgroundColor: string[];
  barPercentage: number;
}
