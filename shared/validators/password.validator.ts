import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

@ValidatorConstraint({ name: 'isValidPassword', async: false })
export class IsValidPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string): boolean {
    return passwordRegex.test(password);
  }

  defaultMessage(): string {
    return (
      'Password must meet the following criteria: ' +
      'minimum length of 8 characters, ' +
      'at least one uppercase letter, ' +
      'at least one lowercase letter, ' +
      'at least one digit, ' +
      'and at least one special characters.'
    );
  }
}

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPasswordConstraint,
    });
  };
}

@Injectable()
export class PasswordValidationPipe implements PipeTransform<any> {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!passwordRegex.test(value)) {
      throw new BadRequestException(
        'Password must meet the following criteria: ' +
          'minimum length of 8 characters, ' +
          'at least one uppercase letter, ' +
          'at least one lowercase letter, ' +
          'at least one digit, ' +
          'and at least one special character.',
      );
    }
    return value;
  }
}
