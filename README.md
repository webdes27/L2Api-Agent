# L2Api Agent

AI-Powered Code Editor based on Visual Studio Code with integrated AI assistance.

## 🚀 Features

- **AI-Powered Code Editing**: Integrated AI assistant with support for multiple providers
- **VS Code-like Interface**: Familiar editing experience with Monaco Editor
- **Project Memory**: Save and restore project context and AI conversations
- **Multiple AI Providers**: Support for OpenAI, Anthropic, and local models (Ollama, LM Studio)
- **File Management**: Open files and folders with full project tree view
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 📋 Requirements

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** (for cloning the repository)

## 🛠️ Installation & Build

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/L2Api-Agent.git
cd L2Api-Agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Application

```bash
# Build both main and renderer processes
npm run build

# Or build separately
npm run build:main
npm run build:renderer
```

### 4. Run in Development Mode

```bash
npm start
```

### 5. Create Distribution

```bash
# Create portable executable and installer
npm run dist
```

The built files will be available in the `dist-electron/` directory:
- `L2Api Agent 0.1.0.exe` - Portable executable
- `L2Api Agent Setup 0.1.0.exe` - Windows installer

## 🤖 AI Configuration

### Setting up AI Providers

1. **OpenAI**: Add your API key in AI Settings
2. **Anthropic**: Add your API key in AI Settings  
3. **Local Models**: 
   - **Ollama**: Install and run Ollama locally
   - **LM Studio**: Install and run LM Studio locally

### Accessing AI Features

- Use the **Chat** button in the status bar to open AI chat
- Use the **Settings** button to configure AI providers
- Use keyboard shortcuts: `Ctrl+Shift+A` for AI Chat

## 📁 Project Structure

```
L2Api-Agent/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # React renderer process
│   └── ai/            # AI integration modules
├── out/               # Compiled TypeScript files
├── dist-electron/     # Built application files
├── package.json       # Project configuration
└── README.md         # This file
```

## 🔧 Development

### Available Scripts

- `npm run build` - Build the entire application
- `npm run build:main` - Build main process only
- `npm run build:renderer` - Build renderer process only
- `npm start` - Run the application
- `npm run dev` - Run in development mode with hot reload
- `npm run dist` - Create distribution packages
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Development Mode

```bash
npm run dev
```

This will start both the main process and renderer process in watch mode.

## 🐛 Troubleshooting

### Common Issues

1. **"npm not found"**: Install Node.js from [nodejs.org](https://nodejs.org/)
2. **Build errors**: Make sure all dependencies are installed with `npm install`
3. **Electron not found**: Run `npm install` to install Electron
4. **Permission errors**: Run as administrator on Windows

### Debug Mode

To run with developer tools:

```bash
npm start
```

Then use `Ctrl+Shift+I` to open DevTools.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/L2Api-Agent/issues)
- **Email**: support@l2api.com

## 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- Code editor powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- UI built with [React](https://reactjs.org/)
- AI integration with multiple providers
