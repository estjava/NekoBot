const { t } = require('../utils/locale');

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const guildId = message.guild.id;
        const guildPrefix = client.prefixes.get(guildId);
        const prefix = guildPrefix || client.config.prefix;

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName)
            || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        if (command.permissions) {
            if (!message.member || !message.member.permissions.has(command.permissions)) {
                return message.reply(t(guildId, 'common.noPermission')); // ← localized
            }
        }

        if (command.ownerOnly && message.author.id !== client.config.ownerId) {
            return message.reply(t(guildId, 'common.ownerOnly')); // ← localized
        }

        try {
            command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply(t(guildId, 'common.error')); // ← localized
        }
    }
};