import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty() 
    title: string = '';

    @IsString()
    description: string = '';

    @IsString()
    category: string ='';

    @IsEnum(['To Do', 'In Progress', 'Done'])
    status: string = '';


}