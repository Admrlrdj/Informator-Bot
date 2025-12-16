const {
    SlashCommandBuilder
} = require('discord.js');
const ig = require('instagram-scraping');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-ig')
        .setDescription('Testing manual notifikasi Instagram'),

    async execute(interaction) {
        await interaction.deferReply({
            ephemeral: true
        });

        const IG_USERNAME = 'infantryvokasi';

        try {
            const data = await ig.scrapeUserPage(IG_USERNAME);
            const latestPost = data.medias[0];

            if (latestPost) {
                const caption = latestPost.text || "Update baru!";
                // Mengirim hasil ke channel tempat command diketik
                await interaction.channel.send(`${caption} -${IG_USERNAME}\n🔗 https://www.instagram.com/p/${latestPost.shortcode}/`);

                await interaction.editReply({
                    content: '✅ Test berhasil dikirim ke channel ini.'
                });
            } else {
                await interaction.editReply({
                    content: '❌ Tidak ada postingan ditemukan.'
                });
            }
        } catch (err) {
            console.error(err);
            await interaction.editReply({
                content: `❌ Error: ${err.message}`
            });
        }
    },
};