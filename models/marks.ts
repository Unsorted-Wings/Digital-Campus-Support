export interface Marks {
  studentId: string; 
  subjects: { subjectId: string; marks: number }[];
  createdAt: string;
  updatedAt: string;
}
