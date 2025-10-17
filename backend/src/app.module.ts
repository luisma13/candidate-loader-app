import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CandidateEntity } from './candidate/infrastructure/persistence';
import { CandidateModule } from './candidate/candidate.module';
import { DomainExceptionFilter } from './candidate/infrastructure/http';
import { AllExceptionsFilter } from './shared/http';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'candidates.db',
      entities: [CandidateEntity],
      synchronize: true,
      logging: false,
    }),
    CandidateModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
