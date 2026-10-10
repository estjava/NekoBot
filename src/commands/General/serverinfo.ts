import { ChannelType, Client, EmbedBuilder, Message } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS } from '../../utils/embedBuilder';

export default {
    name: 'ServerInfo',
    description: 'Shows information about this server.',
    usage: ['!serverinfo'],
    aliases: ['server', 'guildinfo'],
    category: 'General',
    examples: ['!serverinfo'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const guild = message.guild;
        const gid = guild.id;

        const channels = guild.channels.cache;
        const text = channels.filter((c) => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement).size;
        const voice = channels.filter((c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice).size;

        const created = Math.floor(guild.createdTimestamp / 1000);

        const embed = new EmbedBuilder()
            .setColor(COLORS.default)
            .setTitle(guild.name)
            .addFields(
                { name: t(gid, 'serverinfo.owner'), value: `<@${guild.ownerId}>`, inline: true },
                { name: t(gid, 'serverinfo.created'), value: `<t:${created}:D> (<t:${created}:R>)`, inline: true },
                { name: t(gid, 'serverinfo.members'), value: String(guild.memberCount), inline: true },
                { name: t(gid, 'serverinfo.channels'), value: t(gid, 'serverinfo.channelsValue', { text, voice }), inline: true },
                { name: t(gid, 'serverinfo.roles'), value: String(guild.roles.cache.size), inline: true },
                {
                    name: t(gid, 'serverinfo.boosts'),
                    value: t(gid, 'serverinfo.boostsValue', { tier: guild.premiumTier, count: guild.premiumSubscriptionCount ?? 0 }),
                    inline: true,
                }
            )
            .setFooter({ text: `ID: ${guild.id}` });

        const icon = guild.iconURL();
        if (icon) embed.setThumbnail(icon);

        return message.reply({ embeds: [embed] });
    },
};
