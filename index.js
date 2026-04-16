import 'dotenv/config'

import fs from 'node:fs'
import path from 'node:path'
import {
    fileURLToPath,
    pathToFileURL
} from 'node:url'

// [BARU] Import getVoiceConnection untuk cek status voice
import {
    getVoiceConnection
} from '@discordjs/voice'

import {
    Client,
    Collection,
    GatewayIntentBits,
    Events
} from 'discord.js'

import wordSensor from './commands/word-sensor.js'
import igNotifier from './commands/instagram.js'

const __filename = fileURLToPath(
    import.meta.url)
const __dirname = path.dirname(__filename)

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates // [PENTING] Tambah intent Voice States
    ],
})

client.commands = new Collection()
// [BARU] Koleksi untuk menyimpan timer auto-leave setiap server
client.voiceTimers = new Collection()

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const mod = await import(pathToFileURL(filePath).href)
    const command = mod?.default ?? mod

    if (command && 'data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command)
    }
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const command = client.commands.get(interaction.commandName)
    if (!command) return

    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(`⚠️ Gagal menjalankan command ${interaction.commandName}:`, error)
        const payload = {
            content: '❌ Terjadi kesalahan saat menjalankan perintah ini.',
            ephemeral: true
        }
        if (interaction.replied || interaction.deferred) await interaction.followUp(payload)
        else await interaction.reply(payload)
    }
})

// [UPDATE] Event listener: Tagging = Reset Timer (Silent) + Balas "kunaon?"
client.on(Events.MessageCreate, async (message) => {
    // Abaikan pesan dari bot
    if (message.author.bot) return

    // Cek apakah bot di-mention
    if (message.mentions.has(client.user)) {
        const guildId = message.guild.id

        // --- LOGIKA RESET TIMER (Background Process) ---
        // Kita jalankan ini diam-diam agar tidak nyepam chat
        const connection = getVoiceConnection(guildId)
        if (connection) {
            // Hapus timer lama
            if (client.voiceTimers.has(guildId)) {
                clearTimeout(client.voiceTimers.get(guildId))
            }

            // Pasang timer baru 10 menit
            const timeout = setTimeout(() => {
                connection.destroy()
                client.voiceTimers.delete(guildId)
            }, 10 * 60 * 1000) // 10 menit

            client.voiceTimers.set(guildId, timeout)

            // Info hanya masuk ke console log server (user tidak lihat)
            console.log(`⏱️ Timer voice di-reset via TAG oleh ${message.author.tag}`)
        }
        // -----------------------------------------------

        // Balasan Bot ke User (Selalu "kunaon?")
        await message.reply('kunaon?')
    }
})

/**
 * Word sensor (non-slash event)
 */
client.on(wordSensor.name, (...args) => wordSensor.execute(...args))

client.once(Events.ClientReady, async (c) => {
    console.log(`✅ Bot login sebagai ${c.user.tag}`)

    if (igNotifier && typeof igNotifier.init === 'function') {
        igNotifier.init(client)
    }

    // ... (kode DM owner dan lainnya tetap sama) ...
})

client.on(Events.GuildMemberAdd, async (member) => {
    // ... (kode auto role tetap sama) ...
    const ROLE_ID = '1449385749303656560'
    try {
        const role = member.guild.roles.cache.get(ROLE_ID)
        if (role) await member.roles.add(role)
    } catch (error) {
        console.error(`❌ Gagal memberikan role:`, error)
    }
})

client.login(process.env.TOKEN)