const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    name: 'join',
    description: 'Bot join ke voice channel kamu',
    category: 'Music',
    aliases: ['j', 'connect'],
    usage: '!join',
    execute(message, args, client) {
        // Check if user is in voice channel
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('❌ Kamu harus join voice channel dulu!');
        }

        // Check permissions
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return message.reply('❌ Saya tidak punya permission untuk join/speak di channel ini!');
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            message.reply(`✅ Joined **${voiceChannel.name}**! 🎵`);
        } catch (error) {
            console.error(error);
            message.reply('❌ Gagal join voice channel!');
        }
    }
};