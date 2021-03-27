import { Controller, Post, Body, HttpCode, HttpStatus, Inject, Get, Param, NotFoundException, ParseIntPipe } from '@nestjs/common'
import { BUS_SYMBOLS, Bus } from '@node-ts/bus-core'
import { CreateUserCommand } from '../messages'
import { userRepository } from '../repository'

@Controller('user')
export class UserController {
  public constructor(
    @Inject(BUS_SYMBOLS.Bus)
    private readonly bus: Bus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  public async createUser(@Body() user: any) {
    await this.bus.send(new CreateUserCommand(user.id, user.username))
    return user
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  public async findUser(@Param('userId', new ParseIntPipe()) userId: number) {
    const user = userRepository.findById(userId)

    if (!user) {
      throw new NotFoundException()
    }

    return user
  }
}
