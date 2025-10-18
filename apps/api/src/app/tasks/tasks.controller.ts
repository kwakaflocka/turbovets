import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';
import { CreateTaskDto } from '../../../../../libs/data/src/lib/dto/create-task.dto';
import { UpdateTaskDto } from '../../../../../libs/data/src/lib/dto/update-task.dto';
import { Role } from '../../../../../libs/data/src/lib/enums/role.enum';
import { Roles } from '../../../../../libs/auth/src/lib/decorators/roles.decorator';
import { RolesGuard } from '../../../../../libs/auth/src/lib/guards/roles.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)  // All routes require authentication
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}
  @Get('test')
  test() {
    return { message: 'Tasks module is loaded!' };
  }
  /**
   * GET /api/tasks
   * Get all tasks accessible to the current user
   */
  @Get()
  async findAll(@User() user: any) {
      console.log('User from decorator:', user);
        
  if (!user) {
    return { error: 'User is undefined' };
  }
  
   try {
    return await this.tasksService.findAll(user);
  } catch (error) {
    console.error('Error in findAll:', error);  // ← Debug
    throw error;
  }
  }

  /**
   * GET /api/tasks/:id
   * Get a specific task by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @User() user: any) {
    return this.tasksService.findOne(id, user);
  }

  /**
   * POST /api/tasks
   * Create a new task (OWNER and ADMIN only)
   */
  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(@Body() createTaskDto: CreateTaskDto, @User() user: any) {
    return this.tasksService.create(createTaskDto, user);
  }

  /**
   * PUT /api/tasks/:id
   * Update a task (OWNER and ADMIN only)
   */
  @Put(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @User() user: any,
  ) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  /**
   * DELETE /api/tasks/:id
   * Delete a task (OWNER and ADMIN only)
   */
  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(@Param('id') id: string, @User() user: any) {
    return this.tasksService.remove(id, user);
  }
}