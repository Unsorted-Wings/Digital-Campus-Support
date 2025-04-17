export type Attendance = {
    id:string;
    courseId: string;
    batchId: string;
    semesterId: string;
    studentId: string;
    averagePercentage: number;
    subjects: { subjectId: string; attendancePercentage: number }[]
    createdAt: string;
    updatedAt: string;
};