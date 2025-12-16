const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const IG_USERNAME = 'infantryvokasi';
const DISCORD_CHANNEL_ID = '1449389549842202778'; // Target Channel ID
let lastPostShortcode = '';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-ig')
        .setDescription('Cek postingan terakhir @infantryvokasi dan kirim ke channel warga'),

    async execute(interaction) {
        // Balasan ephemeral agar tidak mengotori channel saat command dipanggil
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        try {
            const options = {
                method: 'POST',
                url: 'https://instagram120.p.rapidapi.com/api/instagram/posts',
                headers: {
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                    'x-rapidapi-host': 'instagram120.p.rapidapi.com',
                    'Content-Type': 'application/json'
                },
                data: { username: IG_USERNAME, maxId: '' }
            };

            const response = await axios.request(options);
            const posts = response.data.result && response.data.result.edges ? response.data.result.edges : [];
            
            const limit = response.headers['x-ratelimit-requests-limit'];
            const remaining = response.headers['x-ratelimit-requests-remaining'];
            console.log(`📊 Kuota RapidAPI: ${remaining} / ${limit} sisa respon.`);
            
            if (posts.length > 0) {
                const latestPost = posts[0].node;
                const shortcode = latestPost.code;
                const postUrl = `https://www.instagram.com/p/${shortcode}/`;
                const imageUrl = latestPost.image_versions2?.candidates?.[0]?.url;

                // Ambil target channel
                const targetChannel = await interaction.client.channels.fetch(DISCORD_CHANNEL_ID);
                
                if (targetChannel) {
                    const embed = new EmbedBuilder()
                        .setColor('#E1306C')
                        .setDescription(latestPost.caption?.text || "No caption")
                        .setImage(imageUrl)
                        .setTimestamp()
                        .setFooter({ text: `Instagram • @${IG_USERNAME}` });

                    // Kirim pesan ke channel spesifik
                    await targetChannel.send({
                        content: `Halo Warga Infantry! IG @${IG_USERNAME} barusan upload feed nih, gas di cek yeee cihuy\n\n🔗 ${postUrl}`,
                        embeds: [embed]
                    });

                    await interaction.editReply(`✅ Berhasil! Pesan telah dikirim ke <#${DISCORD_CHANNEL_ID}>`);
                } else {
                    await interaction.editReply('❌ Gagal: Channel tidak ditemukan.');
                }
            } else {
                await interaction.editReply('❌ Tidak ada postingan ditemukan.');
            }
        } catch (error) {
            console.error('RapidAPI Error:', error.message);
            await interaction.editReply(`❌ Gagal: ${error.message}`);
        }
    },

    init: (client) => {
        console.log(`📸 Monitor Instagram aktif untuk Channel: ${DISCORD_CHANNEL_ID}`);
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
                    data: { username: IG_USERNAME, maxId: '' }
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
                            const imageUrl = latestPost.image_versions2?.candidates?.[0]?.url;

                            const embed = new EmbedBuilder()
                                .setColor('#E1306C')
                                .setDescription(latestPost.caption?.text || "No caption")
                                .setImage(imageUrl)
                                .setTimestamp()
                                .setFooter({ text: `Instagram • @${IG_USERNAME}` });

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
        }, 600000); // 10 Menit
    }
};