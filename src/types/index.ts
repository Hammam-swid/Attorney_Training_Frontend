export interface Activity {
  id: number;
  name: string;
  status: string;
  startDate: Date;
  endDate: Date;
  location: string;
  instructors: Instructor[];
  hours: number;
  studentsCount: number;

  host: Organization;
  executor: Organization;

  hostName: string;
  executorName: string;
  type: ActivityType;

  traineesCount: number;
  instructorRating: number;
}

export interface Instructor {
  id: number;
  name: string;
  email: string;
  phone: string;
}
export interface ActivityType {
  id: number;
  name: string;
  isHaveRating: boolean;
  instructorName: string;
  traineeName: string;
  iconName: string;
}

export interface Organization {
  id: number;
  name: string;
  hostedCount?: number;
  executedCount?: number;
  instructorsCount?: number;
}

export interface Trainee {
  id: number;
  name: string;
  phone: string;
  address: string;
  employer: string;
  type: string;
  activityCount: number;
}
