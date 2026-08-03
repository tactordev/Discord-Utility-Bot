const discord = require('discord.js');
const { emojis } = require('#utils/assets');
const fs = require('fs');

module.exports = {
    type: "sub",
    name: "setup",
    data: new discord.SlashCommandSubcommandBuilder()
        .setName("setup")
        .setDescription("Configure the bot"),
    permissions: [discord.PermissionsBitField.Flags.Administrator, discord.PermissionsBitField.Flags.ManageGuild],

    async execute(interaction) {
        
        const raw = fs.readFileSync("./data/config.json");
        try {
            JSON.parse(raw);
        } catch (error) {
            return await interaction.editReply({
                content: `> ${emojis.error} Invalid config.json file. Please reset it to the default.`,
            });
        }

        const data = JSON.parse(raw);

        const infoEmoji = { id: emojis.info.split("info:")[1].split(">")[0], name: "info" };
        const cogEmoji = { id: emojis.cog.split("cog:")[1].split(">")[0], name: "cog" };

        const container = new discord.ContainerBuilder()
            // title
            .addTextDisplayComponents(
                (textDisplay) => 
                    textDisplay.setContent(
                        `# Configuration\n> Work through the sections below to configure the bot.\n> To view the current config for a section, click the info button. To edit the current configuration, select the cog button.`
                    )
            )

            // role permissions for moderation
            .addSeparatorComponents((separator) => separator)
            .addSectionComponents((section) => 
                section
                    .addTextDisplayComponents(
                        (textDisplay) =>
                            textDisplay.setContent(
                                `## [Role Permissions] Moderation`
                            )
                    )
                    .setButtonAccessory((button) => 
                        button.setCustomId("setup:moderationpermissions:info").setEmoji(infoEmoji).setStyle(discord.ButtonStyle.Secondary)
                    )        
            )
            .addSectionComponents((section) =>
                section
                    .addTextDisplayComponents(
                        (textDisplay) =>
                            textDisplay.setContent(
                                `\n> This dictates who can use moderation commands. By default, commands follow discord's permission structure (e.g. Administrator, BanMembers).\n> **Commands:** ban, kick, timeout, warn.`
                            )
                    )
                    .setButtonAccessory((button) => 
                        button.setCustomId("setup:moderationpermissions:edit").setEmoji(cogEmoji).setStyle(discord.ButtonStyle.Secondary)
                    )        
            )
            

            // role permissions for sessions
            .addSeparatorComponents((separator) => separator)
            .addSectionComponents((section) =>
                section
                    .addTextDisplayComponents(
                        (textDisplay) =>
                            textDisplay.setContent(
                                `## [Role Permissions] Sessions`
                            )
                    )
                    .setButtonAccessory((button) =>
                        button.setCustomId("setup:sessionpermissions:info").setEmoji(infoEmoji).setStyle(discord.ButtonStyle.Secondary)
                    )
            )
            .addSectionComponents((section) =>
                section
                    .addTextDisplayComponents(
                        (textDisplay) =>
                            textDisplay.setContent(
                                `\n> This dictates who can use and manage sessions. By default, members with Administrator and ManageGuild can use this command.\n> **Commands:** sessions vote, sessions start, sessions end, sessions booster, sessions assistance.`
                            )
                    )
                    .setButtonAccessory((button) =>
                        button.setCustomId("setup:sessionpermissions:edit").setEmoji(cogEmoji).setStyle(discord.ButtonStyle.Secondary)
                )
            )

            // embeds for sessions
            .addSeparatorComponents((separator) => separator)
            .addSectionComponents((section) =>
                section
                    .addTextDisplayComponents(
                        (textDisplay) =>
                            textDisplay.setContent(
                                `## [Embeds] Sessions`
                            )
                    )
                    .setButtonAccessory((button) =>
                        button.setCustomId("setup:sessionembeds:info").setEmoji(infoEmoji).setStyle(discord.ButtonStyle.Secondary)
                )
            )
            .addSectionComponents((section) =>
                section
                    .addTextDisplayComponents(
                        (textDisplay) =>
                            textDisplay.setContent(
                                `> This allows you to customise the embeds used in the sessions for: start, end, vote, boost and assistance.\n> **To import a custom embed, please use discohook.app and export using the JSON editor.**`
                            )
                    )
                    .setButtonAccessory((button) => button.setCustomId("setup:sessionembeds:edit").setEmoji(cogEmoji).setStyle(discord.ButtonStyle.Secondary))
            )

            // tickets
            .addSeparatorComponents((separator) => separator)
            .addSectionComponents((section) =>
                section
                    .addTextDisplayComponents(
                        (textDisplay) =>
                            textDisplay.setContent(
                                `## [Configuration] Tickets`
                            )
                    )
                    .setButtonAccessory((button) =>
                        button.setCustomId("setup:tickets:info").setEmoji(infoEmoji).setStyle(discord.ButtonStyle.Secondary)
                )
            )
            .addSectionComponents((section) =>
                section
                    .addTextDisplayComponents(
                        (textDisplay) =>
                            textDisplay.setContent(
                                `> This allows you to add custom ticket types and priorities. This is a 3 step process: add/remove ticket types, set a support agent/management role, choose the hierarchy between types.`
                            )
                    )
                    .setButtonAccessory((button) => button.setCustomId("setup:tickets:edit").setEmoji(cogEmoji).setStyle(discord.ButtonStyle.Secondary))
            )

            // channels
            .addSeparatorComponents((separator) => separator)
            .addSectionComponents((section) =>
                section
                    .addTextDisplayComponents(
                        (textDisplay) =>
                            textDisplay.setContent(
                                `## [Configuration] General`
                            )
                    )
                    .setButtonAccessory((button) =>
                        button.setCustomId("setup:channels:info").setEmoji(infoEmoji).setStyle(discord.ButtonStyle.Secondary)
                )
            )
            .addSectionComponents((section) =>
                section
                    .addTextDisplayComponents(
                        (textDisplay) =>
                            textDisplay.setContent(
                                `> This allows you to specify which channels messages should be sent to. This includes the messages from promotions, infractions, ticket transcripts, other logs, etc.\n> You can also add bot managers here. These are people who can use the /utility setup command.`
                            )
                    )
                    .setButtonAccessory((button) => button.setCustomId("setup:channels:edit").setEmoji(cogEmoji).setStyle(discord.ButtonStyle.Secondary))
            )





        return await interaction.editReply({
            content: null,
            components: [container],
            flags: discord.MessageFlags.IsComponentsV2
        });
    },
    interactions: {
        "setup:moderationpermissions:info": async (interaction, options) => {
            await interaction.reply({
                content: `> ${emojis.loading}`,
                flags: discord.MessageFlags.Ephemeral
            });

            const raw = fs.readFileSync("./data/config.json");
            try {
                JSON.parse(raw)
            } catch (err) {
                return await interaction.editReply({
                    content: `> ${emojis.error} There was an error fetching the config file. Please revert it to the default config.`
                });
            }

            const config = JSON.parse(raw);

            const banPermissions = config.rolePermissions.ban.map((permission) => `<@&${permission}>`).join(", ") ?? "None.";
            const kickPermissions = config.rolePermissions.kick.map((permission) => `<@&${permission}>`).join(", ") ?? "None.";
            const timeoutPermissions = config.rolePermissions.timeout.map((permission) => `<@&${permission}>`).join(", ") ?? "None.";
            const warnPermissions = config.rolePermissions.warn.map((permission) => `<@&${permission}>`).join(", ") ?? "None.";
            
            const container = new discord.ContainerBuilder()
                .addTextDisplayComponents((textDisplay) =>
                    textDisplay.setContent(
                        `## [Role Permissions] Moderations` + 
                        `\n### Ban\n> **Fixed permissions:** Administrator, BanMembers\n> **Custom permissions:** ${banPermissions.length > 0 ? banPermissions : "N/A"}_ _` +
                        `\n### Kick\n> **Fixed permissions:** Administrator, KickMembers\n> **Custom permissions:** ${kickPermissions.length > 0 ? kickPermissions : "N/A"}_ _` +
                        `\n ### Timeout\n> **Fixed permissions:** Administrator, MuteMembers, ModerateMembers\n> **Custom permissions:** ${timeoutPermissions.length > 0 ? timeoutPermissions : "N/A"}_ _` + 
                        `\n### Warn\n> **Fixed permissions:** Administrator, ModerateMembers\n> **Custom permissions:** ${warnPermissions.length > 0 ? warnPermissions : "N/A"}_ _`
                    )
                );

            return await interaction.editReply({
                content: null,
                components: [container],
                flags: discord.MessageFlags.IsComponentsV2
            });

        },
        "setup:moderationpermissions:edit": async (interaction, options) => {
            
            const raw = fs.readFileSync("./data/config.json");
            try {
                JSON.parse(raw);
            } catch (err) {
                return await interaction.reply({
                    content: `> ${emojis.error} There was an error fetching the config file. Please revert it to the default config.`,
                    flags: discord.MessageFlags.Ephemeral
                });
            }

            const data = JSON.parse(raw);

            const modal = new discord.ModalBuilder()
                .setTitle("[Role Permissions] Moderation")
                .setCustomId("setup:modal:moderationpermissions");

            const title = (value) => {
                return `${value[0].toUpperCase()}${value.split("").slice(1).join("")}`
            }

            const comps = ["ban", "kick", "timeout", "warn"].map((type) => {
                const roleSelect = new discord.RoleSelectMenuBuilder()
                    .setCustomId(`ignore:${type}-roles`)
                    .setPlaceholder(`Roles that can ${type} members`)
                    .setRequired(false)
                    .setMaxValues(4)
                    .addDefaultRoles(data.rolePermissions[type]);

                const label = new discord.LabelBuilder()
                    .setLabel(`${title(type)}`)
                    .setRoleSelectMenuComponent(roleSelect);

                return label;
            });

            modal.addComponents(...comps);

            return await interaction.showModal(modal);

        },
        "setup:modal:moderationpermissions": async (interaction, options) => {
            const initialResponse = await interaction.reply({
                content: `> ${emojis.loading} Saving configuration...`,
                flags: discord.MessageFlags.Ephemeral
            });

            const data = {
                ban: interaction.fields.getField("ignore:ban-roles"),
                kick: interaction.fields.getField("ignore:kick-roles"),
                timeout: interaction.fields.getField("ignore:timeout-roles"),
                warn: interaction.fields.getField("ignore:warn-roles")
            };

            const origFile = fs.readFileSync("./data/config.json");
            try {
                JSON.parse(origFile);
            } catch (err) {
                return await interaction.editReply({
                    content: `> ${emojis.error} There was an error fetching the config file. Please rever it to the default configuration.`,
                    flags: discord.MessageFlags.Ephemeral
                });
            }

            const config = JSON.parse(origFile);
            const tempFile = fs.createWriteStream(`./data/config.json.tmp`, { flags: 'w' });
            
            config.rolePermissions.ban = data.ban?.roles?.map((role) => role.id) ?? [];
            config.rolePermissions.kick = data.kick?.roles?.map((role) => role.id) ?? [];
            config.rolePermissions.timeout = data.timeout?.roles?.map((role) => role.id) ?? [];
            config.rolePermissions.warn = data.warn?.roles?.map((role) => role.id) ?? [];
            
            await fs.promises.writeFile("./data/config.json.tmp", JSON.stringify(config, null, 2));
            await fs.promises.rename("./data/config.json.tmp", "./data/config.json");
            return await interaction.editReply({
                content: `> ${emojis.success} Successfully saved new moderation role permissions.`
            });
        },
        "setup:sessionpermissions:info": async (interaction, options, client) => {
            await interaction.reply({
                content: `> ${emojis.loading}`,
                flags: discord.MessageFlags.Ephemeral
            });

            const raw = fs.readFileSync("./data/config.json");
            try {
                JSON.parse(raw)
            } catch (err) {
                return await interaction.editReply({
                    content: `> ${emojis.error} There was an error fetching the config file. Please revert it to the default config.`
                });
            }

            const config = JSON.parse(raw);

            const sessionManagementRoles = config.rolePermissions.sessionManagement;
            const roles = sessionManagementRoles.map((role) => `<@&${role}>`).join(", ");
            
            const commands = await client.application.commands.fetch();
            const sessionCommands = commands.find((value) => value.name === "sessions");
            const subCommands = sessionCommands.options.map((option) => `</sessions ${option.name}:${sessionCommands.id}>`).join(", ")
            
            const container = new discord.ContainerBuilder()
                .addTextDisplayComponents((textDisplay) =>
                    textDisplay.setContent(
                        `## [Role Permissions] Sessions` + 
                        `\n> **Fixed permissions:** Administrator, ManageGuild.` +
                        `\n> **Custom permissions:** ${roles.length > 0 ? roles : "N/A"}.` +
                        `\n> **Available commands:** ${subCommands}`
                    )
                );

            return await interaction.editReply({
                content: null,
                components: [container],
                flags: discord.MessageFlags.IsComponentsV2
            });
        },
        "setup:sessionpermissions:edit": async (interaction, options, client) => {
            const file = fs.readFileSync("./data/config.json");
            try {
                JSON.parse(file)
            } catch (err) {
                return await interaction.reply({
                    content: `> ${emojis.error} Invalid configuration file. Try resetting it to the default configuration.`,
                    flags: discord.MessageFlags.Ephemeral
                });
            }

            const data = JSON.parse(file);
            const sessionManagementRoles = data.rolePermissions.sessionManagement;

            const actionRow = new discord.ActionRowBuilder()
                .addComponents(
                    new discord.RoleSelectMenuBuilder()
                        .setCustomId("setup:sessionpermissions:newroles")
                        .setPlaceholder("Select session management roles")
                        .setDefaultRoles(sessionManagementRoles ?? [])
                        .setMaxValues(4)
                );

            return await interaction.reply({
                content: `> ${emojis.loading} Choose your session management roles using the select menu below.`,
                components: [actionRow],
                flags: discord.MessageFlags.Ephemeral
            });
        },
        "setup:sessionpermissions:newroles": async (interaction, options, client) => {
            const roles = interaction.values;

            const raw = fs.readFileSync("./data/config.json");
            const config = JSON.parse(raw);

            config.rolePermissions.sessionManagement = roles;

            await fs.promises.writeFile("./data/config.json", JSON.stringify(config, null, 2));

            return await interaction.reply({
                content: `> ${emojis.success} Successfully updated session role permissions.`,
                flags: discord.MessageFlags.Ephemeral
            });
        },
        "setup:sessionembeds:info": async (interaction, options, client) => {
            await interaction.reply({
                content: `> ${emojis.loading}`,
                flags: discord.MessageFlags.Ephemeral
            });

            const raw = fs.readFileSync("./data/config.json");
            try {
                JSON.parse(raw)
            } catch (err) {
                return await interaction.editReply({
                    content: `> ${emojis.error} There was an error fetching the config file. Please revert it to the default config.`
                });
            }

            const config = JSON.parse(raw);
            const infoEmoji = { id: emojis.info.split("info:")[1].split(">")[0], name: "info" };

            const sessionEmbeds = config.sessionEmbeds;

            const container = new discord.ContainerBuilder()
                .addSectionComponents((section) =>
                    section
                        .addTextDisplayComponents((textDisplay) =>
                            textDisplay.setContent(`### Startup\n> ${sessionEmbeds.startup ? "Viewable" : "No embed found. Please configure one."}`)
                        )
                        .setButtonAccessory((button) =>
                            button.setCustomId("setup:sessionembed:view-startup").setDisabled(sessionEmbeds.startup ? false : true).setEmoji(infoEmoji).setStyle(discord.ButtonStyle.Secondary))

                )
                .addSectionComponents((section) =>
                    section
                        .addTextDisplayComponents((textDisplay) =>
                            textDisplay.setContent(`### Shutdown\n> ${sessionEmbeds.shutdown ? "Viewable" : "No embed found. Please configure one."}`)
                        )
                        .setButtonAccessory((button) =>
                            button.setCustomId("setup:sessionembed:view-shutdown").setDisabled(sessionEmbeds.shutdown ? false : true).setEmoji(infoEmoji).setStyle(discord.ButtonStyle.Secondary))

                )
                .addSectionComponents((section) =>
                    section
                        .addTextDisplayComponents((textDisplay) =>
                            textDisplay.setContent(`### Vote\n> ${sessionEmbeds.vote ? "Viewable" : "No embed found. Please configure one."}`)
                        )
                        .setButtonAccessory((button) =>
                            button.setCustomId("setup:sessionembed:view-vote").setDisabled(sessionEmbeds.vote ? false : true).setEmoji(infoEmoji).setStyle(discord.ButtonStyle.Secondary))

                )
                .addSectionComponents((section) =>
                    section
                        .addTextDisplayComponents((textDisplay) =>
                            textDisplay.setContent(`### Boost\n> ${sessionEmbeds.boost ? "Viewable" : "No embed found. Please configure one."}`)
                        )
                        .setButtonAccessory((button) =>
                            button.setCustomId("setup:sessionembed:view-boost").setDisabled(sessionEmbeds.boost ? false : true).setEmoji(infoEmoji).setStyle(discord.ButtonStyle.Secondary))

                )
                .addSectionComponents((section) =>
                    section
                        .addTextDisplayComponents((textDisplay) =>
                            textDisplay.setContent(`### Assistance\n> ${sessionEmbeds.assistance ? "Viewable" : "No embed found. Please configure one."}`)
                        )
                        .setButtonAccessory((button) =>
                            button.setCustomId("setup:sessionembed:view-assistance").setDisabled(sessionEmbeds.assistance ? false : true).setEmoji(infoEmoji).setStyle(discord.ButtonStyle.Secondary))

                );

            return await interaction.editReply({
                content: null,
                components: [container],
                flags: discord.MessageFlags.IsComponentsV2
            });
        },
        "setup:sessionembed:view": async (interaction, options, client) => {
            await interaction.reply({
                content: `> ${emojis.loading}`,
                flags: discord.MessageFlags.Ephemeral
            });

            const raw = fs.readFileSync("./data/config.json");
            try {
                JSON.parse(raw)
            } catch (err) {
                return await interaction.editReply({
                    content: `> ${emojis.error} There was an error fetching the config file. Please revert it to the default config.`
                });
            }

            const config = JSON.parse(raw);

            const embed = config.sessionEmbeds[options[0]];
            if (!embed) return await interaction.editReply({
                content: `> ${emojis.error} Unknown session type selected.\n ${options[0]}`
            });

            return await interaction.editReply({
                ...embed
            });
        },
        "setup:sessionembeds:edit": async (interaction, options, client) => {
            const raw = fs.readFileSync("./data/config.json");
            try {
                JSON.parse(raw)
            } catch (err) {
                return await interaction.editReply({
                    content: `> ${emojis.error} There was an error fetching the config file. Please revert it to the default config.`
                });
            }

            const config = JSON.parse(raw);

            const modal = new discord.ModalBuilder()
                .setTitle("[Embeds] Sessions")
                .setCustomId("setup:sessionembed:saveedit");

            const typeSelect = new discord.StringSelectMenuBuilder()
                .setCustomId("ignore:select-sessionembed-type")
                .setPlaceholder("Select the embed to edit")
                .setMaxValues(1)
                .setRequired(true)
                .addOptions(
                    new discord.StringSelectMenuOptionBuilder()
                        .setLabel("Startup")
                        .setDescription("Session startup embed")
                        .setValue("session-startup"),
                    new discord.StringSelectMenuOptionBuilder()
                        .setLabel("Shutdown")
                        .setDescription("Session shutdown embed")
                        .setValue("session-shutdown"),
                    new discord.StringSelectMenuOptionBuilder()
                        .setLabel("Vote")
                        .setDescription("Session vote embed")
                        .setValue("session-vote"),
                    new discord.StringSelectMenuOptionBuilder()
                        .setLabel("Boost")
                        .setDescription("Member request embed")
                        .setValue("session-boost"),
                    new discord.StringSelectMenuOptionBuilder()
                        .setLabel("Assistance")
                        .setDescription("Staff request embed")
                        .setValue("session-assistance")
                );

            
            const typeLabel = new discord.LabelBuilder()
                .setLabel("Select the embed type to edit")
                .setStringSelectMenuComponent(typeSelect);

            const embedEditor = new discord.TextInputBuilder()
                .setCustomId("ignore:embed-info")
                .setPlaceholder("JSON structure for the embed")
                .setRequired(true)
                .setStyle(discord.TextInputStyle.Paragraph);

            const embedEditorLabel = new discord.LabelBuilder()
                .setLabel("JSON Embed Structure")
                .setTextInputComponent(embedEditor);

            modal.addComponents(typeLabel, embedEditorLabel);

            return await interaction.showModal(modal);
        },
        "setup:sessionembed:saveedit": async (interaction, options, client) => {
            const typeField = interaction.fields.getField("ignore:select-sessionembed-type");
            const dataField = interaction.fields.getField("ignore:embed-info");

            const raw = fs.readFileSync("./data/config.json");
            const config = JSON.parse(raw);

            try {
                const selectedType = typeField.values[0]; 
                const parsedJson = JSON.parse(dataField.value); 
                
                config.sessionEmbeds[
                    selectedType === "session-startup" ? "startup" :
                    selectedType === "session-shutdown" ? "shutdown" : 
                    selectedType === "session-vote" ? "vote" : 
                    selectedType === "session-boost" ? "boost" :
                    "assistance"
                ] = parsedJson;
            } catch (err) {
                return await interaction.reply({
                    content: `> ${emojis.error} Invalid JSON embed export provided.`,
                    flags: discord.MessageFlags.Ephemeral
                });
            }

            await fs.promises.writeFile("./data/config.json", JSON.stringify(config, null, 2));
            return await interaction.reply({
                content: `> ${emojis.success} Successfully saved embed.`,
                flags: discord.MessageFlags.Ephemeral
            });
        }
    }
}