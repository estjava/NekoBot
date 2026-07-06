import { Message, Client, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import {joinVoiceChannel } from '@discordjs/voice';

export default {
    name: 'Leave',
    description: 'Leaves the voice channel.',
    usage: ['!leave'],
    aliases: ['l'],
    category: 'Voices',
    examples: ['!leave'],
    permissions: PermissionFlagsBits.Connect,

    async execute(message: Message, args: string[], client: Client) {

        if (!message.guild) return;

        const guildId = message.guild?.id;
        
    }
}