# Установка
```bash
yarn add @atls/nestjs-dataloader
```

# Использование
1. Импортируйте DataLoaderModule в ваш модуль:
```typescript
import { DataLoaderModule } from '@atls/nestjs-dataloader';

@Module({
  imports: [DataLoaderModule],
})
export class AppModule {}
```
2. Создайте свой кастомный DataLoader:
```typescript
import * as DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyDataLoader extends DataLoader<string, string> {
  constructor() {
    super(async (keys: string[]) => {
      // Ваш код для загрузки данных пачками
    });
  }
}
```
3. Зарегистрируйте ваш DataLoader в провайдерах:
```typescript
import { MyDataLoader } from './my-dataloader';

@Module({
  providers: [MyDataLoader],
})
export class AppModule {}
```
4. Инжектируйте DataLoader в резолверы и сервисы:
```typescript
import { MyDataLoader } from './my-dataloader';

@Injectable()
export class MyService {
  constructor(private readonly dataLoader: MyDataLoader) {}

  async getData(key: string) {
    return this.dataLoader.load(key);
  }
}
```
