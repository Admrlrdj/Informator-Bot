const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');
const axios = require('axios');

const IG_USERNAME = 'infantryvokasi';
const DISCORD_CHANNEL_ID = '1449389549842202778';
let lastPostShortcode = '';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-ig')
        .setDescription('Cek postingan terakhir @infantryvokasi via instagram120 (Official Method)'),

    async execute(interaction) {
        await interaction.deferReply({
            flags: [MessageFlags.Ephemeral]
        });

        try {
            const options = {
                method: 'POST', // Menggunakan POST sesuai snippet
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

            // Berdasarkan dokumentasi, data postingan biasanya ada di response.data.items atau response.data.data
            const posts = response.data.items || response.data.data || response.data;

            if (posts && posts.length > 0) {
                const latestPost = posts[0];

                // Mengambil caption secara aman
                let caption = "Update baru!";
                if (latestPost.caption && latestPost.caption.text) {
                    caption = latestPost.caption.text;
                }

                // Link menggunakan 'code' atau 'shortcode'
                const shortcode = latestPost.code || latestPost.shortcode;
                const postUrl = `https://www.instagram.com/p/${shortcode}/`;

                await interaction.channel.send(`${caption} - @${IG_USERNAME}\n🔗 ${postUrl}`);
                await interaction.editReply('✅ Berhasil menarik data terbaru via Official Method!');
            } else {
                await interaction.editReply('❌ Tidak ada postingan ditemukan.');
            }
        } catch (error) {
            console.error('RapidAPI Error:', error.message);
            await interaction.editReply(`❌ Gagal: ${error.response?.data?.message || error.message}`);
        }
    },

    init: (client) => {
        console.log(`📸 Monitor Instagram (@${IG_USERNAME}) via instagram120 aktif...`);
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
                const posts = response.data.items || response.data.data || response.data;

                if (posts && posts.length > 0) {
                    const latestPost = posts[0];
                    const shortcode = latestPost.code || latestPost.shortcode;

                    if (shortcode && shortcode !== lastPostShortcode) {
                        lastPostShortcode = shortcode;
                        const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
                        if (channel) {
                            const caption = latestPost.caption && latestPost.caption.text ? latestPost.caption.text : "Update baru!";
                            await channel.send(`${caption} - @${IG_USERNAME}\n🔗 https://www.instagram.com/p/${shortcode}/`);
                        }
                    }
                }
            } catch (err) {
                console.error('⚠️ Monitor Error:', err.message);
            }
        }, 600000); // Cek setiap 10 menit
    }
};