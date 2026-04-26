const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'prefix',
    description: 'Lihat atau ubah prefix bot',
    category: 'Utility',
    permissions: [PermissionFlagsBits.ManageGuild],
    usage: '!prefix [new_prefix]',
    aliases: ['setprefix', 'changeprefix'],
    execute(message, args, client) {
        const currentPrefix = client.prefixes.get(message.guild.id) || client.config.prefix;
        
        // Jika tidak ada argument, tampilkan prefix saat ini
        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('⚙️ Prefix Bot')
                .setDescription(`Prefix saat ini: **\`${currentPrefix}\`**`)
                .addFields({
                    name: '💡 Cara Mengubah',
                    value: `Gunakan \`${currentPrefix}prefix <prefix_baru>\`\nContoh: \`${currentPrefix}prefix ?\``
                })
                .setFooter({ text: `Server: ${message.guild.name}` })
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }
        
        // Ubah prefix
        const newPrefix = args[0];
        
        // Validasi prefix
        if (newPrefix.length > 5) {
            return message.reply('❌ Prefix tidak boleh lebih dari 5 karakter!');
        }
        
        if (newPrefix.includes(' ')) {
            return message.reply('❌ Prefix tidak boleh mengandung spasi!');
        }
        
        // Save prefix baru
        client.savePrefix(message.guild.id, newPrefix);
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Prefix Berhasil Diubah!')
            .setDescription(`Prefix lama: **\`${currentPrefix}\`**\nPrefix baru: **\`${newPrefix}\`**`)
            .addFields({
                name: '📝 Contoh Penggunaan',
                value: `\`${newPrefix}help\`\n\`${newPrefix}ping\`\n\`${newPrefix}userinfo\``
            })
            .setFooter({ text: `Diubah oleh ${message.author.tag}` })
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
        
        console.log(`🔧 Prefix changed in ${message.guild.name} (${message.guild.id}): ${currentPrefix} → ${newPrefix}`);
    }
};