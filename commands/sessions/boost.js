const discord = require('discord.js');
const { emojis } = require('#utils/assets');
const fs = require('fs');

module.exports = {
    type: "sub",
    name: "boost",
    data: new discord.SlashCommandSubcommandBuilder()
        .setName("boost")
        .setDescription("Request more staff to join"),
    permissions: [discord.PermissionsBitField.Flags.Administrator, discord.PermissionsBitField.Flags.ManageGuild],
    async execute(interaction) {
        const raw = fs.readFileSync("./data/config.json");
        const data = JSON.parse(raw);

        try {
            await interaction.channel.send({
                ...data.sessionEmbeds.boost
            });
            await interaction.editReply({
                content: `> ${emojis.success} Send the embed successfully.`
            });
            return;
        } catch (err) {
            return await interaction.editReply({
                content: `> ${emojis.error} Invalid embed set. Change it using /utility help.`
            });
        }
    } 
}