
module.exports = {
    name: 'voice',
    description: 'Command untuk menguji fitur voice',
    aliases: ['vo'],
    usage: '!voice',
    examples: [ '!voice' ],

    async execute(message, args, client) {
        message.reply('Voice command is working!');
    }
};