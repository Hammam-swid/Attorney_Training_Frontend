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
  host: string;
  executor: string;
  type: ActivityType;
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
