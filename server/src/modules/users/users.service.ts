import { Injectable } from '@nestjs/common';
import { CreateUserByAdminDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Device } from '../devices/entities/device.entity';

export const SALT_OR_ROUNDS = 10;
export const DEFAULT_USER_PASSWORD = 'client';

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private usersRepository: Repository<User>;
  @InjectRepository(Device)
  private devicesRepository: Repository<Device>;

  async createClientByAdmin(createUserByAdminDto: CreateUserByAdminDto) {
    const resultedUser = await this.createUser({
      ...createUserByAdminDto,
      password: DEFAULT_USER_PASSWORD,
    });

    return resultedUser;
  }

  async createUser(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      SALT_OR_ROUNDS,
    );
    const createdUser = this.usersRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });

    await this.usersRepository.save(createdUser);
    return createdUser;
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findById(id: string) {
    return await this.usersRepository.findOneOrFail({
      where: { id: id },
    });
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOneOrFail({
      where: { email: email },
    });
  }

  async getDevicesForUser(id: string) {
    const currentUser = await this.usersRepository.findOneOrFail({
      where: { id: id },
      relations: { devices: true },
    });

    return currentUser.devices;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update({ id: id }, updateUserDto);
    return this.usersRepository.findOneOrFail({
      where: { id: id },
    });
  }

  async remove(id: string) {
    const removedUser = await this.usersRepository.findOneOrFail({
      where: { id: id },
    });
    await this.usersRepository.remove(removedUser);
    return removedUser;
  }

  async addDeviceToUser(userId: string, deviceId: string) {
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
      relations: { devices: true },
    });

    const device = await this.devicesRepository.findOneOrFail({
      where: { id: deviceId },
    });

    if (!user.devices) {
      user.devices = [];
    }

    user.devices.push(device);
    this.usersRepository.save(user);

    return user;
  }

  async removeDeviceFromUser(userId: string, deviceId: string) {
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
      relations: { devices: true },
    });

    if (!user.devices) {
      user.devices = [];
    }

    const newDevicesArray = user.devices.filter((d) => d.id !== deviceId);

    user.devices = newDevicesArray;
    this.usersRepository.save(user);

    return user;
  }
}
