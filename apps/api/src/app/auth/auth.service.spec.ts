import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { Role } from '../../../../../libs/data/src/lib/enums/role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-123',
    email: 'owner@test.com',
    password: '$2b$10$hashedpassword',
    role: Role.OWNER,
    organizationId: 'org-123',
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('owner@test.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'owner@test.com' },
        relations: ['organization'],
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateUser('notfound@test.com', 'password123')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.validateUser('owner@test.com', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('fake-jwt-token');

      const result = await service.login({
        email: 'owner@test.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('fake-jwt-token');
      expect(result.user.id).toBe('user-123');
      expect(result.user.email).toBe('owner@test.com');
      expect(result.user.role).toBe(Role.OWNER);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-123',
        email: 'owner@test.com',
        role: Role.OWNER,
        organizationId: 'org-123',
      });
    });
  });

  describe('register', () => {
    it('should hash password before saving user', async () => {
      const hashedPassword = '$2b$10$newhash';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      
      const newUser = {
        ...mockUser,
        password: hashedPassword,
      };
      
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);

      await service.register('newuser@test.com', 'password123', Role.ADMIN, 'org-123');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepository.save).toHaveBeenCalled();
    });
  });
});