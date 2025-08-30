# Инструкции по установке L2Api Agent

## 🚀 Быстрая установка

### Windows
1. Скачайте `L2Api Agent Setup 0.1.0.exe` из раздела [Releases](https://github.com/your-username/L2Api-Agent/releases)
2. Запустите установщик
3. Следуйте инструкциям мастера установки
4. Запустите приложение из меню "Пуск" или с рабочего стола

### Portable версия (Windows)
1. Скачайте `L2Api Agent 0.1.0.exe`
2. Распакуйте в любую папку
3. Запустите `L2Api Agent.exe`

## 🔧 Установка из исходного кода

### Требования

#### Windows
- **Node.js 18+**: [Скачать с nodejs.org](https://nodejs.org/)
- **Git**: [Скачать с git-scm.com](https://git-scm.com/)
- **Visual Studio Build Tools** (опционально): Для компиляции нативных модулей

#### macOS
- **Node.js 18+**: `brew install node`
- **Git**: `brew install git`
- **Xcode Command Line Tools**: `xcode-select --install`

#### Linux (Ubuntu/Debian)
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git
sudo apt-get install git

# Дополнительные зависимости
sudo apt-get install build-essential
```

### Пошаговая установка

1. **Клонирование репозитория**
```bash
git clone https://github.com/webdes27/L2Api-Agent.git
cd L2Api-Agent
```

2. **Установка зависимостей**
```bash
npm install
```

3. **Сборка проекта**
```bash
npm run build
```

4. **Запуск в режиме разработки**
```bash
npm start
```

5. **Создание дистрибутива** (опционально)
```bash
npm run dist
```

## 🤖 Настройка AI-провайдеров

### OpenAI
1. Зарегистрируйтесь на [platform.openai.com](https://platform.openai.com)
2. Создайте API ключ в разделе "API Keys"
3. В приложении: AI Settings → OpenAI → Введите API ключ

### Anthropic Claude
1. Зарегистрируйтесь на [console.anthropic.com](https://console.anthropic.com)
2. Создайте API ключ
3. В приложении: AI Settings → Anthropic → Введите API ключ

### Локальные модели

#### Ollama
```bash
# Установка Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Скачивание модели
ollama pull llama2
ollama pull codellama
ollama pull mistral

# Запуск сервера
ollama serve
```

#### LM Studio
1. Скачайте [LM Studio](https://lmstudio.ai)
2. Установите и запустите
3. Скачайте модель (например, Llama 2)
4. Запустите модель в LM Studio

## 🔧 Конфигурация

### Файл конфигурации
Приложение создает конфигурационный файл в:
- **Windows**: `%APPDATA%/L2Api Agent/config.json`
- **macOS**: `~/Library/Application Support/L2Api Agent/config.json`
- **Linux**: `~/.config/L2Api Agent/config.json`

### Пример конфигурации
```json
{
  "ai": {
    "provider": "openai",
    "config": {
      "apiKey": "sk-...",
      "model": "gpt-4",
      "temperature": 0.7,
      "maxTokens": 4000
    }
  },
  "editor": {
    "theme": "dark",
    "fontSize": 14,
    "fontFamily": "Cascadia Code, Consolas, monospace"
  },
  "memory": {
    "autoSave": true,
    "saveInterval": 30000
  }
}
```

## 🐛 Устранение неполадок

### Проблемы с установкой

#### Node.js не найден
```bash
# Проверьте версию Node.js
node --version

# Если не установлен, установите:
# Windows: Скачайте с nodejs.org
# macOS: brew install node
# Linux: sudo apt-get install nodejs
```

#### Ошибки npm install
```bash
# Очистите кэш npm
npm cache clean --force

# Удалите node_modules и package-lock.json
rm -rf node_modules package-lock.json

# Переустановите зависимости
npm install
```

#### Ошибки сборки
```bash
# Windows: Установите Visual Studio Build Tools
npm install --global windows-build-tools

# macOS: Установите Xcode Command Line Tools
xcode-select --install

# Linux: Установите build-essential
sudo apt-get install build-essential
```

### Проблемы с AI-провайдерами

#### OpenAI API ошибки
- Проверьте правильность API ключа
- Убедитесь, что у вас есть кредиты на счете
- Проверьте лимиты API

#### Локальные модели не работают
```bash
# Проверьте, что Ollama запущен
ollama list

# Проверьте порт
curl http://localhost:11434/api/tags

# Перезапустите Ollama
ollama serve
```

### Проблемы с производительностью

#### Медленная работа
- Закройте другие приложения
- Увеличьте объем RAM
- Используйте SSD диск

#### Проблемы с памятью
- Уменьшите размер контекста в настройках AI
- Очистите историю разговоров
- Перезапустите приложение

## 📞 Поддержка

### Логи приложения
Логи сохраняются в:
- **Windows**: `%APPDATA%/L2Api Agent/logs/`
- **macOS**: `~/Library/Logs/L2Api Agent/`
- **Linux**: `~/.config/L2Api Agent/logs/`

### Получение помощи
1. Проверьте [FAQ](https://github.com/webdes27/L2Api-Agent/wiki/FAQ)
2. Создайте [Issue](https://github.com/webdes27/L2Api-Agent/issues)
3. Напишите на support@l2api.com

## 🔄 Обновления

### Автоматические обновления
Приложение проверяет обновления при запуске и уведомляет о новых версиях.

### Ручное обновление
1. Скачайте новую версию
2. Остановите приложение
3. Замените файлы
4. Перезапустите

### Обновление из исходного кода
```bash
git pull origin main
npm install
npm run build
```

---

**Удачной работы с L2Api Agent!** 🚀
