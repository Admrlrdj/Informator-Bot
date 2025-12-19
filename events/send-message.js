import { Events } from 'discord.js'
import censoredWords from '../config/censored-words.js'

export default {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bots + non-guild messages (optional)
        if (message.author?.bot) return
        if (!message.inGuild?.() && !message.guild) return

        const content = (message.content ?? '').toLowerCase()
        if (!content) return

        const hit = censoredWords.some((w) => {
            const word = String(w).trim().toLowerCase()
            if (!word) return false
            // word-boundary match escape regex metacharacters
            const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            return new RegExp(`\\b${escaped}\\b`, 'i').test(content)
        })

        if (!hit) return

        // 1) Delete the offending message (no public reply)
        if (message.deletable) {
            await message.delete().catch(() => { })
        } else {
            // fallback attempt (may still fail without permissions)
            await message.delete().catch(() => { })
        }

        // 2) DM the user only (private warning)
        await message.author
            .send(
                'Warning: Your message was removed because it contained prohibited language. Please follow the server rules.'
            )
            .catch(() => { })

        return
    },
}
