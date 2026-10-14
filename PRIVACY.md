# NekoBot Privacy Policy

Last updated: October 14, 2026

This policy explains what data NekoBot ("the Bot") reads, stores and shares when you use it on Discord. The Bot is operated by **EstJava** ("the operator"). Contact details are at the end.

By using the Bot or adding it to a server, you agree to this policy. If you do not agree, remove the Bot from your server and stop using it.

## 1. What the Bot reads

- **Messages.** To find commands, the Bot reads the text of messages in channels it can see and checks whether a message starts with the server's prefix. Messages that are not commands are ignored and are not stored.
- **Command text.** What you type after a command (a song name, a link, a reason, a number) is used to carry out that command.
- **Voice.** The Bot joins voice channels to play audio. It does not listen to or record voice.

## 2. Data the Bot stores

The Bot saves the following in files on the machine that runs it. IDs below are Discord IDs and may count as personal data in some places.

| Data | What is saved | When it is saved |
|---|---|---|
| Server settings | Server ID, command prefix, language, 24/7 mode, idle time | When someone with permission changes a setting |
| Warnings | Server ID, the warned user's ID, the moderator's ID, the reason text, the time | When a moderator uses `warn` |

The Bot does **not** store message content, usernames, avatars, IP addresses or voice.

## 3. Data used only temporarily

- **Music queue.** Song titles, links, durations and who requested them are kept in memory only. They are discarded when the Bot leaves the voice channel or restarts.
- **Moderation actions.** For `kick`, `ban`, `mute` and `warn`, the Bot may send the member a private message with the reason. For `kick`, `ban` and `mute`, the reason is also written to the server's **audit log** by Discord, together with the moderator's name. The Bot does not keep a copy of these reasons.
- **Logs.** The machine running the Bot may print technical logs to its console: command names, server names and IDs, and error details. When debug logging is on, the username of whoever ran a command is included too. Logs are not shared and exist only as long as the host keeps its console output.

## 4. How the data is used

Only to run the Bot's features: applying a server's settings, showing and managing warnings, and finding and fixing errors. The data is not sold, not used for advertising or profiling, and not shared with anyone except the services in section 5.

## 5. Other services

- **Discord.** The Bot works through Discord, which handles messages, private messages and audit logs under [Discord's Privacy Policy](https://discord.com/privacy).
- **YouTube.** To play music, search terms and links you give to `play` or `random` are sent to YouTube through the open-source tool yt-dlp, from the machine that runs the Bot. YouTube's own terms and policies apply to that content.

## 6. How long data is kept

- Server settings are kept until they are deleted. **They are not deleted automatically when the Bot is removed from a server.**
- Warnings are kept until a moderator removes them with `unwarn`, or until deleted on request.
- Temporary data (section 3) is not kept.

## 7. Your choices

You can ask the operator what is stored about your user ID or your server ID, and ask for it to be deleted. Send your request using the contact details below and include the ID. Requests are handled within **[FILL IN: for example, 30 days]**.

You can also stop all collection at any time by removing the Bot from your server.

## 8. Security

Data is saved as files on the machine that runs the Bot, and only the operator has access to it. No system is perfectly secure, so we cannot promise absolute security.

## 9. Children

The Bot is meant for people who meet Discord's minimum age requirement. It is not aimed at children, and the operator does not knowingly collect data from anyone under that age.

## 10. Changes

This policy may change. The date at the top shows the latest version, and continuing to use the Bot after a change means you accept it.

## 11. Contact

- Discord username: **EstJava#8823**
- GitHub issues (public, so do not post private information there): <https://github.com/estjava/NekoBot/issues>

See also the [Terms of Service](TERMS.md).
