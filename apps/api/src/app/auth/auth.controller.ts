import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../../../../../libs/data/src/lib/dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    /*
    Public POST /auth/api/login

    Request: {
        email: string;
        password: string;
    }
    Response: {
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
            organizationId: string;
        }
    }}
*/
@Post('login')
@HttpCode(HttpStatus.OK)
async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);    
}

//Add user registartion POST /api/auth/register if time allows
 @Post('register')
  async register(@Body() body: any) {

    return this.authService.register(
      body.email,
      body.password,
      body.role,
      body.organizationId
    );
  }
}


