import 'dotenv/config'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { Client, Collection, GatewayIntentBits, Events } from 'discord.js'

import wordSensor from './commands/word-sensor.js'
import igNotifier from './commands/instagram.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
})

client.commands = new Collection()

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

// const eventsPath = path.join(__dirname, 'events')
// if (fs.existsSync(eventsPath)) {
//     const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'))

//     for (const file of eventFiles) {
//         const filePath = path.join(eventsPath, file)
//         const mod = await import(pathToFileURL(filePath).href)
//         const event = mod?.default ?? mod

//         if (!event?.name || typeof event.execute !== 'function') {
//             console.warn(`[WARN] Invalid event module: ${file}`)
//             continue
//         }

//         if (event.once) {
//             client.once(event.name, (...args) => event.execute(...args))
//         } else {
//             client.on(event.name, (...args) => event.execute(...args))
//         }
//     }
// }

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
            ephemeral: true,
        }

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(payload)
        } else {
            await interaction.reply(payload)
        }
    }
})

/**
 * Word sensor (non-slash event)
 */
client.on(wordSensor.name, (...args) => wordSensor.execute(...args))

client.once(Events.ClientReady, async (c) => {
    console.log(`✅ Bot login sebagai ${c.user.tag}`)

    // Instagram notifier (optional)
    if (igNotifier && typeof igNotifier.init === 'function') {
        igNotifier.init(client)
    }

    const ownerId = process.env.OWNER_ID
    const readyAt = c.readyAt

    const waktuDM = readyAt.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })

    try {
        if (ownerId) {
            const user = await client.users.fetch(ownerId)
            await user.send(`✅ Bot **${c.user.tag}** berhasil aktif pada ${waktuDM}.`)
        }
    } catch (err) {
        console.error('❌ Gagal kirim DM ke owner')
    }
})

client.login(process.env.DISCORD_BOT_TOKEN)
