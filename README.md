## Ruscord client on Linux
[![72-20250608152750.png](https://i.postimg.cc/sDFWM0H2/72-20250608152750.png)](https://postimg.cc/WtnzKSvR)
dvytvs с XZY123lol сделали клиент для пользователей Linux


Сам проект выложен в открытый код и если хотите его модифицировать пожалуйста только соблюдайте лицензию!

---

## 📦 Что в репозитории

- `package.json` — конфигурация проекта, зависимости, скрипты.
- `dist/` — готовые сборки (`.deb`, `.AppImage`, `.zip` и т.д.).
- `assets/` — иконки, изображения и ресурсы.

---

## 🛠 Требования

Перед началом убедитесь, что у вас установлено:

- **Node.js** (v16 или выше): https://nodejs.org/
- **npm** (входит в состав Node.js)
- **Git** (если вы клонируете репозиторий)
- **electron + updater** (версия в package.json нужен для сборки без них никуда)
---
## Установка

```bash
git clone https://github.com/ТВОЙ_ПОЛЬЗОВАТЕЛЬ/ruscord
cd ruscord
npm install
