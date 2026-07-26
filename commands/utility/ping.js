const discord = require('discord.js');
const fs = require('fs');


module.exports = {
    name: 'ping',
    description: 'Bot ping',
    type: 'prefix',
    async execute(client, message, args) {
        const start = Date.now();
        const msg = await message.reply({ content: `Calculating...` });
        const latency = Date.now() - start;
        try {
            await message.delete();
            await msg.edit({ content: `> **Latency:** ${latency} ms.\n> **Websocket Latency:** ${Math.round(client.ws.ping) === -1 ? "still connecting." : `${Math.round(client.ws.ping)} ms.`}`, flags: discord.MessageFlags.Ephemeral });
        } catch {}
    }
};