export type Assignment = {
    id: string;
    title: string;
    description: string;
    courseId: string;
    batchId:string;
    semesterId: string;
    subjectId: string;
    teacherId: string;
    dueDate: string;
    assignmentDocUrl: string;
    submittedBy: Array<string>;
    createdAt: string;
    updatedAt: string;
}