import {t} from '../../../utils/locale';

module.exports = {
    name: 'Leave',
    description: 'Disconnect the bot from the voice channel.',
    category: 'Musics',
    usage: '!leave',
    aliases: [],
    async execute(message, args, client) {
        const guildId = message.guild.id;


        const botVc = message.guild.members.me.voice?.channelId;
        const userVc = message.member.voice?.channelId;
        if (!userVc || userVc !== botVc) {
            return message.reply(t(guildId, 'player.notSameChannel'));
        }

        message.react('👋')
    }
};