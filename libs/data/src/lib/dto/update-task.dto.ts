import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

export class UpdateTaskDto {

    @IsString()
    @IsOptional()
    @MaxLength(50)
    title?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    description?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    category?: string;
    
    @IsEnum(['To Do', 'In Progress', 'Done'])
    @IsOptional()
    status?: string;
}