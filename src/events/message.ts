import { log } from '../utils/logger';
import { Message, Client, PermissionResolvable } from 'discord.js';
import { t } from '../utils/locale';
import { COLORS, say } from '../utils/embedBuilder';

interface Command {
    name: string;
    aliases?: string[];
    permissions?: PermissionResolvable;
    ownerOnly?: boolean;
    execute(message: Message, args: string[], client: Client): unknown;
}

module.exports = {
    name: 'messageCreate',
    description: 'Handles incoming messages and executes commands.',
    async execute(message: Message, client: Client) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const guildId = message.guild.id;
        const guildPrefix = client.prefixes.get(guildId);
        const prefix = guildPrefix || client.config.prefix;

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        const command: Command | undefined =
            client.commands.get(commandName) ||
            client.commands.find((cmd: Command) =>
                cmd.aliases?.some(a => a.toLowerCase() === commandName)
            );

        if (!command) return;

        if (command.permissions) {
            if (!message.member?.permissions.has(command.permissions)) {
                log.debug(`[cmd] ${prefix}${commandName} denied (missing permission): ${message.author.tag} in "${message.guild.name}"`);
                return say(message, t(guildId, 'common.noPermission'), COLORS.error);
            }
        }

        if (command.ownerOnly && message.author.id !== client.config.ownerId) {
            return say(message, t(guildId, 'common.ownerOnly'), COLORS.error);
        }

        log.debug(`[cmd] ${prefix}${commandName} by ${message.author.tag} in "${message.guild.name}" (${guildId})`);

        try {
            await command.execute(message, args, client);
        } catch (error) {
            log.error(`[cmd] ${prefix}${commandName} failed in "${message.guild.name}" (${guildId}):`, error);
            await say(message, t(guildId, 'common.genericError'), COLORS.error).catch(() => {});
        }
    }
};