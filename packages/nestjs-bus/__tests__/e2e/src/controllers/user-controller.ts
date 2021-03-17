import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { CreateUserCommand } from '../messages'
import { Bus } from '../../../../src'

@Controller('user')
export class UserController {
  public constructor(
    private readonly bus: Bus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  public async createUser(@Body() user: any) {
    await this.bus.send(new CreateUserCommand(user.id, user.username))
  }
}
