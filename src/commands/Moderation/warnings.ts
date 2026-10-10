import { Client, EmbedBuilder, Message, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';
import { parseUserId, prefixOf } from '../../utils/moderation';
import { getWarnings } from '../../utils/warnings';

const SHOW = 10; // newest warnings shown; keeps the embed under Discord's size limit

export default {
    name: 'Warnings',
    description: 'Shows the warnings of a member.',
    usage: ['!warnings <@user | ID>'],
    aliases: ['warns'],
    category: 'Moderation',
    examples: ['!warnings @user'],
    permissions: PermissionFlagsBits.ModerateMembers,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;

        // Works for users who already left the server too, so only an ID is needed.
        const id = parseUserId(args[0]);
        if (!id) {
            return say(message, t(gid, 'mod.noTarget', { usage: `${prefixOf(client, gid)}warnings <@user | ID>` }), COLORS.error);
        }

        const list = getWarnings(gid, id);
        if (!list.length) return say(message, t(gid, 'warnings.none', { user: `<@${id}>` }));

        const user = await client.users.fetch(id).catch(() => null);
        const shown = list.slice(-SHOW);
        const firstNumber = list.length - shown.length + 1;
        const lines = shown.map((w, i) =>
            t(gid, 'warnings.entry', {
                num: firstNumber + i,
                time: Math.floor(w.timestamp / 1000),
                mod: w.moderatorId,
                reason: w.reason,
            })
        );
        let description = lines.join('\n\n');
        if (list.length > shown.length) {
            description += `\n\n${t(gid, 'warnings.more', { count: list.length - shown.length })}`;
        }

        const embed = new EmbedBuilder()
            .setColor(COLORS.warn)
            .setTitle(t(gid, 'warnings.title', { user: user?.tag ?? id }))
            .setDescription(description)
            .setFooter({ text: t(gid, 'warnings.footer', { count: list.length }) });

        return message.reply({ embeds: [embed] });
    },
};
