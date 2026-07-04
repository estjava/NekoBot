import { joinVoiceChannel, VoiceConnectionStatus, entersState } from '@discordjs/voice';
import { t } from '../../../utils/locale';

module.exports = {
    name: 'Play',
    description: 'Play a music in the voice channel',
    category: 'Musics',
    aliases: ['p'],
    example: ['!play Despacito'],
    async execute(message, args, client) {
        // Implementation for playing music
    }
}