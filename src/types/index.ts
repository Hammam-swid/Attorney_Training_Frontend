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

  activityTrainees: ActivityTrainee[];
}

export interface Instructor {
  id: number;
  name: string;
  email?: string;
  phone: string;

  rating?: number;
  avgRating?: number;
  activityCount?: number;
  hours?: number;
  organization?: Organization;
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
  type: "موظف" | "ضابط" | "عضو هيئة النيابة" | "أخرى";
  payGrade:
    | "محامي عام من الفئة أ"
    | "محامي عام من الفئة ب"
    | "رئيس نيابة"
    | "نائب نيابة من الدرجة الأولى"
    | "نائب نيابة من الدرجة الثانية"
    | "وكيل نيابة من الدرجة الأولى"
    | "وكيل نيابة من الدرجة الثانية"
    | "وكيل نيابة من الدرجة الثالثة"
    | "مساعد نيابة"
    | "معاون نيابة"
    | "أخرى";
  rating: number;
  activityCount: number;
}

export interface ActivityTrainee {
  id: number;
  trainee: Trainee;
  activity: Activity;
  rating: number;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "admin" | "instructor" | "trainee" | "moderator";
}
