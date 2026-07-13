export interface CreateEventRequest {
  title: string;
  description: string;
  capacity: number;
  date: string;
  price?: number;
  departmentScope?: 'ONLY_DEPT' | 'ALL_DEPTS';
  bannerImageUrl?: string;
  posterImageUrl?: string;
  eventPhotosUrls?: string[];
  isDraft?: boolean;
}

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  capacity: number;
  active: boolean;
  date: string;
  creatorId: string;
  registrationsCount: number;
  price: number;
  departmentScope: 'ONLY_DEPT' | 'ALL_DEPTS';
  department: string;
  status: 'DRAFT' | 'PUBLISHED';
  bannerImageUrl?: string;
  posterImageUrl?: string;
  eventPhotosUrls?: string[];
}

export interface RegisterEventResponse {
  registrationId: string;
  status: 'CONFIRMED' | 'WAITING_LIST';
}

export interface RegistrationResponse {
  id: string;
  eventId: string;
  studentId: string;
  status: 'CONFIRMED' | 'WAITING_LIST';
  createdAt: string;
  eventTitle: string;
}

export interface RegistrationDetailResponse {
  id: string;
  eventId: string;
  studentId: string;
  status: 'CONFIRMED' | 'WAITING_LIST';
  createdAt: string;
  studentName: string;
  studentEmail: string;
  studentRegNum: string;
  studentDept: string;
}
