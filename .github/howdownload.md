# Как установить Ruscord
## Перед началом прочтите
> [!WARNING]
> Мы зафиксировали что у вас не запуститься Ruscord из-за проблем с GTK,
> так как она пытается одновременно запустить разные версии ```GTK2/3 и GTK4```.
> На слуйчай рекомендуется следовать к Подсказке.

> [!CAUTION]
> Возможно у вас не откроется Ruscord, поэтому посмотрите в логи для этого откройте терминал и введите ```/opt/Ruscord/ruscord``` или ```ruscord```.
> Если ошибок нету то возможно Ruscord долго открывается просто подождите,
> но если есть напишите об этом в [Github issues](https://github.com/dvytvs/Ruscord-linux-version/issues)

> [!TIP]
> Если у вас возникают ошибки об несовместимости(к тому же и GTK) рекомендуется скачать файл ```.AppImage```,
> но будет много места т.к в ней находятся библиотеки хоть если у вас даже они уже установлены.
### Установка

[🔖Перейдите на страницу релизов и скачайте последнюю версию вашего пакета (обычно она сверху)](https://github.com/dvytvs/Ruscord-linux-version/releases)

#### Debian/Ubuntu (.deb)

После установки откройте терминал и введите это (пропустите эти пункты пока не увидите ваш пакетный менеджер)

```bash
sudo dpkg -i /home/ваш_юзернеим/downloads/Ruscord-1.2.9-linux-x64.deb
sudo apt-get install -f    # для установки библиотек если надо
```

---

#### Fedora/openSUSE (.rpm)

```bash
sudo rpm -i /home/ваш_юзернеим/downloads/Ruscord-1.2.9-linux-x64.rpm
```

или, если есть `dnf`:

```bash
sudo dnf install /home/ваш_юзернеим/downloads/Ruscord-1.2.9-linux-x64.rpm
```

---

#### Arch Linux (.pacman)

```bash
sudo pacman -U /home/ваш_юзернеим/downloads/Ruscord-1.2.9-linux-x64.pacman
```

---

#### AppImage

1. Сделайте файл исполняемым:

```bash
chmod +x /home/ваш_юзернеим/downloads/Ruscord-1.2.9-linux-x64.AppImage
```

2. Запустите:

```bash
./Ruscord-1.2.9-linux-x64.AppImage
```

---

### tar.xz

 ```bash
wget (вставьте ссылку из последней версии)
sudo mkdir -p /opt/ruscord
sudo tar -xf Ruscord-1.2.9-linux-x64.tar.xz -C /opt/ruscord --strip-components=1
sudo ln -s /opt/ruscord/Ruscord /usr/local/bin/ruscord
```
> [!TIP]
> Если нихуя не поняли как установить из tar.xz,
> не добивайте голову
> используйте .AppImage
> (проверено ✅)
---

### Запуск
После установки в меню появится **Ruscord**. Просто запусти её оттуда.
Если установил `.AppImage`, то запускайте через терминал или двойным кликом по файлу.
