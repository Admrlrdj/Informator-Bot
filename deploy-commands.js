import 'dotenv/config'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { REST, Routes } from 'discord.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const commands = []
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)

    const mod = await import(pathToFileURL(filePath).href)
    const command = mod?.default ?? mod

    if (command && 'data' in command && 'execute' in command) {
        commands.push(command.data.toJSON())
    }
}

const rest = new REST().setToken(process.env.TOKEN)
const APPLICATION_ID = process.env.APPLICATION_ID
const SERVER_ID = process.env.SERVER_ID

    (async () => {
        try {
            console.log('🚀 Men-deploy command ke server Infantruy Vokasuy...')
            await rest.put(Routes.applicationGuildCommands(APPLICATION_ID, SERVER_ID), {
                body: commands,
            })
            console.log('✅ Command berhasil didaftarkan ke Infantruy Vokasuy!')
        } catch (error) {
            console.error('❌ Error saat deploy:', error)
        }
    })()
