import { Message, Client, EmbedBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { destroyQueue } from '../../music/queue';

export default {
    name: 'Leave',
    description: 'Leaves the voice channel.',
    usage: ['!leave'],
    aliases: ['l', 'disconnect', 'dc'],
    category: 'Voices',
    examples: ['!leave'],

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;

        const embed = (color: string, description: string) =>
            new EmbedBuilder()
                .setColor(color as `#${string}`)
                .setDescription(description);

        const connection = getVoiceConnection(message.guild.id);
        if (!connection) {
            return message.reply({ embeds: [embed('#ED4245', "I'm not in a voice channel.")] });
        }

        const botChannelId = message.guild.members.me?.voice.channelId;
        const userChannelId = message.member?.voice.channelId;
        if (!userChannelId || userChannelId !== botChannelId) {
            return message.reply({
                embeds: [embed('#ED4245', 'You need to be in my voice channel to make me leave.')],
            });
        }

        try {
            // Also stops playback and clears the queue if there is one.
            if (!destroyQueue(message.guild.id)) connection.destroy();
            return message.reply({ embeds: [embed('#57F287', 'Successfully left the voice channel.')] });
        } catch (error) {
            console.error(error);
            return message.reply({
                embeds: [embed('#ED4245', 'There was an error leaving the voice channel.')],
            });
        }
    },
};
