# NekoBot
![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-success)
Discord bot dengan fitur music player dan modular commands.

## 🔧 Dependencies

## 📦 Installation
git clone https://github.com/estjava/NekoBot.git
cd NekoBot
npm install

## ⚙️ Configuration
1. Copy `.env.example` ke `.env`
2. Isi token bot kamu:
DISCORD_TOKEN=your_token_here
CLIENT_ID=your_client_id_here


## 🚀 Running the Bot
npm start
# atau
node src/index.js

## 📁 Project Structure
NekoBot/
├── src/
│   ├── commands/
│   │   ├── music/        # Music commands
│   │   ├── utility/      # Utility commands
│   │   └── moderation/   # Moderation commands
│   ├── events/           # Event handlers
│   ├── handlers/         # Command & event loaders
│   └── index.js          # Entry point
├── database/             # Database files
├── .env                  # Environment variables
└── package.json

## 📝 License

## 🤝 Contributing
