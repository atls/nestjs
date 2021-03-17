import { UserModel } from '../models'

class UserRepository {
  private readonly storage = new Map<number, UserModel>()

  public save = (user: UserModel) => this.storage.set(user.id, user)

  public findById = (userId: number) => this.storage.get(userId)
}

export const userRepository = new UserRepository()
