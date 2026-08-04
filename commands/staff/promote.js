const discord = require('discord.js');
const { emojis } = require('#utils/assets');
const fs = require('fs');

module.exports = {
    type: "sub",
    name: "infract",
    data: new discord.SlashCommandSubcommandBuilder()
        .setName("promote")
        .setDescription("Promote a staff member")
        .addUserOption(option => option.setName("user").setDescription("User to infract").setRequired(true))
        .addRoleOption(option => option.setName("new").setDescription("New rank").setRequired(true))
        .addRoleOption(option => option.setName("old").setDescription("Old rank").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("Reason for the infraction").setRequired(true)),
    permissions: [discord.PermissionsBitField.Flags.Administrator, discord.PermissionsBitField.Flags.ManageGuild, discord.PermissionsBitField.Flags.ModerateMembers],
    async execute(interaction) {
        const raw = fs.readFileSync("./data/config.json");
        const data = JSON.parse(raw);

        const user = interaction.options.getUser("user");
        const newRank = interaction.options.getRole("new");
        const oldRank = interaction.options.getRole("old");
        const reason = interaction.options.getString("reason");

        if (!user || !newRank || !oldRank || !reason) {
            return await interaction.editReply({
                content: `> ${emojis.error} Missing required argument of user, type or reason.`
            });
        }

        const embed = new discord.EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setTitle("Infraction")
            .setDescription(`Please congratulate this staff member for receiving a promotion.\n> **User:** ${user}.\n> **Change:** ${oldRank.name} - ${newRank.name}\n> **Reason:** ${reason}`);

        await interaction.channel.send({
            content: `> <@${user.id}>`,
            embeds: [embed]
        });

        return await interaction.editReply({
            content: `> ${emojis.success} Successfully promoted member.\n_ _\n> **Remember to remove and apply the correct roles.**`
        });
    } 
}