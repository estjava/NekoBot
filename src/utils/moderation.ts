import { Client, Guild, GuildBan, GuildMember, Message, PermissionFlagsBits, RESTJSONErrorCodes, User } from 'discord.js';
import { descEmbed } from './embedBuilder';

/** "<@123>", "<@!123>" or a plain ID -> the ID, otherwise null. */
export function parseUserId(arg?: string): string | null {
    if (!arg) return null;
    const match = arg.match(/^<@!?(\d{15,22})>$/) ?? arg.match(/^(\d{15,22})$/);
    return match ? match[1] : null;
}

// The argument itself is parsed (not message.mentions), because replying to someone adds
// that person to the mentions even when they are not the target.
export async function resolveMember(message: Message, arg?: string): Promise<GuildMember | null> {
    const id = parseUserId(arg);
    if (!id || !message.guild) return null;
    try {
        return await message.guild.members.fetch(id);
    } catch (err) {
        // "Unknown Member/User" = really not in this server. Any other error (network, rate limit, ...)
        // is a failure to look them up, not proof that they are gone, so let it surface instead of
        // letting callers (like !ban by ID) skip the role checks.
        const code = (err as { code?: number }).code;
        if (code === RESTJSONErrorCodes.UnknownMember || code === RESTJSONErrorCodes.UnknownUser) return null;
        throw err;
    }
}

/**
 * The ban entry of a user, or null if they are not banned. Always asks Discord (force): without the
 * GuildModeration intent discord.js never hears about unbans, so its cache keeps reporting old bans.
 */
export async function fetchBan(guild: Guild, userId: string): Promise<GuildBan | null> {
    try {
        return await guild.bans.fetch({ user: userId, force: true });
    } catch (err) {
        if ((err as { code?: number }).code === RESTJSONErrorCodes.UnknownBan) return null;
        throw err;
    }
}

export const prefixOf = (client: Client, guildId: string): string =>
    client.prefixes.get(guildId) || client.config.prefix;

export type ModAction = 'kick' | 'ban' | 'mute' | 'warn';

/** A locale key explaining why the action is not allowed, or null if it is allowed. */
export function checkTarget(message: Message, target: GuildMember, action: ModAction): string | null {
    const guild = message.guild!;
    const executor = message.member!;
    if (target.id === executor.id) return 'mod.self';
    if (target.id === guild.members.me?.id) return 'mod.bot';
    if (target.id === guild.ownerId) return 'mod.owner';
    // Only the owner may act on members whose top role is equal to or above their own.
    if (executor.id !== guild.ownerId && target.roles.highest.comparePositionTo(executor.roles.highest) >= 0) {
        return 'mod.hierarchy';
    }
    // The bot itself must also be able to do it (role order + permission).
    if (action === 'kick' && !target.kickable) return 'mod.cannotAct';
    if (action === 'ban' && !target.bannable) return 'mod.cannotAct';
    // Discord does not allow timing out administrators at all, whatever the role order is.
    if (action === 'mute' && target.permissions.has(PermissionFlagsBits.Administrator)) return 'mod.cannotMuteAdmin';
    if (action === 'mute' && !target.moderatable) return 'mod.cannotAct';
    return null;
}

export const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000; // Discord's limit for timeouts

const UNIT_MS = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000 } as const;

/** "30s", "10m", "2h", "1d", "1w" -> milliseconds, or null if it is not a duration. */
export function parseDuration(input?: string): number | null {
    const match = input?.toLowerCase().match(/^(\d+)([smhdw])$/);
    if (!match) return null;
    return Number(match[1]) * UNIT_MS[match[2] as keyof typeof UNIT_MS];
}

/** 93784000 -> "1d 2h 3m 4s" (language-neutral). */
export function formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    const parts = [
        [Math.floor(s / 86400), 'd'],
        [Math.floor((s % 86400) / 3600), 'h'],
        [Math.floor((s % 3600) / 60), 'm'],
        [s % 60, 's'],
    ] as const;
    const shown = parts.filter(([n]) => n > 0).map(([n, unit]) => `${n}${unit}`);
    return shown.length ? shown.join(' ') : '0s';
}

/** Trim and shorten a reason so it fits in an embed and in Discord's audit log. */
export function cleanReason(text: string, max = 400): string {
    const trimmed = text.trim();
    return trimmed.length > max ? trimmed.slice(0, max - 1) + '…' : trimmed;
}

/** "Moderator: reason", shown in the server's audit log. Discord allows up to 512 characters. */
export function auditReason(message: Message, reason: string): string {
    return `${message.author.tag}: ${reason}`.slice(0, 512);
}

/** Best-effort private message. Returns the sent message, or null if the user has DMs closed. */
export async function tryDm(user: User, text: string): Promise<Message | null> {
    return user.send({ embeds: [descEmbed(text)] }).catch(() => null);
}
