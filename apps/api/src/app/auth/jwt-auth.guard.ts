// apps/api/src/app/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // This guard uses the JWT strategy we defined
  // It automatically validates the token and calls JwtStrategy.validate()
}