import { log } from '../utils/logger';
import { ChannelType, Client, EmbedBuilder, Guild, GuildTextBasedChannel, PermissionFlagsBits, TextChannel } from 'discord.js';
import { t, supportedLangsList, languageName } from '../utils/locale';
import { COLORS } from '../utils/embedBuilder';

const NEEDED = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks];

/** The server's system channel, or else the first text channel (top to bottom) where the bot may post. */
async function pickChannel(guild: Guild): Promise<GuildTextBasedChannel | null> {
    // On join the bot's own member is normally cached; fetch it if it is not.
    const me = guild.members.me ?? (await guild.members.fetchMe().catch(() => null));
    if (!me) return null;

    const canPost = (channel: GuildTextBasedChannel | null): channel is GuildTextBasedChannel =>
        !!channel && channel.permissionsFor(me)?.has(NEEDED) === true;

    if (canPost(guild.systemChannel)) return guild.systemChannel;

    const fallback = guild.channels.cache
        .filter((c): c is TextChannel => c.type === ChannelType.GuildText && canPost(c))
        .sort((a, b) => a.rawPosition - b.rawPosition)
        .first();
    return fallback ?? null;
}

module.exports = {
    name: 'guildCreate',
    description: 'Triggered when the bot is added to a new server. Sends a short welcome message.',
    async execute(guild: Guild, client: Client) {
        try {
            const channel = await pickChannel(guild);
            if (!channel) return; // nowhere to speak: stay quiet instead of failing

            // A brand-new server has no saved language, so this is English. If the bot is re-added to a
            // server that chose a language before, that choice is still remembered.
            const gid = guild.id;
            const prefix = client.prefixes.get(gid) || client.config.prefix;
            const name = client.user?.username ?? 'NekoBot';

            const commands = ['play', 'skip', 'leave', 'help']
                .map((c) => `\`${prefix}${c}\` - ${t(gid, `commands.${c}.description`)}`)
                .join('\n');
            const languages = supportedLangsList().map((c) => `\`${c}\` ${languageName(c)}`).join(', ');

            const embed = new EmbedBuilder()
                .setColor(COLORS.default)
                .setTitle(t(gid, 'welcome.title', { name }))
                .setDescription(t(gid, 'welcome.description', { prefix }))
                .addFields(
                    { name: t(gid, 'welcome.commandsTitle'), value: commands },
                    { name: t(gid, 'welcome.settingsTitle'), value: t(gid, 'welcome.settings', { prefix, languages }) },
                    { name: t(gid, 'welcome.moderationTitle'), value: t(gid, 'welcome.moderation', { prefix }) }
                );

            const avatar = client.user?.displayAvatarURL();
            if (avatar) embed.setThumbnail(avatar);

            await channel.send({ embeds: [embed] });
        } catch (err) {
            // Missing permissions or a deleted channel must never break joining a server.
            log.warn(`[welcome] Could not send the welcome message in "${guild.name}":`, (err as Error).message);
        }
    },
};
