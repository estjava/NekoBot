import { EmbedBuilder, Message } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { t } from '../../utils/locale';
import { destroyQueue } from '../../music/queue';
import { say } from '../../music/guards';

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

        const embedNotinVoice = new EmbedBuilder()
            .setColor('#ED4245')
            .setDescription(t(gid, 'player.notInVoice'));

        const embedNotSameChannel = new EmbedBuilder()
            .setColor('#ED4245')
            .setDescription(t(gid, 'player.notSameChannel'));

        const embedLeaveSuccess = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription(t(gid, 'player.leaveSuccess'));

        const embedLeaveError = new EmbedBuilder()
            .setColor('#ED4245')
            .setDescription(t(gid, 'player.leaveError'));

        
        const connection = getVoiceConnection(gid);
        if (!connection) return say(message, t(gid, 'player.notInVoice'), 0xED4245);

        const botChannelId = message.guild.members.me?.voice.channelId;
        const userChannelId = message.member?.voice.channelId;
        if (!userChannelId || userChannelId !== botChannelId) {
            return say(message, t(gid, 'player.notSameChannel'), 0xED4245);
        }

        try {
            // Also stops playback and clears the queue if there is one.
            if (!destroyQueue(gid)) connection.destroy();
            return say(message, t(gid, 'player.leaveSuccess'), 0x57F287);
        } catch (error) {
            console.error(error);
            return say(message, t(gid, 'player.leaveError'), 0xED4245);
        }
    },
};
