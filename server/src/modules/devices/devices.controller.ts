import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EntityNotFoundError } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HasRoles } from '../auth/has-roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DevicesService } from './devices.service';
import { CreateConsumptionDto } from './dto/create-consumption.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @HasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @HasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @HasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get(':id')
  @UseFilters(BaseExceptionFilter<EntityNotFoundError>)
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @HasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @HasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }

  @HasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Post('consumption/:deviceId')
  addConsumptionToDevice(
    @Param('deviceId') deviceId: string,
    @Body() consumption: CreateConsumptionDto,
  ) {
    return this.devicesService.addConsumptionToDevice(deviceId, consumption);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('consumption/:deviceId')
  getConsumptionsForDeviceFromInterval(
    @Param('deviceId') deviceId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    return this.devicesService.getConsumptionsForDeviceFromInterval(
      deviceId,
      startDate,
      endDate,
    );
  }

  @HasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Delete('consumption/:id')
  removeConsumptionFromDevice(@Param('id') id: string) {
    return this.devicesService.removeConsumptionFromDevice(id);
  }
}
