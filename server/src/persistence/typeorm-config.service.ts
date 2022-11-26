import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST'),
      port: +this.configService.get<number>('DB_PORT'),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: !!this.configService.get('DB_SYNCHRONIZE'),
      logging: !!this.configService.get('DB_LOGGING'),
      autoLoadEntities: !!this.configService.get('DB_AUTOLOADENTITIES'),
    };
  }
}
