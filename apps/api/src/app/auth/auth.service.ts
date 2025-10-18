import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginDto } from "../../../../../libs/data/src/lib/dto/login.dto"
import { resourceLimits } from 'worker_threads';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService
    ) {}
    //Validates user credentials and called during login
    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email: email }, relations: ['organization'] });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        //compare password to hashed password in database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
             
    }
    
    //Validates credentials and generates JWT token that is called by POST/auth/login endpoint
    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const payload = {
            sub: user.id,   
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
        }
        //Sign the payload to create JWT token
        const accessToken = this.jwtService.sign(payload);
        //Return token and user info without password
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
            }
        };
    }
    //If I have time, I will implement user registration here
    async register(email: string, password: string, role: string, organizationId: string) {{
        const hashedPassword = await bcrypt.hash(password,10);

        const user = this.userRepository.create({
            email, 
            password: hashedPassword,
            
        });
        await this.userRepository.save(user);

        //Return user info without password
        const { password: _, ...result } = user;
        return result;
    }}
}
