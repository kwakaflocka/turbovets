import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { SeedModule } from './seed/seed.module';
import { Task } from './entities/task.entity';
import { Organization } from './entities/organization.entity';
import { User } from './entities/user.entity';
import { RolesGuard } from '../../../..//libs/auth/src/lib/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_DATABASE || './data/taskmanager.db',
      entities: [User, Task, Organization],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    TasksModule,
    SeedModule,
  ],

})
export class AppModule {}