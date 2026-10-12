import { log } from '../../utils/logger';
import { Message } from 'discord.js';
import { t } from '../../utils/locale';
import { BusyElsewhereError, getOrCreateQueue, getQueue } from '../../music/queue';
import { ensureVoice } from '../../music/guards';
import { COLORS, say } from '../../utils/embedBuilder';

export default {
    name: 'Join',
    description: 'Joins the voice channel you are currently in.',
    usage: ['!join'],
    aliases: ['j'],
    category: 'Voices',
    examples: ['!join'],

    async execute(message: Message) {
        if (!message.guild) return;
        const gid = message.guild.id;

        // Cek user ada di voice channel + bot boleh join/speak (izin level channel)
        const voice = await ensureVoice(message);
        if (!voice) return;

        const botChannelId = message.guild.members.me?.voice.channelId;
        const existing = getQueue(gid);

        if (botChannelId === voice.id) {
            return say(message, t(gid, 'player.alreadyInChannel', { channel: voice.id }), COLORS.error);
        }
        // Sedang memutar musik di channel lain: jangan dibajak
        if (existing && (existing.current || existing.tracks.length)) {
            return say(message, t(gid, 'player.notSameChannel'), COLORS.error);
        }

        try {
            // Lewat queue (bukan joinVoiceChannel langsung) supaya !play, !leave, dan
            // timer idle memakai koneksi yang sama dan menunggu koneksi benar-benar siap.
            const queue = await getOrCreateQueue(message.guild, voice, message.channel);
            queue.stop(); // reset state + mulai timer idle 3 menit kalau tidak ada yang memutar
            return say(message, t(gid, 'player.joinSuccess'), COLORS.success);
        } catch (error) {
            if (error instanceof BusyElsewhereError) {
                return say(message, t(gid, 'player.notSameChannel'), COLORS.error);
            }
            log.error('[join]', error);
            return say(message, t(gid, 'player.joinError'), COLORS.error);
        }
    },
};
