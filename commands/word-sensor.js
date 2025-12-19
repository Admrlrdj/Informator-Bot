import { Events } from 'discord.js'
import toxicWords from '../dataset/toxic-words.json'

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return

        const isToxic = toxicWords.some((word) =>
            message.content.toLowerCase().includes(word.toLowerCase())
        )

        if (isToxic) {
            try {
                await message.reply('bahasa bahasa cuy')
                console.log(`⚠️ Sensor aktif: Menegur ${message.author.tag} karena kata toxic.`)
            } catch (err) {
                console.error('❌ Gagal mengirim balasan sensor:', err)
            }
        }
    },
}
