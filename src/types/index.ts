export interface Activity {
  id: number;
  title: string;
  status: string;
  startDate: Date;
  endDate: Date;
  location: string;
  instructors: Instructor[];
  hours: number;
  studentsCount: number;
  rating: number;

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

  rating: number;
  avgRating: number;
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
  rating: number;
  activityCount: number;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "admin" | "instructor" | "trainee" | "moderator";
}
