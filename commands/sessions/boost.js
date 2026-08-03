const discord = require('discord.js');
const { emojis } = require('#utils/assets');


module.exports = {
    type: "sub",
    name: "boost",
    data: new discord.SlashCommandSubcommandBuilder()
        .setName("boost")
        .setDescription("Request people to join in-game"),
    permissions: [discord.PermissionsBitField.Flags.Administrator, discord.PermissionsBitField.Flags.ManageGuild],
    async execute(interaction) {
        return await interaction.editReply({
            content: `> ${emojis.loading} This command is still in the works.`,
            flags: discord.MessageFlags.Ephemeral
        });
    } 
}