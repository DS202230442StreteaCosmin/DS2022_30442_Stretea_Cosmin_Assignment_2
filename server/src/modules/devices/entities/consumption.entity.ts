import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Device } from './device.entity';

@Entity()
export class Consumption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column()
  value: number;

  @ManyToOne(() => Device, (device) => device.consumptions)
  device: Device;
}
