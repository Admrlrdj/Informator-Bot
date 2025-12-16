const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');
const {
    InstagramScraper
} = require('@aduptive/instagram-scraper');

const scraper = new InstagramScraper();
let lastPostShortcode = '';
const IG_USERNAME = 'infantryvokasi';
const DISCORD_CHANNEL_ID = '1449389549842202778';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-ig')
        .setDescription('Cek postingan terakhir @infantryvokasi secara instan'),

    async execute(interaction) {
        await interaction.deferReply({
            flags: [MessageFlags.Ephemeral]
        });

        try {
            // Mengambil 1 postingan terakhir
            const results = await scraper.getPosts(IG_USERNAME, 1);

            if (results.success && results.posts.length > 0) {
                const latestPost = results.posts[0];
                const caption = latestPost.caption || "Update baru!";
                // URL Instagram menggunakan shortcode
                const postUrl = `https://www.instagram.com/p/${latestPost.shortCode}/`;

                await interaction.channel.send(`${caption} - @${IG_USERNAME}\n🔗 ${postUrl}`);
                await interaction.editReply('✅ Notif test berhasil dikirim!');
            } else {
                await interaction.editReply(`❌ Gagal: ${results.error || 'Tidak ada postingan ditemukan.'}`);
            }
        } catch (err) {
            console.error('Test IG Error:', err.message);
            await interaction.editReply(`❌ Terjadi kesalahan: ${err.message}`);
        }
    },

    init: (client) => {
        console.log(`📸 Monitor Instagram (@${IG_USERNAME}) menggunakan @aduptive/instagram-scraper aktif...`);

        setInterval(async () => {
            try {
                const results = await scraper.getPosts(IG_USERNAME, 1);

                if (!results.success || results.posts.length === 0) return;

                const latestPost = results.posts[0];

                // Cek apakah postingan ini baru berdasarkan shortCode
                if (latestPost.shortCode !== lastPostShortcode) {
                    lastPostShortcode = latestPost.shortCode;

                    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
                    if (channel) {
                        const caption = latestPost.caption || "Update baru!";
                        const postUrl = `https://www.instagram.com/p/${latestPost.shortCode}/`;
                        await channel.send(`${caption} - @${IG_USERNAME}\n🔗 ${postUrl}`);
                    }
                }
            } catch (err) {
                console.error('⚠️ IG Monitor Error:', err.message);
            }
        }, 300000); // Cek setiap 5 menit
    }
};