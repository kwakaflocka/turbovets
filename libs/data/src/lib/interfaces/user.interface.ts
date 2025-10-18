import { Role } from '../enums/role.enum';

export interface User {
    id: string;
    name: string;
    password: string;
    role: Role;
    organizationId: string;
}

