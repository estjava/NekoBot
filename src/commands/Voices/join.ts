import { log } from '../../utils/logger';
import { Message } from 'discord.js';
import { t } from '../../utils/locale';
import { BusyElsewhereError, getOrCreateQueue, getQueue } from '../../music/queue';
import { ensureVoice } from '../../music/guards';
import { COLORS, descEmbed, say } from '../../utils/embedBuilder';

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

        // Lewat queue (bukan joinVoiceChannel langsung) supaya !play, !leave, dan
        // timer idle memakai koneksi yang sama.
        // Joining starts right away (the bot shows up in the channel at once), but the connection only
        // becomes ready 1-3 seconds later. Waiting for that before replying made the answer lag behind
        // the bot, so the reply is sent now and turned into an error message if joining fails.
        const joining = getOrCreateQueue(message.guild, voice, message.channel);
        joining.catch(() => {}); // handled below; avoids an "unhandled rejection" while the reply is being sent

        const reply = await say(message, t(gid, 'player.joinSuccess'), COLORS.success);

        try {
            const queue = await joining;
            queue.stop(); // reset state + mulai timer idle 3 menit kalau tidak ada yang memutar
        } catch (error) {
            let key = 'player.joinError';
            if (error instanceof BusyElsewhereError) key = 'player.notSameChannel';
            else log.error('[join]', error);
            await reply.edit({ embeds: [descEmbed(t(gid, key), COLORS.error)] }).catch(() => {});
        }
    },
};
