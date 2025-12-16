const {
    SlashCommandBuilder,
    MessageFlags
} = require('discord.js');
const ig = require('instagram-scraping');

let lastPostShortcode = '';
const IG_USERNAME = 'infantryvokasi'; // ig
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
            const data = await ig.scrapeUserPage(IG_USERNAME);
            const latestPost = data.medias ? data.medias[0] : null;

            if (latestPost) {
                const caption = latestPost.text || "Update baru!";
                await interaction.channel.send(`${caption} -${IG_USERNAME}\n🔗 https://www.instagram.com/p/${latestPost.shortcode}/`);

                await interaction.editReply('✅ Notif test berhasil dikirim!');
            } else {
                await interaction.editReply('❌ Tidak ada postingan ditemukan.');
            }
        } catch (err) {
            console.error('Test IG Error:', err.message);
            if (interaction.deferred) {
                await interaction.editReply(`❌ Gagal: ${err.message}`);
            }
        }
    },

    init: (client) => {
        console.log(`📸 Monitor Instagram untuk @${IG_USERNAME} aktif...`);
        setInterval(async () => {
            try {
                const data = await ig.scrapeUserPage(IG_USERNAME);
                if (!data || !data.medias || data.medias.length === 0) return;

                const latestPost = data.medias[0];
                if (latestPost && latestPost.shortcode !== lastPostShortcode) {
                    lastPostShortcode = latestPost.shortcode;
                    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
                    if (channel) {
                        const caption = latestPost.text || "Update baru!";
                        await channel.send(`${caption} -${IG_USERNAME}\n🔗 https://www.instagram.com/p/${latestPost.shortcode}/`);
                    }
                }
            } catch (err) {
                console.error('⚠️ IG Monitor Error:', err.message);
            }
        }, 300000); // 5 Menit
    }
};