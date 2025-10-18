// apps/api/src/app/seed/seed.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Task } from '../entities/task.entity';
import { Role } from '../../../../../libs/data/src/lib/enums/role.enum'; 

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async seed() {
    console.log('🌱 Seeding database...');

    // Clear existing data (fixed - can't use empty object)
    await this.taskRepository.clear();        // ← Changed from delete({})
    await this.userRepository.clear();        // ← Changed from delete({})
    await this.organizationRepository.clear(); // ← Changed from delete({})

    // Seed organizations
    const turboVets = await this.createOrg('Turbo Vets', null);
    const engineering = await this.createOrg('Engineering', turboVets.id);
    const sales = await this.createOrg('Sales', turboVets.id);

    // Seed users
    const owner = await this.createUser(
      'owner@turbovets.com',
      'password123',
      Role.OWNER,
      turboVets.id
    );

    const admin = await this.createUser(
      'admin@turbovets.com',
      'password123',
      Role.ADMIN,
      engineering.id
    );

    const viewer = await this.createUser(
      'viewer@turbovets.com',
      'password123',
      Role.VIEWER,
      sales.id
    );

    // Seed tasks
    await this.createTask(
      'Implement RBAC system',
      'Build role-based access control for tasks',
      'Work',
      'To Do',
      owner.id,
      turboVets.id
    );

    await this.createTask(
      'Write unit tests',
      'Add test coverage for auth and tasks',
      'Work',
      'In Progress',
      admin.id,
      engineering.id
    );

    await this.createTask(
      'Review documentation',
      'Check README and API docs',
      'Work',
      'To Do',
      viewer.id,
      sales.id
    );

    await this.createTask(
      'Buy groceries',
      'Get milk, eggs, and bread from the store',
      'Personal',
      'To Do',
      owner.id,
      turboVets.id
    );

    await this.createTask(
      'Deploy to production',
      'Deploy the task manager app to production environment',
      'Work',
      'Done',
      admin.id,
      engineering.id
    );

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Owner:  owner@turbovets.com / password123');
    console.log('Admin:  admin@turbovets.com / password123');
    console.log('Viewer: viewer@turbovets.com / password123');
  }

  async createOrg(name: string, parentId: string | null): Promise<Organization> {
    const org = this.organizationRepository.create({
      name,
      parentId,
    });
    return await this.organizationRepository.save(org);
  }

  async createUser(
    email: string,
    password: string,
    role: Role,
    organizationId: string
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role,
      organizationId,
    });

    return await this.userRepository.save(user);
  }

  async createTask(
    title: string,
    description: string,
    category: string,
    status: string,
    createdById: string,
    organizationId: string
  ): Promise<Task> {
    const task = this.taskRepository.create({
      title,
      description,
      category,
      status,
      createdById,
      organizationId,
    });

    return await this.taskRepository.save(task);
  }
}