const discord = require('discord.js');
const { emojis } = require('#utils/assets');
const fs = require('fs');
const readline = require('readline');
const { ClientRequest } = require('http');

module.exports = {
    name: "rename",
    type: "sub",
    data: new discord.SlashCommandSubcommandBuilder()
        .setName("rename")
        .setDescription("Rename a ticket")
        .addStringOption(
            option => option.setName("name").setDescription("New name for the ticket").setRequired(true)
        ),
    async execute(interaction) {
        const file = `./data/tickets.jsonl`;
        const readStream = fs.createReadStream(file);

        const rl = readline.Interface({
            input: readStream,
            crlfDelay: Infinity
        });

        let ticket = false;
        for await (const line of rl) {
            if (!line.trim()) continue;

            const tick = JSON.parse(line);
            if (tick.channel === interaction.channel.id) {
                ticket = true;
            }
        }

        try {
            if (ticket) {
                await interaction.channel.edit({ name: interaction.options.getString("name") });
            } else {
                return await interaction.editReply({
                    content: `> ${emojis.error} This is not a ticket.`,
                });
            }
        } catch (err) {}

        return await interaction.editReply({
            content: `> ${emojis.success} Renamed ticket successfully.`,
        });
    }
}