---
name: Feature
about: Изменение ломающее обратную совместимость
title: '[feature]'
labels: feature
assignees: TorinAsakura
---

### С чем связан запрос на фичу?
**_Например:_**
В случае с @Injectable мы должны иметь возможность, также, пробрасывать события с eventbus через provider

### Расскажите как вы это себе видите
**_Например:_**
```javascript
@Injectable({
    provider: 'IntlProvider'
})

export class IntlService {
    getIntl(object){
        return object.string
    }
}
```

### Приложите примеры реализаций
Просто оставьте ссылку на репу, статью, gist, любой другой источник откуда почерпнули идею
