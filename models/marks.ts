export interface Marks {
  id:string;
  studentId: string; 
  examId: string;
  subjects: { subjectId: string; marks: number }[];
  createdAt: string;
  updatedAt: string;
}
