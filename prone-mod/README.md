# Prone Mod для Minecraft 1.21.1 (NeoForge)

Мод, который позволяет игроку ложиться на землю при нажатии клавиши **Z**.

## Требования
- Minecraft 1.21.1
- NeoForge 21.1.65 или выше

## Установка
1. Установите NeoForge для Minecraft 1.21.1
2. Скачайте мод и поместите файл `.jar` в папку `mods` вашего профиля Minecraft
3. Запустите игру с профилем NeoForge

## Использование
- Нажмите **Z**, чтобы лечь на землю
- Нажмите **Z** ещё раз, чтобы встать

## Сборка из исходников
```bash
cd prone-mod
./gradlew build
```
Собранный файл мода будет находиться в `build/libs/`

## Структура проекта
```
prone-mod/
├── build.gradle              # Конфигурация сборки Gradle
├── settings.gradle           # Настройки проекта
└── src/main/
    ├── java/com/example/pronemod/
    │   └── ProneMod.java     # Основной код мода
    └── resources/
        ├── META-INF/
        │   └── neoforge.mods.toml  # Конфигурация мода
        └── assets/pronemod/lang/
            ├── ru_ru.json    # Русская локализация
            └── en_us.json    # Английская локализация
```

## Лицензия
MIT
