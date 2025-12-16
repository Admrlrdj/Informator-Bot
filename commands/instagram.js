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

            // PENYESUAIAN DISINI: Sesuai JSON anda, data ada di result.edges
            const posts = response.data.result && response.data.result.edges ? response.data.result.edges : [];

            if (posts.length > 0) {
                // node berisi data postingan
                const latestPost = posts[0].node;

                // Mengambil caption dari struktur node.caption.text
                const caption = latestPost.caption && latestPost.caption.text ?
                    latestPost.caption.text :
                    "Update baru!";

                // Mengambil shortcode/code
                const shortcode = latestPost.code;
                const postUrl = `https://www.instagram.com/p/${shortcode}/`;

                await interaction.channel.send(`${caption}\n\n🔗 ${postUrl}`);
                await interaction.editReply('✅ Berhasil mengambil data dari RapidAPI!');
            } else {
                await interaction.editReply('❌ Tidak ada postingan ditemukan dalam array result.edges.');
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
                            const caption = latestPost.caption && latestPost.caption.text ? latestPost.caption.text : "Update baru!";
                            await channel.send(`${caption}\n\n🔗 https://www.instagram.com/p/${shortcode}/`);
                        }
                    }
                }
            } catch (err) {
                console.error('⚠️ Monitor Error:', err.message);
            }
        }, 600000); // Cek setiap 10 menit
    }
};