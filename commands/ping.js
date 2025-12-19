import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder().setName('ping').setDescription('Cek respon jaringan bot'),

    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Loading...', fetchReply: true })
        const ping = sent.createdTimestamp - interaction.createdTimestamp
        await interaction.editReply(`📶 ${ping}ms jaringan`)
    },
}
