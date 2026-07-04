import { joinVoiceChannel, VoiceConnectionStatus, entersState } from '@discordjs/voice';
import { t } from '../../../utils/locale';

module.exports = {
    name: 'Join',
    description: 'Makes the bot join your voice channel',
    category: 'Musics',
    usage: '!join',
    aliases: [],
    async execute(message, args, client) {
        // Implementation for Joining the voice channel
    }
};