import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { Response } from 'express';
import { CustomResponseDto } from '../../../shared/utils/custom-response.dto';
import { CreateUserDto } from '../../../shared/dtos/user.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../../../shared/decorator/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @Get('/ping')
  async pingServer(@Res() res: Response) {
    const customResponse = new CustomResponseDto();
    try {
      customResponse.message = 'Server is up';
      customResponse.statusCode = 200;
      customResponse.success = true;
      return res.status(200).json(customResponse);
    } catch (error) {
      this.logger.error(`Server is not stable`, error.message);
      customResponse.success = false;
      customResponse.message = error.message;
      customResponse.statusCode = 417;
      return res.status(417).json(customResponse);
    }
  }

  @Get('/email-availability')
  async checkEmailAvailability(
    @Res() res: Response,
    @Query('email') email: string,
  ) {
    const customResponse = new CustomResponseDto();
    try {
      customResponse.message = 'Email available';
      customResponse.statusCode = 200;
      customResponse.success = true;
      customResponse.data =
        await this.authService.checkEmailAvailability(email);
      return res.status(200).json(customResponse);
    } catch (error) {
      this.logger.error(`Email unavailable`, error.message);
      customResponse.success = false;
      customResponse.message = error.message;
      customResponse.statusCode = 417;
      return res.status(417).json(customResponse);
    }
  }

  @Post('/signup')
  async CreateUser(@Res() res: Response, @Body() createUser: CreateUserDto) {
    const customResponse = new CustomResponseDto();
    try {
      customResponse.message = 'user created';
      customResponse.statusCode = 201;
      customResponse.success = true;
      customResponse.data = await this.authService.createUser(createUser);
      return res.status(201).json(customResponse);
    } catch (error) {
      this.logger.error(`Error occured while creating user`, error.message);
      customResponse.success = false;
      customResponse.message = error.message;
      customResponse.statusCode = 417;
      return res.status(417).json(customResponse);
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Res() res: Response, @Body() payload, @Request() req) {
    const customResponse = new CustomResponseDto();
    try {
      customResponse.message = 'user signed in successful';
      customResponse.statusCode = 200;
      customResponse.success = true;
      customResponse.data = await this.authService.login(req.user);
      this.logger.log(`signing in user`);
      return res.status(200).json(customResponse);
    } catch (error) {
      this.logger.error(`Error occured while login user`, error.message);
      customResponse.success = false;
      customResponse.message = error.message;
      customResponse.statusCode = 417;
      return res.status(417).json(customResponse);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user')
  async getUserAccountProfile(@Res() res: Response, @GetUser() user) {
    const customResponse = new CustomResponseDto();
    try {
      customResponse.message = 'Profile fetched success';
      customResponse.statusCode = 200;
      customResponse.success = true;
      customResponse.data = await this.authService.fetchUserDetails(user);
      return res.status(200).json(customResponse);
    } catch (error) {
      this.logger.error(`Unable to fetch user profile`, error.message);
      customResponse.success = false;
      customResponse.message = error.message;
      customResponse.statusCode = 417;
      return res.status(417).json(customResponse);
    }
  }
}
