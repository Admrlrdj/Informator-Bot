import {
    SlashCommandBuilder
} from 'discord.js'
import {
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState
} from '@discordjs/voice'

export default {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Masuk ke Voice Channel (Auto Mute/Deaf + Auto Leave 10m)'),

    async execute(interaction) {
        // Cek apakah user ada di voice channel
        const channel = interaction.member.voice.channel
        if (!channel) {
            return interaction.reply({
                content: '❌ Lu harus masuk Voice Channel dulu bang!',
                ephemeral: true
            })
        }

        // Defer reply karena proses connect mungkin butuh waktu
        await interaction.deferReply()

        try {
            // Logic Join Voice
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            })

            // Set Bot jadi Mute dan Deafen di server
            try {
                await interaction.guild.members.me.voice.setDeaf(true)
                await interaction.guild.members.me.voice.setMute(true)
            } catch (err) {
                console.warn('⚠️ Gagal set mute/deaf (mungkin kurang permission):', err)
            }

            // Logic Timer 10 Menit
            const startLeaveTimer = () => {
                return setTimeout(() => {
                    if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
                        connection.destroy()
                        interaction.client.voiceTimers.delete(interaction.guild.id)
                        console.log(`👋 Auto-leave dari ${interaction.guild.name} karena timeout.`)
                    }
                }, 10 * 60 * 1000) // 10 menit
            }

            // Reset timer jika sudah ada sebelumnya
            if (interaction.client.voiceTimers.has(interaction.guild.id)) {
                clearTimeout(interaction.client.voiceTimers.get(interaction.guild.id))
            }

            // Simpan timer ke collection global client
            interaction.client.voiceTimers.set(interaction.guild.id, startLeaveTimer())

            // Handler jika bot diputus paksa atau disconnect
            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ])
                    // Koneksi pulih, biarkan timer berjalan
                } catch (error) {
                    // Benar-benar disconnect, hapus timer
                    connection.destroy()
                    if (interaction.client.voiceTimers.has(interaction.guild.id)) {
                        clearTimeout(interaction.client.voiceTimers.get(interaction.guild.id))
                        interaction.client.voiceTimers.delete(interaction.guild.id)
                    }
                }
            })

            await interaction.editReply(`✅ Berhasil join **<#${channel.id}>**.\n🔇 **Mute & Deafen: ON**\n⏱️ **Auto-leave:** 10 menit (Tag bot buat reset timer).`)

        } catch (error) {
            console.error(error)
            await interaction.editReply('❌ Gagal join voice channel.')
        }
    },
}