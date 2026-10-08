import { Message, VoiceBasedChannel } from 'discord.js';
import { t } from '../utils/locale';
import { GuildQueue, getQueue } from './queue';
import { COLORS, say } from '../utils/embedBuilder';

// say() sekarang ada di utils/embedBuilder.ts; di-export ulang agar import lama tetap jalan.
export { say };

/** The user must be in a voice channel the bot can join and speak in. */
export async function ensureVoice(message: Message): Promise<VoiceBasedChannel | null> {
    const channel = message.member?.voice.channel;
    if (!channel) {
        await say(message, t(message.guildId!, 'player.noVoiceChannel'), COLORS.error);
        return null;
    }
    if (!channel.joinable || ('speakable' in channel && !channel.speakable)) {
        await say(message, t(message.guildId!, 'player.noPermission'), COLORS.error);
        return null;
    }
    return channel;
}

/** There must be an active queue and the user must be in the bot's channel. */
export async function ensureQueue(message: Message): Promise<GuildQueue | null> {
    const gid = message.guildId!;
    const queue = getQueue(gid);
    if (!queue) {
        await say(message, t(gid, 'player.notInVoice'), COLORS.error);
        return null;
    }
    const botChannel = message.guild!.members.me?.voice.channelId;
    if (!message.member?.voice.channelId || message.member.voice.channelId !== botChannel) {
        await say(message, t(gid, 'player.notSameChannel'), COLORS.error);
        return null;
    }
    return queue;
}

export function getPrefix(client: unknown, guildId: string): string {
    const c = client as { prefixes?: Map<string, string>; config?: { prefix?: string } };
    return c.prefixes?.get(guildId) || c.config?.prefix || '!';
}
