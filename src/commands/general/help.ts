import { Message, Client, EmbedBuilder, Collection, PermissionResolvable } from 'discord.js';
import { t } from '../../utils/locale';
import { COLORS, say } from '../../utils/embedBuilder';

interface HelpCommand {
    name: string;
    description?: string;
    category?: string;
    // Command lain menulis usage sebagai array (['!play <song>']), ping/help sebagai string.
    usage?: string | string[];
    examples?: string[];
    aliases?: string[];
    permissions?: PermissionResolvable;
    ownerOnly?: boolean;
}

const EMBED_COLOR = COLORS.default;
const FIELD_LIMIT = 1024;

// Urutan kategori di menu. Kategori lain muncul setelahnya (alfabetis).
const CATEGORY_ORDER = ['General', 'Voices', 'Music', 'Moderation'];

const toList = (v?: string | string[]): string[] =>
    v === undefined ? [] : Array.isArray(v) ? v : [v];

// Teks usage/example ditulis dengan '!', ganti ke prefix server yang aktif.
const withPrefix = (text: string, prefix: string): string =>
    text.startsWith('!') ? prefix + text.slice(1) : text;

export default {
    name: 'Help',
    description: 'Show all commands or details of one command',
    category: 'General',
    usage: ['!help [command]'],
    examples: ['!help', '!help play'],
    aliases: ['h', 'commands'] as string[],
    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const guildId = message.guild.id;
        const prefix = client.prefixes.get(guildId) || client.config.prefix;
        const isOwner = message.author.id === client.config.ownerId;

        const commands = client.commands as unknown as Collection<string, HelpCommand>;
        // Sembunyikan command khusus owner dari user biasa
        const visible = commands.filter(cmd => isOwner || !cmd.ownerOnly);

        // ---- Detail satu command: !help <command|alias> ----
        let query = args[0]?.toLowerCase();
        if (query?.startsWith(prefix)) query = query.slice(prefix.length);
        if (query) {
            const cmd =
                visible.get(query) ||
                visible.find(c => c.aliases?.some(a => a.toLowerCase() === query));

            if (!cmd) {
                return say(message, t(guildId, 'help.notFound', { name: query }), COLORS.error);
            }

            const usage = toList(cmd.usage).map(u => withPrefix(u, prefix));
            if (!usage.length) usage.push(`${prefix}${cmd.name.toLowerCase()}`);
            const examples = toList(cmd.examples).map(e => withPrefix(e, prefix));

            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle(`${prefix}${cmd.name.toLowerCase()}`)
                .setDescription(cmd.description || t(guildId, 'help.noDescription'))
                .addFields({
                    name: t(guildId, 'common.Usage'),
                    value: usage.map(u => `\`${u}\``).join('\n').slice(0, FIELD_LIMIT)
                });

            if (examples.length) {
                embed.addFields({
                    name: t(guildId, 'common.examples'),
                    value: examples.map(e => `\`${e}\``).join('\n').slice(0, FIELD_LIMIT)
                });
            }
            if (cmd.category) {
                embed.addFields({ name: t(guildId, 'help.category'), value: cmd.category, inline: true });
            }
            if (cmd.aliases?.length) {
                embed.addFields({
                    name: t(guildId, 'help.aliases'),
                    value: cmd.aliases.map(a => `\`${prefix}${a}\``).join(', ').slice(0, FIELD_LIMIT),
                    inline: true
                });
            }

            return message.reply({ embeds: [embed] });
        }

        // ---- Daftar semua command, dikelompokkan per kategori ----
        const groups = new Map<string, HelpCommand[]>();
        for (const cmd of visible.values()) {
            const category = cmd.category || t(guildId, 'help.other');
            const list = groups.get(category) ?? [];
            list.push(cmd);
            groups.set(category, list);
        }

        const sortedCategories = [...groups.keys()].sort((a, b) => {
            const ia = CATEGORY_ORDER.indexOf(a);
            const ib = CATEGORY_ORDER.indexOf(b);
            if (ia !== -1 && ib !== -1) return ia - ib;
            if (ia !== -1) return -1;
            if (ib !== -1) return 1;
            return a.localeCompare(b);
        });

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(t(guildId, 'help.title'))
            .setDescription(t(guildId, 'help.description', { prefix }))
            .setFooter({ text: t(guildId, 'help.footer', { count: visible.size }) });

        for (const category of sortedCategories) {
            const cmds = groups.get(category)!.sort((a, b) => a.name.localeCompare(b.name));
            let value = cmds.map(c => `\`${prefix}${c.name.toLowerCase()}\``).join(' ');
            if (value.length > FIELD_LIMIT) value = value.slice(0, FIELD_LIMIT - 1) + '…';
            embed.addFields({ name: category, value });
        }

        return message.reply({ embeds: [embed] });
    }
};
