const {
    Events
} = require('discord.js');

const toxicWords = [
    'anjing', 'babi', 'tolol', 'goblok', 'kontol',
    'memek', 'ajg', 'pantek', 'bangsat', 'bajingan',
    'brengsek', 'tai', 'jancok', 'kampret', 'ancok',
    'bego', 'bajingan', 'bacot', 'brengsek', 'ajg',
    'pepek', 'kntl', 'puqi', 'puki', 'pukimak'];

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const isToxic = toxicWords.some(word =>
            message.content.toLowerCase().includes(word.toLowerCase())
        );

        if (isToxic) {
            try {
                await message.reply('bahasa bahasa cuy');
                console.log(`⚠️ Sensor aktif: Menegur ${message.author.tag} karena kata toxic.`);
            } catch (err) {
                console.error('❌ Gagal mengirim balasan sensor:', err);
            }
        }
    },
};