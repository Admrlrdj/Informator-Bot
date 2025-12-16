const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');
const ig = require('instagram-scraping');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ig-info')
        .setDescription('Cek postingan terbaru dari Instagram Infantry Vokasi'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const username = 'infantryvokasi';
            const data = await ig.scrapeUserPage(username);

            if (!data.medias || data.medias.length === 0) {
                return interaction.editReply('❌ Tidak ada postingan ditemukan.');
            }

            const latestPost = data.medias[0];
            const embed = new EmbedBuilder()
                .setColor('#E1306C')
                .setTitle(`Postingan Terbaru @${username}`)
                .setURL(`https://www.instagram.com/p/${latestPost.shortcode}/`)
                .setDescription(latestPost.text || 'Tidak ada caption.')
                .setImage(latestPost.display_url)
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed]
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Gagal mengambil data Instagram. Pastikan akun tidak privat.');
        }
    }
};