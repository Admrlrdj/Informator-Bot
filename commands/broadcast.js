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
        // Cek izin Administrator
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Kamu tidak punya izin untuk menggunakan command ini.',
                ephemeral: true
            });
        }

        const channelId = interaction.options.getString('channel_id');
        const message = interaction.options.getString('message');

        // Mengambil username pengirim (hanya nama, tanpa tag angka jika memungkinkan)
        const sender = interaction.user.username;

        try {
            const channel = await interaction.client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased()) {
                return interaction.reply({
                    content: '❌ Channel tidak ditemukan atau bukan channel teks.',
                    ephemeral: true
                });
            }

            // Tampilan baru: [Pesan] -[Nama]
            // Contoh: test -radja
            await channel.send(`${message} -${sender}`);

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