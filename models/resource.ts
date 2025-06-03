export type Resource = {
    id: string;
    name: string;
    type: string;
    description: string;
    courseId: string;
    batchId: string;
    subjectId?: string;
    semesterId: string;
    createdBy: string;
    fileUrl: string;
    createdAt: string;
    updatedAt: string;
}