const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Kick member dari server',
    category: 'Moderation',
    permissions: [PermissionFlagsBits.KickMembers],
    usage: '!kick @user [reason]',
    execute(message, args, client) {
        const member = message.mentions.members.first();
        
        if (!member) {
            return message.reply('❌ Mention user yang ingin di-kick!');
        }
        
        if (!member.kickable) {
            return message.reply('❌ Saya tidak bisa kick user ini!');
        }
        
        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        member.kick(reason)
            .then(() => {
                message.reply(`✅ ${member.user.tag} telah di-kick!\nAlasan: ${reason}`);
            })
            .catch(err => {
                console.error(err);
                message.reply('❌ Gagal kick user!');
            });
    }
};