import { Message, Client, EmbedBuilder } from 'discord.js';
import { t } from './../../utils/locale';


export default {
    name: 'Help',
    description: 'Display help information',
    category: 'General',
    usage: '!help [command]',
    aliases: ['h'],
    
    async execute(message: Message, args: string[], client: Client) {
        if (!message.guild) return;

    }

}