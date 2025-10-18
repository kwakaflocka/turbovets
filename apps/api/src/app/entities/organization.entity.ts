import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity()
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true})
    parentId: string;

    @ManyToOne(() => Organization, { nullable: true })
    @JoinColumn({ name: 'parentId' })
    parent: Organization;
}