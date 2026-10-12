import { log } from '../../utils/logger';
import { Client, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';

export default {
    name: 'Prefix',
    description: "Shows or changes the bot's prefix.",
    usage: ['!prefix', '!prefix set <newPrefix>'],
    aliases: [] as string[],
    category: 'Config',
    examples: ['!prefix', '!prefix set ?'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;
        const current = client.prefixes.get(gid) || client.config.prefix;

        // "!prefix" (or anything that is not "set"): show the current prefix and how to change it.
        if ((args[0] ?? '').toLowerCase() !== 'set') {
            return say(message, t(gid, 'prefix.current', { prefix: current }));
        }

        // Only "set" changes anything, so only "set" needs the permission (anyone may look).
        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return say(message, t(gid, 'prefix.UserPermission'), COLORS.error);
        }

        const newPrefix = args[1];

        if (!newPrefix) {
            return say(message, t(gid, 'prefix.noPrefix', { prefix: current }), COLORS.error);
        }

        if (newPrefix.length > 5) {
            return say(message, t(gid, 'prefix.tooLong'), COLORS.error);
        }

        try {
            // Simpan ke memori + data/prefixes.json (didefinisikan di index.ts)
            client.savePrefix(gid, newPrefix);

            await say(message, t(gid, 'prefix.success', { prefix: newPrefix }), COLORS.success);
        } catch (error) {
            log.error('[prefix]', error);
            await say(message, t(gid, 'prefix.failed'), COLORS.error);
        }
    },
};
