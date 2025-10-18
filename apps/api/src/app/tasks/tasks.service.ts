import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '../entities/task.entity';
import { Organization } from '../entities/organization.entity';
import { CreateTaskDto } from '../../../../../libs/data/src/lib/dto/create-task.dto';
import { UpdateTaskDto } from '../../../../../libs/data/src/lib/dto/update-task.dto';
import { Role } from '../../../../../libs/data/src/lib/enums/role.enum';
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  //Get all tasks accessible to the user based on their role and organization
  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException();
    }
    return task;
  }
  async findAll(user: any): Promise<Task[]> {
        console.log('findAll called with user:', user); 
    // Build list of accessible organization IDs
    const accessibleOrgIds = await this.getAccessibleOrgIds(user);
console.log('Accessible org IDs:', accessibleOrgIds); 
    // Return tasks from accessible organizations
    return this.taskRepository.find({
      where: {
        organizationId: In(accessibleOrgIds),
      },
      relations: ['createdBy'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Get a single task by ID (with permission check)

  async findOne(id: string, user: any): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if user can access this task
    const canAccess = await this.canUserAccessTask(user, task);
    if (!canAccess) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  // Create a new task
  async create(createTaskDto: CreateTaskDto, user: any): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdById: user.id,
      organizationId: user.organizationId,
    });

    return await this.taskRepository.save(task);
  }

  // Update a task
  async update(id: string, updateTaskDto: UpdateTaskDto, user: any): Promise<Task> {
    const task = await this.findOne(id, user);

    // Check if user can modify this task
    const canModify = await this.canUserModifyTask(user, task);
    if (!canModify) {
      throw new ForbiddenException('You do not have permission to modify this task');
    }

    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  //Delete a task
  async remove(id: string, user: any): Promise<void> {
    const task = await this.findOne(id, user);

    const canModify = await this.canUserModifyTask(user, task);
    if (!canModify) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    await this.taskRepository.remove(task);
  }

  // Get list of organization IDs the user can access

  private async getAccessibleOrgIds(user: any): Promise<string[]> {
    const orgIds = [user.organizationId];

    // If OWNER, add all child organizations
    if (user.role === Role.OWNER) {
      const childOrgs = await this.organizationRepository.find({
        where: { parentId: user.organizationId },
      });
      orgIds.push(...childOrgs.map(org => org.id));
    }

    return orgIds;
  }

  // Check if user can access a task (read permission)
  private async canUserAccessTask(user: any, task: Task): Promise<boolean> {
    const accessibleOrgIds = await this.getAccessibleOrgIds(user);
    return accessibleOrgIds.includes(task.organizationId);
  }

  // Check if user can modify a task (write permission)

  private async canUserModifyTask(user: any, task: Task): Promise<boolean> {
    // OWNER can modify any task in their org hierarchy
    if (user.role === Role.OWNER) {
      const accessibleOrgIds = await this.getAccessibleOrgIds(user);
      return accessibleOrgIds.includes(task.organizationId);
    }

    // ADMIN can modify tasks in their own organization
    if (user.role === Role.ADMIN) {
      return task.organizationId === user.organizationId;
    }

    // VIEWER cannot modify any tasks
    return false;
  }
}