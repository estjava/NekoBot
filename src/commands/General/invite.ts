import { Client, Message, OAuth2Scopes, PermissionFlagsBits } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';

export default {
    name: 'Invite',
    description: 'Gives a link to add the bot to another server.',
    usage: ['!invite'],
    aliases: ['inv'],
    category: 'General',
    examples: ['!invite'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;

        try {
            // Only what the bot needs: read/answer messages with embeds, and join + speak in voice.
            const url = client.generateInvite({
                scopes: [OAuth2Scopes.Bot],
                permissions: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.EmbedLinks,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.Connect,
                    PermissionFlagsBits.Speak,
                ],
            });
            return say(message, t(gid, 'invite.text', { url }));
        } catch (error) {
            // generateInvite throws if the application info is not loaded yet
            console.error('[invite]', error);
            return say(message, t(gid, 'invite.error'), COLORS.error);
        }
    },
};
