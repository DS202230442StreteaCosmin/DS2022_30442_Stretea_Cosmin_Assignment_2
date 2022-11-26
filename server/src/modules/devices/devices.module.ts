import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { Consumption } from './entities/consumption.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Consumption])],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
