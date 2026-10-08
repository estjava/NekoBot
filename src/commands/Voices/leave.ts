import { Message } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { t } from '../../utils/locale';
import { destroyQueue } from '../../music/queue';
import { COLORS, say } from '../../utils/embedBuilder';

export default {
    name: 'Leave',
    description: 'Leaves the voice channel.',
    usage: ['!leave'],
    aliases: ['l', 'disconnect', 'dc'],
    category: 'Voices',
    examples: ['!leave'],

    async execute(message: Message) {
        if (!message.guild) return;
        const gid = message.guild.id;

        const connection = getVoiceConnection(gid);
        if (!connection) return say(message, t(gid, 'player.notInVoice'), COLORS.error);

        const botChannelId = message.guild.members.me?.voice.channelId;
        const userChannelId = message.member?.voice.channelId;
        if (!userChannelId || userChannelId !== botChannelId) {
            return say(message, t(gid, 'player.notSameChannel'), COLORS.error);
        }

        try {
            // Also stops playback and clears the queue if there is one.
            if (!destroyQueue(gid)) connection.destroy();
            return say(message, t(gid, 'player.leaveSuccess'), COLORS.success);
        } catch (error) {
            console.error(error);
            return say(message, t(gid, 'player.leaveError'), COLORS.error);
        }
    },
};
