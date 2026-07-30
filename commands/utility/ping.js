const discord = require('discord.js');
const fs = require('fs');


module.exports = {
    name: 'ping',
    description: 'Bot ping',
    type: 'prefix',
    permissions: [discord.PermissionsBitField.Flags.SendMessages],
    async execute(client, message, initialResponse, args) {
        const start = Date.now();
        const latency = Date.now() - start;
        try {
            await message.delete();
            await initialResponse.edit({ content: `> **Latency:** ${latency} ms.\n> **Websocket Latency:** ${Math.round(client.ws.ping) === -1 ? "still connecting." : `${Math.round(client.ws.ping)} ms.`}`, flags: discord.MessageFlags.Ephemeral });
        } catch {}
    }
};