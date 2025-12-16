require('dotenv').config();

const {
    Client,
    Collection,
    GatewayIntentBits,
    Events
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const ig = require('instagram-scraping');

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
    } else {
        console.log(`[WARNING] Command di ${filePath} tidak punya "data" atau "execute".`);
    }
}

let lastPostShortcode = '';

client.once(Events.ClientReady, async c => {
    console.log(`✅ Bot login sebagai ${c.user.tag}`);

    const ownerId = process.env.OWNER_ID;
    try {
        const user = await client.users.fetch(ownerId);
        const waktu = new Date().toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta'
        });
        await user.send(`✅ Bot *${c.user.tag}* berhasil dideploy pada ${waktu}.`);
        console.log('📬 Notifikasi DM berhasil dikirim ke owner.');
    } catch (err) {
        console.error('❌ Gagal kirim DM ke owner:', err);
    }

    const IG_USERNAME = 'infantryvokasi';
    const DISCORD_CHANNEL_ID = 'ID_CHANNEL_NOTIFIKASI_ANDA';

    setInterval(async () => {
        try {
            const data = await ig.scrapeUserPage(IG_USERNAME);
            const latestPost = data.medias[0];

            if (latestPost && latestPost.shortcode !== lastPostShortcode) {
                lastPostShortcode = latestPost.shortcode;

                const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
                if (channel) {
                    const caption = latestPost.text || "Update baru!";

                    await channel.send(`${caption} -${IG_USERNAME}\n🔗 https://www.instagram.com/p/${latestPost.shortcode}/`);
                }
            }
        } catch (err) {
            console.error('⚠️ Gagal mengecek Instagram:', err.message);
        }
    }, 300000); // Cek setiap 5 menit
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`❌ Command ${interaction.commandName} tidak ditemukan.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`⚠️ Gagal menjalankan command ${interaction.commandName}:`, error);
        await interaction.reply({
            content: '❌ Terjadi kesalahan saat menjalankan perintah ini.',
            ephemeral: true
        });
    }
});

client.login(process.env.TOKEN);