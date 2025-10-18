import { TaskStatus } from '../enums/task-status.enum';

export interface Tasks {
    id: string;
    title: string;
    description: string;
    category: string;
    status: TaskStatus;
    createdById: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
}

