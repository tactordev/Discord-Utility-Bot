const discord = require('discord.js');
const { emojis } = require('#utils/assets');
const fs = require('fs');

module.exports = {
    type: "sub",
    name: "infract",
    data: new discord.SlashCommandSubcommandBuilder()
        .setName("infract")
        .setDescription("Infract a staff member")
        .addUserOption(option => option.setName("user").setDescription("User to infract").setRequired(true))
        .addStringOption(option => option.setName("type").setDescription("Type of infraction").setRequired(true).setChoices(
            { name: "Verbal Warning", value: "verbal" },
            { name: "Warning", value: "warning" },
            { name: "Strike", value: "strike" },
            { name: "Suspension", value: "suspension" },
            { name: "Termination", value: "termination" }
        ))
        .addStringOption(option => option.setName("reason").setDescription("Reason for the infraction").setRequired(true)),
    permissions: [discord.PermissionsBitField.Flags.Administrator, discord.PermissionsBitField.Flags.ManageGuild, discord.PermissionsBitField.Flags.ModerateMembers],
    async execute(interaction) {
        const raw = fs.readFileSync("./data/config.json");
        const data = JSON.parse(raw);

        const user = interaction.options.getUser("user");
        const type = interaction.options.getString("type");
        const reason = interaction.options.getString("reason");

        if (!user || !type || !reason) {
            return await interaction.editReply({
                content: `> ${emojis.error} Missing required argument of user, type or reason.`
            });
        }

        const pType = type === "verbal" ? "Verbal Warning" : verbal === "warning" ? "Warning" : type === "strike" ? "Strike" : type === "suspension" ? "Suspension" : "Termination";
        const embed = new discord.EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setTitle("Infraction")
            .setDescription(`An infraction has been issued to a Staff Member.\n> **User:** ${user}.\n> **Type:** ${pType}\n> **Reason:** ${reason}`);

        await interaction.channel.send({
            content: `> <@${user.id}>`,
            embeds: [embed]
        });

        return await interaction.editReply({
            content: `> ${emojis.success} Successfully infracted member.\n_ _\n> **Remember to apply the correct roles.**`
        });
    } 
}