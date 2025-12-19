import {
    SlashCommandBuilder,
    EmbedBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('version')
        .setDescription('Menampilkan versi build bot'),

    async execute(interaction) {
        const readyDate = interaction.client.readyAt

        const tanggal = readyDate.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })

        const waktu = readyDate.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/:/g, '.')

        const yearShort = readyDate.getFullYear().toString().slice(-2)
        const month = (readyDate.getMonth() + 1).toString().padStart(2, '0')
        const day = readyDate.getDate().toString().padStart(2, '0')
        const hours = readyDate.getHours().toString().padStart(2, '0')
        const minutes = readyDate.getMinutes().toString().padStart(2, '0')

        const buildVersion = `v${yearShort}.${month}.${day}.${hours}${minutes}`

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🤖 Informasi Versi Informator')
            .addFields({
                name: 'Versi Build',
                value: `\`${buildVersion}\``,
                inline: true
            }, {
                name: 'Aktif Sejak',
                value: `${tanggal}, ${waktu}`,
                inline: true
            }, {
                name: 'Status',
                value: '🟢 Operational',
                inline: false
            })
            .setFooter({
                text: `Informator Bot • ${interaction.client.user.tag}`
            })

        await interaction.reply({
            embeds: [embed]
        })
    },
}