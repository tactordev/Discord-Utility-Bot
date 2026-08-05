const discord = require('discord.js');
const { emojis } = require('#utils/assets');
const fs = require('fs');
const readline = require('readline');
const discordTranscripts = require('discord-html-transcripts');

module.exports = {
    type: "sub",
    name: "embed",
    data: new discord.SlashCommandSubcommandBuilder()
        .setName("embed")
        .setDescription("Send the ticketing embed."),
    noAutoResponse: true,
    permissions: [discord.PermissionsBitField.Flags.Administrator, discord.PermissionsBitField.Flags.ManageGuild],
    async execute(interaction, initialResponse) {
        await interaction.reply({
            content: `> ${emojis.loading} Sending embed...`,
            flags: discord.MessageFlags.Ephemeral
        });

        const raw = fs.readFileSync("./data/config.json");
        try {
            JSON.parse(raw);
        } catch (err) {
            return await interaction.editReply({
                content: `> ${emojis.error} Something went wrong. Please check your config.json`
            });
        }
        
        const config = JSON.parse(raw);

        const plusEmoji = { id: emojis.plus.split("plus:")[1].split(">")[0], name: "plus" };

        const container = new discord.ContainerBuilder()
            .addTextDisplayComponents((textDisplay) =>
                textDisplay
                    .setContent(`# Assistance` + `\n> Welcome to the assistance centre. Here you can open tickets ranging from general queries to reports.`));

        for (const type of Object.keys(config.tickets)) {
            container.addSectionComponents((section) =>
                section
                    .addTextDisplayComponents((textDisplay) =>
                        textDisplay
                            .setContent(
                                `### ${type}` +
                                `\n> ${config.tickets[type].description}`
                            )
                    )
                    .setButtonAccessory((button) =>
                        button.setEmoji(plusEmoji).setCustomId(`tickets:new-${type}`).setStyle(discord.ButtonStyle.Secondary))

            );
            container.addSeparatorComponents((separator) => separator);
        };

        container.addActionRowComponents((actionRow) => 
            actionRow
                .addComponents(
                    new discord.ButtonBuilder()
                        .setEmoji(emojis.refresh)
                        .setStyle(discord.ButtonStyle.Secondary)
                        .setCustomId("tickets:refreshembed")
                )
        );

        await interaction.channel.send({
            components: [container],
            flags: discord.MessageFlags.IsComponentsV2
        });

        return await interaction.editReply({
            content: `> ${emojis.success} Send the embed successfully.`
        });
    },
    "interactions": {
        "tickets:new": async (interaction, options, client) => {
            if (!options.length > 0) {
                return await interaction.reply({
                    content: `> ${emojis.error} Unknown ticket type selected.`,
                    flags: discord.MessageFlags.Ephemeral
                });
            }

            const modal = new discord.ModalBuilder()
                .setTitle(`${options[0]} Ticket`)
                .setCustomId(`tickets:reason-${options[0]}`);

            const reasonInp = new discord.TextInputBuilder()
                .setStyle(discord.TextInputStyle.Paragraph)
                .setCustomId("ignore:tickets:reason")
                .setRequired(true);

            const label = new discord.LabelBuilder()
                .setLabel("Reason")
                .setTextInputComponent(reasonInp);

            modal.addComponents(label);
            return await interaction.showModal(modal);
        },
        "tickets:reason": async (interaction, options, client) => {
            if (!options.length > 0) {
                return await interaction.reply({
                    content: `> ${emojis.error} Unknown ticket type selected.`,
                    flags: discord.MessageFlags.Ephemeral
                });
            }

            await interaction.reply({
                content: `> ${emojis.loading} Opening ticket...`,
                flags: discord.MessageFlags.Ephemeral
            });

            const raw = fs.readFileSync("./data/config.json");
            try {
                JSON.parse(raw);
            } catch (err) {
                return await interaction.editReply({
                    content: `> ${emojis.error} Something went wrong. Please check your config.json`
                });
            }
            
            const reason = interaction.fields.getField("ignore:tickets:reason").value;
            const config = JSON.parse(raw);

            const cat = config.tickets[options[0]].category;
            const catObj = await interaction.guild.channels.fetch(cat);

            if (!catObj) {
                return await interaction.editReply({
                    content: `> ${emojis.error} Invalid category configured for this ticket type.`
                });
            }

            const newChannel = await interaction.guild.channels.create({
                name: `${options[0].split(" ").join("-")}-${interaction.user.tag}`,
                reason: "Ticket creation",
                parent: catObj,
            });

            newChannel.permissionOverwrites.set([
                {
                    id: interaction.user.id,
                    allow: [
                        discord.PermissionFlagsBits.ViewChannel,
                        discord.PermissionFlagsBits.SendMessages,
                        discord.PermissionFlagsBits.ReadMessageHistory,
                        discord.PermissionFlagsBits.AttachFiles,
                        discord.PermissionFlagsBits.AddReactions,
                    ]
                },
                {
                    id: interaction.guild.id,
                    deny: [
                        discord.PermissionFlagsBits.ViewChannel
                    ]
                },
                {
                    id: client.user.id,
                    allow: [
                        discord.PermissionFlagsBits.ViewChannel,
                        discord.PermissionFlagsBits.SendMessages,
                        discord.PermissionFlagsBits.ReadMessageHistory,
                        discord.PermissionFlagsBits.AttachFiles,
                        discord.PermissionFlagsBits.AddReactions,
                    ]
                },
                ...config.tickets[options[0]].agents.map((id) => {
                    return {
                        id: id,
                        allow: [
                            discord.PermissionFlagsBits.ViewChannel,
                            discord.PermissionFlagsBits.SendMessages,
                            discord.PermissionFlagsBits.ReadMessageHistory,
                            discord.PermissionFlagsBits.AttachFiles,
                            discord.PermissionFlagsBits.AddReactions,
                        ]
                    }
                })
            ], "Ticket creation");

            const file = `./data/tickets.jsonl`;
            const readStream = fs.createReadStream(file);
            const rl = readline.Interface({
                input: readStream,
                crlfDelay: Infinity
            });

            let max = 0;
            for await (const line of rl) {
                if (!line.trim()) continue;

                const ticket = JSON.parse(line);
                if (ticket.id > max) max = ticket.id;
            }
            
            const id = max + 1;
            const writeStream = fs.createWriteStream(`${file}`, { flags: `a` });

            const data = {
                guild: interaction.guild.id,
                channel: newChannel.id,
                id: id,
                timestamp: new Date().getTime(),
                type: options[0],
                status: true,
                agent: interaction.user.id,
                reason: reason,
                closer: null,
                closeReason: null
            };

            writeStream.write(JSON.stringify(data));

            writeStream.write("\n");
            writeStream.end();

            const removeEmoji = { id: emojis.delete.split("delete:")[1].split(">")[0], name: "delete" };  

            const container = new discord.ContainerBuilder()
                .addTextDisplayComponents((textDisplay) => 
                    textDisplay
                        .setContent(
                            `## [${id}] ${options[0]} Ticket` +
                            `\n> **User:** ${interaction.user.tag} (${interaction.user.id})` +
                            `\n> **Reason:** ${reason}`
                        )
                    )
                .addSeparatorComponents((separator) => separator)
                .addActionRowComponents((actionRow) =>
                    actionRow  
                        .addComponents(
                            new discord.ButtonBuilder()
                                .setCustomId(`tickets:close-${id}`)
                                .setEmoji(removeEmoji)
                                .setStyle(discord.ButtonStyle.Secondary)
                        )
                );

            await newChannel.send({
                components: [container],
                flags: discord.MessageFlags.IsComponentsV2
            });

            return await interaction.editReply({
                content: `> ${emojis.success} Created ticket successfully at <#${newChannel.id}>.`
            });

        },
        "tickets:close": async (interaction, options, client) => {
            if (!options[0]) return await interaction.reply({
                content: `> ${emojis.error} Ticket not found.`,
                flags: discord.MessageFlags.Ephemeral
            });

            const modal = new discord.ModalBuilder()
                .setTitle("Close Ticket")
                .setCustomId(`tickets:closereason-${options[0]}`);

            const reason = new discord.TextInputBuilder()
                .setCustomId("ignore:ticket:close:reason")
                .setRequired(true)
                .setStyle(discord.TextInputStyle.Paragraph);

            const label = new discord.LabelBuilder()
                .setLabel("Close Reason")
                .setTextInputComponent(reason);

            modal.addComponents(label);
            return await interaction.showModal(modal);
        },
        "tickets:closereason": async (interaction, options, client) => {
            const reason = interaction.fields.getField("ignore:ticket:close:reason").value;

            if (!options.length > 0) {
                return await interaction.reply({
                    content: `>Unknown ticket found.`,
                    flags: discord.MessageFlags.Ephemeral
                });
            }

            const file =`./data/tickets.jsonl`;

            const readStream = fs.createReadStream(file);
            const writeStream = fs.createWriteStream(`${file}.tmp`, { flags: `w` });

            const rl = readline.createInterface({
                input: readStream,
                crlfDelay: Infinity
            });

            let tick;
            for await (const line of rl) {
                if (!line.trim()) continue;
                
                const ticket = JSON.parse(line);
                if (String(ticket.id) === options[0]) {
                    ticket.status = false;
                    ticket.closer = interaction.user.id,
                    ticket.closeReason = reason;

                    tick = ticket;
                }

                writeStream.write(JSON.stringify(ticket));
                writeStream.write("\n")
            }

            await new Promise((resolve) => writeStream.end(resolve));
            await fs.promises.rename(`${file}.tmp`, file);

            await interaction.reply({
                content: `> ${emojis.loading} Closing ticket...`,
                flags: discord.MessageFlags.Ephemeral
            });

            try {
                const user = await interaction.guild.members.fetch(tick.agent);
                await user.send({
                    components: [
                        new discord.ContainerBuilder()
                            .addTextDisplayComponents((textDisplay) =>
                                textDisplay
                                    .setContent(
                                        `## Ticket closed` +
                                        `\n> **Close Reason:** ${tick.closeReason}` 
                                    )
                            )
                    ],
                    flags: discord.MessageFlags.IsComponentsV2
                })
            } catch (err) {
            }

            try {
                const raw = fs.readFileSync(`./data/config.json`);
                const data = JSON.parse(raw);
                const transcrChannel = await interaction.guild.channels.fetch(data?.channels?.transcripts);

                const transcript = await discordTranscripts.createTranscript(interaction.channel, {
                    limit: -1,
                    fileName: `transcript-${interaction.channel.id}.html`,
                    poweredBy: false,
                    saveImages: true
                });

                await transcrChannel.send({
                    content: `## Ticket transcript\n> **User:** <@${tick.agent}>\n> **Reason:** ${tick.reason}\n> **Close Reason:** ${tick.closeReason}`,
                    files: [transcript]
                });
            } catch (err) {

            }
            return await interaction.channel.delete();



        },
        "tickets:refreshembed": async (interaction, options, client) => {
            await interaction.reply({
                content: `> ${emojis.loading} Editing embed...`,
                flags: discord.MessageFlags.Ephemeral
            });

            const raw = fs.readFileSync("./data/config.json");
            try {
                JSON.parse(raw);
            } catch (err) {
                return await interaction.editReply({
                    content: `> ${emojis.error} Something went wrong. Please check your config.json`
                });
            }
            
            const config = JSON.parse(raw);

            const plusEmoji = { id: emojis.plus.split("plus:")[1].split(">")[0], name: "plus" };

            const container = new discord.ContainerBuilder()
                .addTextDisplayComponents((textDisplay) =>
                    textDisplay
                        .setContent(`# Assistance` + `\n> Welcome to the assistance centre. Here you can open tickets ranging from general queries to reports.`));

            for (const type of Object.keys(config.tickets)) {
                container.addSectionComponents((section) =>
                    section
                        .addTextDisplayComponents((textDisplay) =>
                            textDisplay
                                .setContent(
                                    `### ${type}` +
                                    `\n> ${config.tickets[type].description}`
                                )
                        )
                        .setButtonAccessory((button) =>
                            button.setEmoji(plusEmoji).setCustomId(`tickets:new-${type}`).setStyle(discord.ButtonStyle.Secondary))

                );
                container.addSeparatorComponents((separator) => separator);
            };

            container.addActionRowComponents((actionRow) => 
                actionRow
                    .addComponents(
                        new discord.ButtonBuilder()
                            .setEmoji(emojis.refresh)
                            .setStyle(discord.ButtonStyle.Secondary)
                            .setCustomId("tickets:refreshembed")
                    )
            );

            await interaction.message.edit({
                components: [container],
                flags: discord.MessageFlags.IsComponentsV2
            });

            return await interaction.editReply({
                content: `> ${emojis.success} Updated embed successfully.`
            });
        }
    }
}