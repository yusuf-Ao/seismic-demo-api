import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../../shared/dtos/user.dto';
import { User } from '../../../shared/entity/user.entity';
import { generatePassword } from '../../../shared/utils/generators';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: any, password: string) {
    this.logger.log(`Validating user ${email}`);

    const user = await this.getUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async getUserByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async getUserByID(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  async checkEmailAvailability(email: string) {
    this.logger.log(`Checking email availability for ${email}`);
    const user = await this.getUserByEmail(email);

    if (user) {
      const msg = 'user already exist with email';
      this.logger.error(msg);
      throw new Error(msg);
    }

    return true;
  }

  async login(user: User) {
    console.log({ user });
    const payload = {
      subject: user.id,
      role: user.role,
    };
    return {
      bearerAccessToken: this.jwtService.sign(payload),
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Registering new user for: ${createUserDto?.email}`);

    // Perform initial validations
    await this.checkEmailAvailability(createUserDto.email);

    try {
      const password = await generatePassword(createUserDto.password);
      this.logger.log(`Creating user record for ${createUserDto?.email}`);
      const user = new User();
      user.email = createUserDto.email;
      user.password = password;
      user.role = createUserDto.role;

      // After successful commit, remove sensitive data and return the result
      const savedUser = await this.userRepo.save(user);
      delete user.password;
      return savedUser;
    } catch (error) {
      const msg = `Error occurred while creating user: ${error.message}`;
      this.logger.error(msg, error.stack);
      throw new Error(msg);
    }
  }

  async fetchUserDetails(userPayload: any): Promise<User> {
    const loggedInUser = await this.getUserByID(userPayload.subject);
    if (!loggedInUser) {
      const msg = 'User not found!';
      this.logger.error(msg);
      throw new Error(msg);
    }

    delete loggedInUser.password;

    return loggedInUser;
  }
}
