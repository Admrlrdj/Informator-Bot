require('dotenv').config();
const {
    Client,
    Collection,
    GatewayIntentBits,
    Events
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

client.once(Events.ClientReady, async c => {
    console.log(`✅ Bot login sebagai ${c.user.tag}`);

    const igNotifier = require('./commands/instagram.js');
    igNotifier.init(client);

    const ownerId = process.env.OWNER_ID;
    try {
        const user = await client.users.fetch(ownerId);
        const waktu = new Date().toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta'
        });
        await user.send(`✅ Bot *${c.user.tag}* berhasil aktif pada ${waktu}.`);
    } catch (err) {
        console.error('❌ Gagal kirim DM ke owner');
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: '❌ Error saat menjalankan command.',
            ephemeral: true
        });
    }
});

client.login(process.env.TOKEN);