import { Message, Client, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import {joinVoiceChannel } from '@discordjs/voice';
import { t } from '../../utils/locale';

export default {
    name: 'Join',
    description: 'Joins the voice channel you are currently in.',
    usage: ['!join'],
    aliases: ['j'],
    category: 'Voices',
    examples: ['!join'],
    permissions: PermissionFlagsBits.Connect,

    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;
        const gid = message.guild.id;

        const embedSuccess = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription(t(gid, 'player.joinSuccess'))

        const embedError = new EmbedBuilder()
            .setColor('#ED4245')
            .setDescription(t(gid, 'player.joinError'))

        const embedNotInChannel = new EmbedBuilder()
            .setColor('#ED4245')
            .setDescription(t(gid, 'player.notInVoice'))

        const embedBotNoPermission = new EmbedBuilder()
            .setColor('#ED4245')
            .setDescription(t(gid, 'player.botNoPermission'))

        const embedUserNoPermission = new EmbedBuilder()
            .setColor('#ED4245')
            .setDescription(t(gid, 'player.userNoPermission'))
            
        if (!message.guild) return;

        // Bot's own permissions
        if (!message.guild.members.me?.permissions.has(PermissionFlagsBits.Connect)) {
            return message.reply({ embeds: [embedBotNoPermission] });
        }

        // Caller's permissions
        if (!message.member?.permissions.has(PermissionFlagsBits.Connect)) {
            return message.reply({ embeds: [embedUserNoPermission] });
        }

        // Check if the user is in a voice channel
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply({ embeds: [embedNotInChannel] });
        }

        // Join the voice channel
        const guildId = message.guild.id;
        try {
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guildId,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            return message.reply({ embeds: [embedSuccess] });

        } catch (error) {
            return message.reply({ embeds: [embedError] });
        }

    }
};