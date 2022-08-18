/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AbilityFactory } from '../ability/ability.factory';
import { User } from './entities/user.entity';
import { Action } from '../ability/actions.enum';
import { ForbiddenError } from '@casl/ability';
import {
  checkAbilities,
  DeleteUserAbility,
  ReadUserAbility,
} from '../ability/abilities.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private abilityFactory: AbilityFactory,
  ) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    const user = {
      id: 1,
      isAdmin: true,
      orgId: 2,
    };
    const ability = this.abilityFactory.defineAbility(user);
    try {
      ForbiddenError.from(ability).throwUnlessCan(Action.create, User);
      return this.userService.create(createUserDto);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }

  @checkAbilities(new ReadUserAbility())
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @checkAbilities(new ReadUserAbility())
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = {
      id: 1,
      isAdmin: true,
      orgId: 1,
    };
    const ability = this.abilityFactory.defineAbility(user);
    try {
      const userToUpdate = this.userService.findOne(+id);
      ForbiddenError.from(ability).throwUnlessCan(Action.update, userToUpdate);
      return this.userService.create(updateUserDto);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }

  @checkAbilities(new DeleteUserAbility())
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
