const discord = require('discord.js');
const { emojis } = require('#utils/assets');


module.exports = {
    type: "sub",
    name: "vote",
    data: new discord.SlashCommandSubcommandBuilder()
        .setName("vote")
        .setDescription("Start a session vote"),
    permissions: [discord.PermissionsBitField.Flags.Administrator, discord.PermissionsBitField.Flags.ManageGuild],
    async execute(interaction) {
        return await interaction.editReply({
            content: `> ${emojis.loading} This command is still in the works.`,
            flags: discord.MessageFlags.Ephemeral
        });
    } 
}