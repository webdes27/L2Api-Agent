# 🤖 L2Api Agent

> **AI-Powered Code Editor** - Современный редактор кода с интегрированным ИИ-ассистентом, основанный на архитектуре Visual Studio Code

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/webdes27/L2Api-Agent)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-27.0+-purple.svg)](https://electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://typescriptlang.org/)

---

## 📸 Скриншоты

*Современный интерфейс с тремя панелями: проект, редактор кода и AI-ассистент*

---

## ✨ Особенности

### 🧠 **Интеллектуальный AI-ассистент**
- 🔥 **Множественные AI-провайдеры**: OpenAI GPT-4/GPT-5, Anthropic Claude, Google Gemini, DeepSeek
- 🏠 **Локальные модели**: Полная поддержка Ollama и LM Studio
- 💾 **Память проекта**: Сохранение контекста и истории диалогов
- 🎨 **Cursor-подобный интерфейс**: Знакомый и удобный дизайн
- 📎 **Прикрепление изображений**: Отправка скриншотов AI-ассистенту

### 💻 **Продвинутый редактор кода**
- ⚡ **Monaco Editor**: Тот же движок, что используется в VS Code
- 🎨 **Синтаксическая подсветка**: Поддержка 180+ языков программирования
- 📝 **Умное автодополнение**: IntelliSense для популярных языков
- 🌙 **Темная тема**: Современный дизайн, приятный для глаз
- 🔧 **Настраиваемые горячие клавиши**: Как в VS Code

### 📁 **Управление проектами**
- 🌳 **Дерево проекта**: Навигация по файлам и папкам
- 🎯 **Умное открытие**: Поддержка файлов и целых проектов
- 💾 **Автосохранение**: Сохранение состояния проекта
- 🔄 **Отслеживание изменений**: Визуальные индикаторы несохраненных файлов
- 🎭 **Множественные вкладки**: Работа с несколькими файлами одновременно

### 🎮 **Пользовательский интерфейс**
- 📐 **Изменяемые панели**: Drag & Drop изменение размеров
- ⚡ **Быстрая навигация**: Контекстные меню и горячие клавиши
- 🎨 **Профессиональный дизайн**: Стилизованные диалоги и уведомления
- 🖱️ **Интуитивное управление**: Знакомый интерфейс для разработчиков

### 🛠️ **Технические возможности**
- 🖥️ **Кроссплатформенность**: Windows, macOS, Linux
- 🔌 **Расширяемость**: Модульная архитектура
- ⚡ **Высокая производительность**: Нативная скорость Electron
- 🛡️ **Безопасность**: Изолированные процессы

---

## 🚀 Быстрый старт

### 📋 Системные требования

- **Node.js** 18.0.0+ ([Скачать](https://nodejs.org/))
- **npm** 8.0.0+ (входит в Node.js)
- **Git** ([Скачать](https://git-scm.com/))
- **Операционная система**: Windows 10+, macOS 10.15+, или Linux

### ⚡ Установка за 3 шага

```bash
# 1. Клонировать репозиторий
git clone https://github.com/webdes27/L2Api-Agent.git
cd L2Api-Agent

# 2. Установить зависимости
npm install

# 3. Запустить приложение
npm start
```

### 🔨 Сборка дистрибутива

```bash
# Создать исполняемые файлы
npm run dist
```

**Результат:**
- `📦 L2Api Agent 0.1.0.exe` - Портативная версия
- `📦 L2Api Agent Setup 0.1.0.exe` - Установщик для Windows
- `📦 L2Api-Agent.AppImage` - Linux AppImage (если собирается на Linux)
- `📦 L2Api Agent.dmg` - macOS DMG (если собирается на macOS)

---

## 🔧 Конфигурация AI

### 🤖 Настройка провайдеров

#### **OpenAI**
1. Получите API ключ на [platform.openai.com](https://platform.openai.com/api-keys)
2. Откройте **AI → AI Settings**
3. Введите ключ в разделе OpenAI
4. Доступные модели: `GPT-4`, `GPT-4 Turbo`, `GPT-5`, `GPT-3.5 Turbo`

#### **Anthropic Claude**
1. Получите API ключ на [console.anthropic.com](https://console.anthropic.com/)
2. Откройте **AI → AI Settings**
3. Введите ключ в разделе Anthropic
4. Доступные модели: `Claude 3.5 Sonnet`, `Claude 3 Opus`, `Claude 3 Haiku`

#### **Локальные модели**

##### **Ollama**
```bash
# Установить Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Запустить модель
ollama run llama2
```

##### **LM Studio**
1. Скачайте [LM Studio](https://lmstudio.ai/)
2. Загрузите любую GGUF модель
3. Запустите локальный сервер
4. Настройте в L2Api Agent

### 🎯 Использование AI

- **💬 Чат**: `Ctrl+Shift+A` или кнопка "Chat with AI"
- **⚙️ Настройки**: Кнопка "AI Settings"
- **📎 Прикрепление**: Кнопка скрепки для отправки изображений
- **🔄 Режимы**: Agent (диалог) или Ask (вопрос-ответ)

---

## 📁 Структура проекта

```
L2Api-Agent/
├── 📂 src/
│   ├── 📂 main/                 # Electron основной процесс
│   │   ├── main.ts             # Входная точка приложения
│   │   ├── preload.ts          # Preload скрипт
│   │   └── tsconfig.json       # TypeScript конфигурация
│   │
│   ├── 📂 renderer/            # React интерфейс
│   │   ├── 📂 components/      # React компоненты
│   │   │   ├── App.tsx         # Главный компонент
│   │   │   ├── Editor.tsx      # Редактор кода
│   │   │   ├── AIChat.tsx      # AI чат интерфейс
│   │   │   ├── Sidebar.tsx     # Боковая панель
│   │   │   └── ...
│   │   ├── 📂 styles/          # CSS стили
│   │   ├── 📂 types/           # TypeScript типы
│   │   └── index.tsx           # Входная точка React
│   │
│   ├── 📂 ai/                  # AI интеграция
│   │   ├── AIManager.ts        # Менеджер AI провайдеров
│   │   ├── 📂 providers/       # AI провайдеры
│   │   ├── 📂 memory/          # Память проекта
│   │   └── 📂 tools/           # AI инструменты
│   │
│   └── 📂 test/                # Тесты
│
├── 📂 out/                     # Скомпилированные файлы
├── 📂 dist-electron/           # Готовые дистрибутивы
├── 📂 assets/                  # Ресурсы (иконки и т.д.)
├── 📄 package.json             # Конфигурация проекта
├── 📄 tsconfig.json            # TypeScript конфигурация
├── 📄 webpack.config.js        # Webpack конфигурация
└── 📄 README.md                # Этот файл
```

---

## 🛠️ Разработка

### 📜 Доступные команды

```bash
# 🔨 Разработка
npm run dev              # Режим разработки с hot-reload
npm run dev:main         # Только основной процесс (watch)
npm run dev:renderer     # Только renderer (webpack-dev-server)

# 🏗️ Сборка
npm run build            # Полная сборка проекта
npm run build:main       # Сборка основного процесса
npm run build:renderer   # Сборка renderer процесса

# 🚀 Запуск
npm start               # Запуск собранного приложения

# 📦 Дистрибуция
npm run pack            # Создать неупакованную версию
npm run dist            # Создать установщики

# 🧪 Тестирование и качество
npm test                # Запуск тестов
npm run lint            # Проверка кода (ESLint)
npm run lint:fix        # Автоисправление проблем
```

### 🐛 Отладка

#### Режим разработки
```bash
npm run dev
```

#### DevTools
- **Основной процесс**: `Ctrl+Shift+I`
- **Renderer процесс**: Встроенные DevTools

#### Логирование
```typescript
// Использование в коде
console.log('Debug info:', data);
console.error('Error occurred:', error);
```

### 🔧 Конфигурации

#### **TypeScript** (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true
  }
}
```

#### **Webpack** (`webpack.config.js`)
- Hot Module Replacement в dev режиме
- Минификация для production
- Source maps для отладки

#### **Electron Builder** (`package.json`)
- Автоматическая упаковка для Windows/macOS/Linux
- Создание установщиков
- Подписание кода (опционально)

---

## 🎨 Поддерживаемые языки

### 💻 **Языки программирования** (180+)
```
JavaScript, TypeScript, Python, Java, C#, C++, Go, Rust, PHP,
Ruby, Swift, Kotlin, Scala, Dart, R, MATLAB, SQL, HTML, CSS,
SCSS, Less, XML, JSON, YAML, Markdown, Shell, PowerShell,
Dockerfile, GraphQL, и многие другие...
```

### 🎮 **Игровые движки**
```
UnrealScript (.uc), Unity C#, Godot GDScript, Lua,
GameMaker Language (GML), HLSL, GLSL
```

### 🌐 **Web технологии**
```
React, Vue, Angular, Svelte, Next.js, Nuxt.js,
Node.js, Express, FastAPI, Django, Flask
```

---

## 🚨 Устранение неполадок

### ❓ Частые проблемы

#### **1. "npm not found"**
```bash
# Установите Node.js с официального сайта
# https://nodejs.org/
```

#### **2. Ошибки сборки**
```bash
# Очистите кэш и переустановите зависимости
rm -rf node_modules package-lock.json
npm install
```

#### **3. Electron не найден**
```bash
# Переустановите Electron
npm uninstall electron
npm install electron --save-dev
```

#### **4. Ошибки разрешений (Windows)**
```bash
# Запустите терминал от имени администратора
# Или используйте:
npm config set user 0
npm config set unsafe-perm true
```

#### **5. Monaco Editor не загружается**
```bash
# Проверьте, что webpack правильно обрабатывает ресурсы
npm run build:renderer
```

### 🔍 Получение справки

**При возникновении проблем:**

1. **Проверьте логи**: Откройте DevTools (`Ctrl+Shift+I`)
2. **Очистите кэш**: `rm -rf node_modules && npm install`
3. **Пересоберите проект**: `npm run build`
4. **Создайте issue**: [GitHub Issues](https://github.com/webdes27/L2Api-Agent/issues)

### 📊 Системная информация

Для диагностики проблем укажите:
```bash
node --version          # Версия Node.js
npm --version           # Версия npm
electron --version      # Версия Electron (после npm install)
```

---

## 🤝 Участие в разработке

### 🌟 Как внести вклад

1. **Fork репозиторий**
2. **Создайте ветку функции**: `git checkout -b feature/amazing-feature`
3. **Сделайте изменения** и покройте их тестами
4. **Зафиксируйте изменения**: `git commit -m 'Add amazing feature'`
5. **Отправьте в ветку**: `git push origin feature/amazing-feature`
6. **Создайте Pull Request**

### 📋 Правила разработки

#### **Код**
- ✅ Используйте TypeScript для типизации
- ✅ Следуйте ESLint правилам
- ✅ Покрывайте код тестами
- ✅ Документируйте публичные API

#### **Коммиты**
```
feat: добавить новую функцию
fix: исправить баг
docs: обновить документацию
style: изменения стилей
refactor: рефакторинг кода
test: добавить тесты
```

#### **Pull Requests**
- 📝 Подробное описание изменений
- 🧪 Все тесты должны проходить
- 📖 Обновленная документация
- 🎯 Одна функция = один PR

### 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Main Process  │    │ Renderer Process│    │   AI Providers  │
│                 │    │                 │    │                 │
│ • Window mgmt   │◄──►│ • React UI      │◄──►│ • OpenAI        │
│ • File system   │    │ • Monaco Editor │    │ • Anthropic     │
│ • AI manager    │    │ • State mgmt    │    │ • Local models  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📄 Лицензия

Этот проект распространяется под лицензией **MIT License**. Подробности в файле [LICENSE](LICENSE).

```
MIT License

Copyright (c) 2024 L2Api Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🌟 Поддержка проекта

### 💝 Помочь проекту

- ⭐ **Поставьте звезду** на GitHub
- 🐛 **Сообщайте о багах** через Issues
- 💡 **Предлагайте улучшения** через Discussions
- 🔀 **Отправляйте Pull Requests**
- 📢 **Расскажите друзьям** о проекте

### 📞 Связь

- **📧 Email**: [support@l2api.com](mailto:support@l2api.com)
- **🐛 Issues**: [GitHub Issues](https://github.com/webdes27/L2Api-Agent/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/webdes27/L2Api-Agent/discussions)
- **📱 Telegram**: [@l2api_support](https://t.me/l2api_support)

---

## 🙏 Благодарности

### 🛠️ Основные технологии

- **[Electron](https://electronjs.org/)** - Кроссплатформенная разработка
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Редактор кода от Microsoft
- **[React](https://reactjs.org/)** - UI библиотека от Facebook
- **[TypeScript](https://typescriptlang.org/)** - Типизация для JavaScript
- **[Webpack](https://webpack.js.org/)** - Сборщик модулей

### 🤖 AI интеграции

- **[OpenAI](https://openai.com/)** - GPT модели
- **[Anthropic](https://anthropic.com/)** - Claude модели
- **[Ollama](https://ollama.ai/)** - Локальные модели
- **[LM Studio](https://lmstudio.ai/)** - Управление локальными моделями

### 🎨 Вдохновение

- **[Visual Studio Code](https://code.visualstudio.com/)** - За превосходную архитектуру
- **[Cursor](https://cursor.sh/)** - За инновационный AI-интерфейс
- **[Zed](https://zed.dev/)** - За производительность

---

## 🚀 Планы развития

### 📋 Ближайшие релизы

#### **v0.1.5** - Базовые функции
- [ ] Переработка основной панели меню
- [ ] Интеграция терминала
- [ ] Интеграция системы сравнения и изменений
- [ ] Добавить кастомизированные элементы управления для сборки проектов

#### **v0.2.0** - Расширенная AI интеграция
- [ ] Поддержка Google Gemini Pro
- [ ] Интеграция с GitHub Copilot
- [ ] AI-автодополнение кода
- [ ] Умный рефакторинг

#### **v0.3.0** - Продвинутые функции
- [ ] Встроенный терминал
- [ ] Git интеграция
- [ ] Плагинная система
- [ ] Темы оформления

#### **v1.0.0** - Стабильный релиз
- [ ] Полная документация API
- [ ] Производительные оптимизации
- [ ] Расширенная поддержка языков
- [ ] Enterprise функции

### 🎯 Долгосрочные цели

- 🌐 **Web версия** - Работа в браузере
- 📱 **Мобильные приложения** - iOS и Android
- 🔌 **VS Code расширение** - Плагин для VS Code
- 🤖 **Собственная AI модель** - Специализированная для кода

---

<div align="center">

### ⭐ Если проект полезен, поставьте звезду! ⭐

**Сделано с ❤️ командой L2Api**

[🌟 GitHub](https://github.com/webdes27/L2Api-Agent) • [📧 Поддержка](mailto:support@emu-dev.ru) • [💬 Telegram](https://t.me/la2edition)

</div>

---

> **L2Api Agent** - Будущее разработки уже здесь! 🚀