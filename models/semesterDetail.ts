import { SemesterSubjects } from "./semesterSubject";

export type SemesterDetail = {
    id : string;
    courseId: string
    batchId : string;
    subjects: Array<SemesterSubjects>;
    startDate: string;
    endDate : string;
    mentor: string;
    createdAt: string;
    updatedAt: string;
}