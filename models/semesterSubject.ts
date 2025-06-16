export type SemesterSubjects = {
    id: string;
    semesterDetailId: string;
    subjectId: string;
    teacherId: string;
    category?: string; // major or minor 
    createdAt: string;
    updatedAt: string;
}