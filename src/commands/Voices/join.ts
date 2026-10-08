import { Message } from 'discord.js';
import { t } from '../../utils/locale';
import { createQueue, getQueue } from '../../music/queue';
import { ensureVoice, say } from '../../music/guards';

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
            return say(message, t(gid, 'player.alreadyInChannel', { channel: voice.id }), 0xED4245);
        }
        // Sedang memutar musik di channel lain: jangan dibajak
        if (existing && (existing.current || existing.tracks.length)) {
            return say(message, t(gid, 'player.notSameChannel'), 0xED4245);
        }

        try {
            existing?.destroy();
            // Lewat queue (bukan joinVoiceChannel langsung) supaya !play, !leave, dan
            // timer idle memakai koneksi yang sama dan menunggu koneksi benar-benar siap.
            const queue = await createQueue(message.guild, voice, message.channel);
            queue.stop(); // reset state + mulai timer idle 3 menit kalau tidak ada yang memutar
            return say(message, t(gid, 'player.joinSuccess'), 0x57F287);
        } catch (error) {
            console.error('[join]', error);
            return say(message, t(gid, 'player.joinError'), 0xED4245);
        }
    },
};
