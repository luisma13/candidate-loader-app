import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain';
import { ExcelParseException } from '../services';

@Catch(DomainException, ExcelParseException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException | ExcelParseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      error: exception.name,
    });
  }
}

