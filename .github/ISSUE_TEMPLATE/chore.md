---
name: Chore
about: Не фича и не баг
title: '[chore]'
labels: chore
assignees: TorinAsakura
---

### Какого рода задача?
Поменять значения или изменить логику

### Что и где будем менять?
**_Например:_**
Нужно изменить условие функции
```javascript
if(servicePayment === 1) {
    return
}
```
на
```javascript
if(!servicePayment && !servicePaymentValue){
    window.location.href = homePageUrl || userProfilePageUrl
    return null
}
```

### Укажите референс
В связи с чем было принято решение? Ссылка на другую задачу, ПР, в общем – нужен контекст
