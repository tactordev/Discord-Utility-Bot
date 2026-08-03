const discord = require('discord.js');
const { emojis } = require('#utils/assets');
const { getModerationById, deleteModeration, editModeration } = require('#utils/moderation');
const { extractTime } = require("#utils/parsing");

module.exports = {
    type: "sub",
    name: "manage",
    data: new discord.SlashCommandSubcommandBuilder()
        .setName("manage")
        .setDescription("Manage a moderation.")
        .addStringOption(option => option.setName("id").setDescription("The moderation Id").setRequired(true))
        .addStringOption(option => option.setName("action").setDescription("Action to perform on moderation").addChoices(
            { name: "View", value: "view"},
            { name: "Edit", value: "edit"},
            { name: "Delete", value: "delete"}
        ).setRequired(true)),
    noAutoResponse: true,
    permissions: [discord.PermissionsBitField.Flags.Administrator, discord.PermissionsBitField.Flags.ModerateMembers],
    async execute(interaction) {
        const id = interaction.options.getString("id");

        if (!id) {
            return await interaction.reply({
                content: `> ${emojis.error} No moderation Id found.`
            });
        }

        const moderation = await getModerationById(interaction.guild.id, id);

        if (!moderation) {
            return await interaction.reply({
                content: `> ${emojis.error} No moderation found with the Id provided.`
            });
        }


        const action = interaction.options.getString("action");
        
        if (!action) {
            return await interaction.reply({
                content: `> ${emojis.error} No action provided.`
            });
        }

        const embed = new discord.EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setTitle("View Moderation")
            .setFooter({ text: `Moderation ${moderation.timestamp}`})
            .setDescription(`> **Type:** ${moderation.type}\n> **Agent:** <@${moderation.agent}>\n> **Victim:** <@${moderation.victim}>\n> **Duration:** ${!moderation.duration ? "indefinite" : moderation.duration}\n> **Reason:** ${moderation.reason}`)

        switch (action) {
            case "view":
                return await interaction.reply({
                    content: null,
                    embeds: [ embed ],
                    flags: discord.MessageFlags.Ephemeral
                });
            
            case "edit":
                const modal = new discord.ModalBuilder()
                    .setCustomId(`modal:manage:edit-${moderation.timestamp}`)
                    .setTitle(`Edit Moderation`);


                const typeSelect = new discord.StringSelectMenuBuilder()
                    .setCustomId(`ignore:change-type`)
                    .setPlaceholder(`Select a type`)
                    .setRequired(true)
                    .addOptions(
                        new discord.StringSelectMenuOptionBuilder()
                            .setLabel(`Ban`)
                            .setValue(`ban`)
                            .setDefault("ban" === moderation.type.toLowerCase()),
                        new discord.StringSelectMenuOptionBuilder()
                            .setLabel(`Kick`)
                            .setValue(`kick`)
                            .setDefault("kick" === moderation.type.toLowerCase()),
                        new discord.StringSelectMenuOptionBuilder()
                            .setLabel(`Timeout`)
                            .setValue(`timeout`)
                            .setDefault("timeout" === moderation.type.toLowerCase()),
                        new discord.StringSelectMenuOptionBuilder()
                            .setLabel(`Warn`)
                            .setValue(`warn`)
                            .setDefault("warning" === moderation.type.toLowerCase())
                    )
                const typeLabel = new discord.LabelBuilder()
                    .setLabel('Type')
                    .setStringSelectMenuComponent(typeSelect);
                
                const durationInput = new discord.TextInputBuilder()
                    .setCustomId(`ignore:change-duration`)
                    .setPlaceholder(`Enter duration.`)
                    .setRequired(true)
                    .setStyle(discord.TextInputStyle.Short)
                    .setValue(moderation.duration ?? "Indefinite");

                const durationLabel = new discord.LabelBuilder()
                    .setLabel('Duration')
                    .setTextInputComponent(durationInput);

                const reasonInput = new discord.TextInputBuilder()
                    .setCustomId(`ignore:change-reason`)
                    .setPlaceholder(`Enter a reason for this moderation.`)
                    .setRequired(true)
                    .setStyle(discord.TextInputStyle.Paragraph)
                    .setValue(moderation.reason);

                const reasonLabel = new discord.LabelBuilder()
                    .setLabel('Reason')
                    .setTextInputComponent(reasonInput);
                    
                modal.addComponents(
                    typeLabel,
                    durationLabel,
                    reasonLabel
                );

                return await interaction.showModal(modal);


            case "delete":
                return await interaction.reply({
                    content: null,
                    embeds: [ embed ],
                    components: [
                        new discord.ActionRowBuilder().addComponents(
                            new discord.ButtonBuilder()
                                .setCustomId(`button:manage:delete-${moderation.timestamp}`)
                                .setLabel("Confirm Deletion")
                                .setStyle(discord.ButtonStyle.Danger)
                        )
                    ],
                    flags: discord.MessageFlags.Ephemeral
                });
        }

    },

    interactions: {
        "button:manage:delete": async (interaction, options) => {
            const initialResponse = await interaction.reply({
                content: `> ${emojis.loading} Deleting moderation...`,
                flags: discord.MessageFlags.Ephemeral
            });

            const id = options[0];
            await deleteModeration(interaction.guild.id, id);

            await interaction.message.delete().catch(() => {});

            return await interaction.editReply({
                content: `> ${emojis.success} Moderation deleted succesfully.`,
                embeds: [],
                components: []
            });   
        },
        "modal:manage:edit": async (interaction, options) => {
            const initialResponse = await interaction.reply({
                content: `> ${emojis.loading} Editing moderation...`,
                flags: discord.MessageFlags.Ephemeral
            });
            
            const id = options[0];
            
            const typeField = interaction.fields.getField("ignore:change-type");
            const type = typeField.values ? typeField.values[0] : typeField.value;

            const duration = interaction.fields.getTextInputValue("ignore:change-duration");
            const reason = interaction.fields.getTextInputValue("ignore:change-reason");


            const parsedDuration = duration === "Indefinite" ? null : extractTime(duration).rawDuration;

            await editModeration(interaction.guild.id, id, type, parsedDuration, reason);

            return await interaction.editReply({
                content: `> ${emojis.success} Moderation edited succesfully.`,
                embeds: [],
                components: []
            });
        }
    }
}