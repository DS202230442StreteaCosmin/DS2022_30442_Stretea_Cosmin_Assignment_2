import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Between, Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateConsumptionDto } from './dto/create-consumption.dto';
import { Consumption } from './entities/consumption.entity';
import { DeviceTimeInterval } from './dto/device-interval.dto';

@Injectable()
export class DevicesService {
  @InjectRepository(Device)
  private devicesRepository: Repository<Device>;
  @InjectRepository(Consumption)
  private consumptionsRepository: Repository<Consumption>;

  async create(createDeviceDto: CreateDeviceDto) {
    const createdDevice = this.devicesRepository.create({
      ...createDeviceDto,
      users: [],
    });
    await this.devicesRepository.save(createdDevice);
    return createdDevice;
  }

  async findAll() {
    return await this.devicesRepository.find();
  }

  async findOne(id: string) {
    return await this.devicesRepository.findOneOrFail({
      where: { id: id },
    });
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto) {
    await this.devicesRepository.update({ id: id }, updateDeviceDto);
    return this.devicesRepository.findOneOrFail({
      where: { id: id },
    });
  }

  async remove(id: string) {
    const removedDevice = await this.devicesRepository.findOneOrFail({
      where: { id: id },
    });
    await this.devicesRepository.remove(removedDevice);
    return removedDevice;
  }

  async addConsumptionToDevice(
    deviceId: string,
    consumption: CreateConsumptionDto,
  ) {
    const consumptionEntity = this.consumptionsRepository.create(consumption);

    await this.consumptionsRepository.save(consumptionEntity);
    const deviceEntity = await this.devicesRepository.findOneOrFail({
      where: { id: deviceId },
      relations: { consumptions: true },
    });

    if (!deviceEntity.consumptions) {
      deviceEntity.consumptions = [];
    }

    deviceEntity.consumptions.push(consumptionEntity);
    await this.devicesRepository.save(deviceEntity);
    return consumptionEntity;
  }

  async getConsumptionsForDeviceFromInterval(
    deviceId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return await this.consumptionsRepository.find({
      where: {
        device: { id: deviceId },
        timestamp: Between(startDate, endDate),
      },
    });
  }

  async removeConsumptionFromDevice(consumptionId: string) {
    const consumption = await this.consumptionsRepository.findOneOrFail({
      where: { id: consumptionId },
    });
    await this.consumptionsRepository.remove(consumption);
    return consumption;
  }
}
