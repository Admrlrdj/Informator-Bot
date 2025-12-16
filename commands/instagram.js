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
        .setDescription('Cek postingan terakhir @infantryvokasi via instagram120'),

    async execute(interaction) {
        await interaction.deferReply({
            flags: [MessageFlags.Ephemeral]
        });

        try {
            const options = {
                method: 'GET',
                url: 'https://instagram120.p.rapidapi.com/user/posts',
                params: {
                    username: IG_USERNAME
                },
                headers: {
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                    'x-rapidapi-host': 'instagram120.p.rapidapi.com'
                }
            };

            const response = await axios.request(options);
            // Struktur instagram120 biasanya mengembalikan array langsung atau di dalam objek 'edges'
            const posts = response.data.edges || response.data;

            if (posts && posts.length > 0) {
                const latestPost = posts[0].node || posts[0];

                // Cara aman tanpa operator ?. untuk menghindari auto-space error
                let caption = "Update baru!";
                if (latestPost.edge_media_to_caption &&
                    latestPost.edge_media_to_caption.edges &&
                    latestPost.edge_media_to_caption.edges.length > 0) {
                    caption = latestPost.edge_media_to_caption.edges[0].node.text;
                }

                const shortcode = latestPost.shortcode || latestPost.code;
                const postUrl = `https://www.instagram.com/p/${shortcode}/`;

                await interaction.channel.send(`${caption} - @${IG_USERNAME}\n🔗 ${postUrl}`);
                await interaction.editReply('✅ Berhasil mengambil data dari RapidAPI instagram120!');
            } else {
                await interaction.editReply('❌ Tidak ada postingan ditemukan.');
            }
        } catch (error) {
            console.error('RapidAPI Error:', error.message);
            await interaction.editReply(`❌ Gagal: ${error.message}`);
        }
    },

    init: (client) => {
        console.log(`📸 Monitor Instagram via RapidAPI (instagram120) aktif...`);
        setInterval(async () => {
            try {
                const options = {
                    method: 'GET',
                    url: 'https://instagram120.p.rapidapi.com/user/posts',
                    params: {
                        username: IG_USERNAME
                    },
                    headers: {
                        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                        'x-rapidapi-host': 'instagram120.p.rapidapi.com'
                    }
                };

                const response = await axios.request(options);
                const posts = response.data.edges || response.data;

                if (posts && posts.length > 0) {
                    const latestPost = posts[0].node || posts[0];
                    const shortcode = latestPost.shortcode || latestPost.code;

                    if (shortcode && shortcode !== lastPostShortcode) {
                        lastPostShortcode = shortcode;
                        const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
                        if (channel) {
                            let caption = "Update baru!";
                            if (latestPost.edge_media_to_caption &&
                                latestPost.edge_media_to_caption.edges &&
                                latestPost.edge_media_to_caption.edges.length > 0) {
                                caption = latestPost.edge_media_to_caption.edges[0].node.text;
                            }
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