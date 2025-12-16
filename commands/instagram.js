const ig = require('instagram-scraping');

let lastPostShortcode = '';
const IG_USERNAME = 'infantryvokasi';
const DISCORD_CHANNEL_ID = '1449389549842202778';

module.exports = {
    init: (client) => {
        console.log(`📸 Monitor Instagram untuk @${IG_USERNAME} aktif...`);

        setInterval(async () => {
            try {
                const data = await ig.scrapeUserPage(IG_USERNAME);
                if (!data || !data.medias || data.medias.length === 0) return;

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
                console.error('⚠️ IG Monitor Error:', err.message);
            }
        }, 60000);
    }
};