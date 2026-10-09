# NekoBot
![Node.js Version](https://img.shields.io/badge/node-v24-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-development-success)

<img src="img/logo.png" alt="NekoBot logo" width="200">


A prefix-based Discord bot written in TypeScript (discord.js v14) with music playback and EN/ID locale files. All replies are embeds. Moderation commands are still in progress.

## Commands

Default prefix is `!` (change it per server with `!prefix <new>`).

**General**
- [+] `help` (`h`, `commands`): list all commands, or `!help <command>` for details
- [+] `ping`: bot latency
- [+] `prefix` (`setprefix`): change the server prefix

**Music**
- [+] `play` (`p`): song name, video URL or playlist URL
- [+] `random` (`rand`, `rnd`) `[genre or artist]`: play a random song
- [+] `pause`, `resume` (`unpause`), `skip` (`s`, `next`), `stop`
- [+] `queue` (`q`), `nowplaying` (`np`)
- [+] `loop [off|track|queue]` (`repeat`), `shuffle` (`mix`), `remove <n>` (`rm`)
- [+] `join` (`j`), `leave` (`l`, `disconnect`, `dc`)

**Moderation**
- [-] `kick`, `mute` and more (planned)

Playlists and YouTube mixes: `!play <playlist link>` queues up to 50 songs (change with `MAX_PLAYLIST`).
A link that has both a video and a list (`watch?v=...&list=...`) plays only the video; add `--playlist` to load the whole list. 
"Play mix" links (`start_radio=1`) are loaded as a list automatically.

`!random` picks a song from a built-in list of keywords (edit `KEYWORDS` in `src/commands/Voices/random.ts`), or from your own search: `!random lofi`, `!random Bondan Prakoso`. 
It only picks songs between 1 and 10 minutes long and skips songs that are already in the queue.

## Setup

Requirements: 
- Node.js (developed on v24)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for music (ffmpeg is bundled through `ffmpeg-static`)

```bash
npm install
```

**1. Discord Developer Portal**

- Bot tab → Privileged Gateway Intents: enable **Message Content Intent** and **Server Members Intent**.
- Invite the bot with the `bot` scope and these permissions: View Channels, Send Messages, Embed Links, Connect, Speak.

**2. Create a `.env` file**

```env
DISCORD_TOKEN=your-bot-token
PREFIX=!
OWNER_ID=your-user-id

# Optional
# YTDLP_PATH=D:\path\to\NekoBot\lib\yt-dlp.exe
# MAX_PLAYLIST=50
```

**3. yt-dlp**

Put `yt-dlp.exe` in the `lib/` folder (it is ignored by Git) and set `YTDLP_PATH` to it, or make sure `yt-dlp` is on your PATH.
Keep yt-dlp updated (`yt-dlp -U`), since YouTube changes often.

YouTube also needs a JavaScript runtime. Download `deno.exe` from the
[Deno releases](https://github.com/denoland/deno/releases) into `lib/` and create
`lib/yt-dlp.conf` containing:

    --js-runtimes deno:D:/path/to/NekoBot/lib/deno.exe

Check it with `yt-dlp -v -s <video url>`: the log should show `JS runtimes: deno-x.y.z`.

## Run

```bash
npm run dev     # development (tsx, watch mode)
npm run build   # compile to dist/ and copy locale/database JSON files
npm start       # run the compiled bot (run build first)
```

Notes:
- In watch mode, new command files and edits to the locale JSON files need a manual restart.
- Per-server settings (prefix, language) are saved as JSON in `utils/database/`. Dev mode uses `src/utils/database/`, `npm start` uses `dist/utils/database/`, so the two do not share data. These files are not tracked by Git, and a rebuild never overwrites existing ones.
- The bot leaves the voice channel 3 minutes after the queue ends.

## Project structure

```
src/
├── commands/    # one file per command, grouped into category folders
│   ├── General/
│   ├── Voices/
│   └── Moderation/
├── events/      # Discord event handlers (messageCreate, clientReady)
├── handlers/    # loaders for commands and events
├── music/       # queue, yt-dlp source, voice checks
└── utils/       # locale, embed helpers, locales/*.json, database/*.json
```

## Adding a command

Create a file in `src/commands/<Category>/`. The loader picks it up automatically, and `!help` lists it:

```ts
import { Message } from 'discord.js';
import { COLORS, say } from '../../utils/embedBuilder';

export default {
    name: 'Hello',
    description: 'Says hello.',
    category: 'General',
    usage: ['!hello'],
    examples: ['!hello'],
    aliases: ['hi'],
    // permissions: PermissionFlagsBits.ManageGuild,   // optional: required user permission
    // ownerOnly: true,                                // optional: bot owner only
    async execute(message: Message, args: string[]) {
        return say(message, 'Hello!', COLORS.success);
    },
};
```

Texts shown to users belong in `src/utils/locales/en.json` and `id.json` (use `t(guildId, 'section.key')`). 
Restart the bot after adding a command.

## License

[MIT](LICENSE)
