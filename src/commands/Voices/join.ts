import { Message, Client, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import {joinVoiceChannel } from '@discordjs/voice';

export default {
    name: 'Join',
    description: 'Joins the voice channel you are currently in.',
    usage: ['!join'],
    aliases: ['j'],
    category: 'Voices',
    examples: ['!join'],
    permissions: PermissionFlagsBits.Connect,

    async execute(message: Message, args: string[], client: Client) {
        
        const embedSuccess = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle(`${client.user?.tag}`)
            .setDescription(`Successfully joined the voice channel`)

        const embedError = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle(`${client.user?.tag}`)
            .setDescription(`There was an error joining the voice channel.`)

        const embedNotInChannel = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle(`${client.user?.tag}`)
            .setDescription(`You need to be in a voice channel for me to join.`)

        const embedBotNoPermission = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle(`${client.user?.tag}`)
            .setDescription(`I do not have permission to connect to voice channels.`)

        const embedUserNoPermission = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle(`${client.user?.tag}`)
            .setDescription(`You do not have permission to connect to voice channels.`)
            
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