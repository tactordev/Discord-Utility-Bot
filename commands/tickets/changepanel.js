const discord = require('discord.js');
const { emojis } = require('#utils/assets');
const fs = require('fs');
const readline = require('readline');

module.exports = {
    name: "changepanel",
    type: "sub",
    data: new discord.SlashCommandSubcommandBuilder()
        .setName("changepanel")
        .setDescription("Rename a ticket")
        .addStringOption(
            option => option.setName("panel").setDescription("New name for the ticket").setRequired(true)
        ),
    async execute(interaction) {
        const panel = interaction.options.getString("panel");
        const config = JSON.parse(fs.readFileSync(`./data/config.json`));

        const panels = Object.keys(config.tickets).map((panel) => panel);

        if (!panels.includes(panel)) {
            return await interaction.editReply({
                content: `> ${emojis.error} Invalid panel type.`
            });
        }

        const cat = config.tickets[panel].category;
        const obj = await interaction.guild.channels.fetch(cat);

        const file = `./data/tickets.jsonl`;
    
        const readStream = fs.createReadStream(file);
        const writeStream = fs.createWriteStream(`${file}.tmp`, { flags: 'w' });
    
        const rl = readline.createInterface({
            input: readStream,
            crlfDelay: Infinity
        });
        let tick;
        
        for await (const line of rl) {
            if (!line.trim()) continue;
    
            const ticket = JSON.parse(line);
            
            if (ticket.channel === interaction.channel.id) {
                ticket.type = panel;
                tick = ticket;
            }
    
            writeStream.write(JSON.stringify(ticket) + "\n");
        }
    
        await new Promise((resolve) => writeStream.end(resolve));
    
        await fs.promises.rename(`${file}.tmp`, file);

        if (!tick) return await interaction.editReply({
            content: `> ${emojis.error} This is not a ticket.`
        });

        interaction.channel.permissionOverwrites.set([
            {
                id: tick.agent,
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
            ...config.tickets[panel].agents.map((id) => {
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
        ], "Switch panel type");
        

        await interaction.channel.edit({ parent: obj });
        await interaction.editReply({
            content: `> ${emojis.success} Changed panel type.`
        });
    }
}