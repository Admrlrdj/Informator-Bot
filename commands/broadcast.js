const {
    SlashCommandBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('broadcast')
        .setDescription('Kirim pesan ke channel tertentu')
        .addStringOption(option =>
            option.setName('channel_id')
            .setDescription('ID channel tujuan')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
            .setDescription('Pesan yang akan dikirim')
            .setRequired(true)),

    async execute(interaction) {
        // Pastikan hanya admin atau owner yang bisa pakai
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Kamu tidak punya izin untuk menggunakan command ini.',
                ephemeral: true
            });
        }

        const channelId = interaction.options.getString('channel_id');
        const message = interaction.options.getString('message');

        try {
            const channel = await interaction.client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased()) {
                return interaction.reply({
                    content: '❌ Channel tidak ditemukan atau bukan channel teks.',
                    ephemeral: true
                });
            }

            await channel.send(message);
            await interaction.reply({
                content: `✅ Pesan berhasil dikirim ke <#${channelId}>`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Broadcast error:', error);
            await interaction.reply({
                content: '❌ Terjadi kesalahan saat mengirim pesan.',
                ephemeral: true
            });
        }
    }
};