import { Message, Client, PermissionResolvable } from 'discord.js';
import { t } from '../utils/locale';

interface Command {
    name: string;
    aliases?: string[];
    permissions?: PermissionResolvable;
    ownerOnly?: boolean;
    execute(message: Message, args: string[], client: Client): void;
}

module.exports = {
    name: 'messageCreate',
    execute(message: Message, client: Client) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const guildId = message.guild.id;
        const guildPrefix = client.prefixes.get(guildId);
        const prefix = guildPrefix || client.config.prefix;

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        const command: Command | undefined =
            client.commands.get(commandName) ||
            client.commands.find((cmd: Command) => cmd.aliases?.includes(commandName));

        if (!command) return;

        if (command.permissions) {
            if (!message.member?.permissions.has(command.permissions)) {
                return message.reply(t(guildId, 'common.noPermission'));
            }
        }

        if (command.ownerOnly && message.author.id !== client.config.ownerId) {
            return message.reply(t(guildId, 'common.ownerOnly'));
        }

        try {
            command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply(t(guildId, 'common.error'));
        }
    }
};