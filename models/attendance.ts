export type Attendance = {
  id: string;
  courseId: string;
  batchId: string;
  semesterId: string;
  studentId: string;
  subjects: {
    subjectName: string;
    attendedLecures: number;
    totalLectures: number;
  }[];
  createdAt: string;
  updatedAt: string;
};
