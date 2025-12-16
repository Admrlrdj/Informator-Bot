const {
    SlashCommandBuilder,
    MessageFlags,
    EmbedBuilder
} = require('discord.js');
const axios = require('axios');

const IG_USERNAME = 'infantryvokasi';
const DISCORD_CHANNEL_ID = '1449389549842202778';
let lastPostShortcode = '';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-ig')
        .setDescription('Cek postingan terakhir @infantryvokasi via instagram120'),

    async execute(interaction) {
        await interaction.deferReply({
            flags: [MessageFlags.Ephemeral]
        });

        try {
            const options = {
                method: 'POST',
                url: 'https://instagram120.p.rapidapi.com/api/instagram/posts',
                headers: {
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                    'x-rapidapi-host': 'instagram120.p.rapidapi.com',
                    'Content-Type': 'application/json'
                },
                data: {
                    username: IG_USERNAME,
                    maxId: ''
                }
            };

            const response = await axios.request(options);
            const posts = response.data.result && response.data.result.edges ? response.data.result.edges : [];

            if (posts.length > 0) {
                const latestPost = posts[0].node;
                const shortcode = latestPost.code;
                const postUrl = `https://www.instagram.com/p/${shortcode}/`;

                // Ambil URL gambar pertama dari JSON (candidates[0])
                const imageUrl = latestPost.image_versions2 ? .candidates ? . [0] ? .url;

                const embed = new EmbedBuilder()
                    .setColor('#E1306C')
                    .setDescription(latestPost.caption ? .text || "No caption")
                    .setImage(imageUrl) // Menampilkan gambar feed di embed
                    .setTimestamp();

                await interaction.channel.send({
                    content: `Halo Warga Infantry! IG @${IG_USERNAME} barusan upload feed nih, gas di cek yeee cihuy\n\n🔗 ${postUrl}`,
                    embeds: [embed]
                });

                await interaction.editReply('✅ Notif test berhasil dikirim!');
            } else {
                await interaction.editReply('❌ Tidak ada postingan ditemukan.');
            }
        } catch (error) {
            console.error('RapidAPI Error:', error.message);
            await interaction.editReply(`❌ Gagal: ${error.message}`);
        }
    },

    init: (client) => {
        console.log(`📸 Monitor Instagram (@${IG_USERNAME}) via RapidAPI aktif...`);
        setInterval(async () => {
            try {
                const options = {
                    method: 'POST',
                    url: 'https://instagram120.p.rapidapi.com/api/instagram/posts',
                    headers: {
                        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                        'x-rapidapi-host': 'instagram120.p.rapidapi.com',
                        'Content-Type': 'application/json'
                    },
                    data: {
                        username: IG_USERNAME,
                        maxId: ''
                    }
                };

                const response = await axios.request(options);
                const posts = response.data.result && response.data.result.edges ? response.data.result.edges : [];

                if (posts.length > 0) {
                    const latestPost = posts[0].node;
                    const shortcode = latestPost.code;

                    if (shortcode && shortcode !== lastPostShortcode) {
                        lastPostShortcode = shortcode;
                        const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
                        if (channel) {
                            const postUrl = `https://www.instagram.com/p/${shortcode}/`;
                            const imageUrl = latestPost.image_versions2 ? .candidates ? . [0] ? .url;

                            const embed = new EmbedBuilder()
                                .setColor('#E1306C')
                                .setDescription(latestPost.caption ? .text || "No caption")
                                .setImage(imageUrl)
                                .setTimestamp();

                            await channel.send({
                                content: `Halo Warga Infantry! IG @${IG_USERNAME} barusan upload feed nih, gas di cek yeee cihuy\n\n🔗 ${postUrl}`,
                                embeds: [embed]
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('⚠️ IG Monitor Error:', err.message);
            }
        }, 600000); // 10 menit sekali
    }
};