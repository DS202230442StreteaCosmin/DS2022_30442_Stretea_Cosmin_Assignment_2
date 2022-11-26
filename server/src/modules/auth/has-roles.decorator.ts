import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

export const HasRoles = (...roles: UserRole[]) => SetMetadata('roles', roles);
