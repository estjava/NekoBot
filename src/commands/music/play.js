const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'play',
    description: 'Putar musik dari YouTube',
    category: 'Music',
    aliases: ['p'],
    usage: '!play <url/query>',
    async execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('❌ Kamu harus join voice channel dulu!');
        }

        if (!args.length) {
            return message.reply('❌ Masukkan URL atau judul lagu!\nContoh: `!play never gonna give you up`');
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return message.reply('❌ Saya tidak punya permission!');
        }

        const search = args.join(' ');
        let songInfo;

        try {
            // Search or validate URL
            const searched = await play.search(search, { limit: 1 });
            if (!searched || searched.length === 0) {
                return message.reply('❌ Tidak menemukan lagu!');
            }

            songInfo = searched[0];
        } catch (error) {
            console.error(error);
            return message.reply('❌ Terjadi error saat mencari lagu!');
        }

        const song = {
            title: songInfo.title,
            url: songInfo.url,
            duration: songInfo.durationRaw,
            thumbnail: songInfo.thumbnails[0]?.url,
            author: songInfo.channel?.name,
            requester: message.author
        };

        let queue = client.queue.get(message.guild.id);

        if (!queue) {
            // Create new queue
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                player: createAudioPlayer(),
                songs: [],
                volume: 50,
                playing: true,
                loop: false
            };

            client.queue.set(message.guild.id, queueConstruct);
            queueConstruct.songs.push(song);

            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });

                queueConstruct.connection = connection;
                connection.subscribe(queueConstruct.player);

                this.playSong(message.guild, queueConstruct.songs[0], client);

                const embed = new EmbedBuilder()
                    .setColor('#FF1493')
                    .setTitle('🎵 Now Playing')
                    .setDescription(`**[${song.title}](${song.url})**`)
                    .addFields(
                        { name: '👤 Channel', value: song.author, inline: true },
                        { name: '⏱️ Duration', value: song.duration, inline: true }
                    )
                    .setThumbnail(song.thumbnail)
                    .setFooter({ text: `Requested by ${song.requester.tag}` });

                message.reply({ embeds: [embed] });
            } catch (error) {
                console.error(error);
                client.queue.delete(message.guild.id);
                return message.reply('❌ Gagal join voice channel!');
            }
        } else {
            // Add to queue
            queue.songs.push(song);
            
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Added to Queue')
                .setDescription(`**[${song.title}](${song.url})**`)
                .addFields(
                    { name: '👤 Channel', value: song.author, inline: true },
                    { name: '⏱️ Duration', value: song.duration, inline: true },
                    { name: '📊 Position', value: `${queue.songs.length}`, inline: true }
                )
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Requested by ${song.requester.tag}` });

            return message.reply({ embeds: [embed] });
        }
    },

    async playSong(guild, song, client) {
        const queue = client.queue.get(guild.id);
        if (!song) {
            queue.connection.destroy();
            client.queue.delete(guild.id);
            return queue.textChannel.send('✅ Queue selesai! Keluar dari voice channel.');
        }

        try {
            const stream = await play.stream(song.url);
            const resource = createAudioResource(stream.stream, {
                inputType: stream.type,
                inlineVolume: true
            });

            resource.volume.setVolume(queue.volume / 100);
            queue.player.play(resource);

            queue.player.on(AudioPlayerStatus.Idle, () => {
                if (queue.loop) {
                    this.playSong(guild, song, client);
                } else {
                    queue.songs.shift();
                    this.playSong(guild, queue.songs[0], client);
                }
            });

            queue.player.on('error', error => {
                console.error('Player error:', error);
                queue.songs.shift();
                this.playSong(guild, queue.songs[0], client);
            });
        } catch (error) {
            console.error(error);
            queue.songs.shift();
            this.playSong(guild, queue.songs[0], client);
        }
    }
};