require("dotenv").config();


const { Client, Collection, Events, GatewayIntentBits, MessageFlags, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { emojis } = require("./utils/assets");
const Color = require("./utils/text-color");


// discord bot token
const TOKEN = process.env.TOKEN;

// client setup
const client = new Client(
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers
        ]
    }
);


// collections to add cmds to
client.prefixCmds = new Collection();
client.slashCmds = new Collection();
client.subcommandHandlers = new Collection();
client.componentHandlers = new Collection();



// fetching cmds
const fetchCmd = (location) => {
    fs.readdirSync(`${location}`).map((item) => {
        if (!item.endsWith(".js") && !fs.statSync(path.join(location, item)).isDirectory()) {
            return;
        }

        if (item.endsWith(".js")) { // possible command file
            const command = require(path.join(location, item));

            const full = `${location}${path.sep}${item}`;
            const commandsDir = path.join(__dirname, 'commands');
            const relative = path.relative(commandsDir, full);
            const withoutExtension = relative.slice(0, -path.extname(relative).length);
            const dotNotation = withoutExtension.split(path.sep).join('.');
            
            if (!command.type || (!(command.name) && !(command.data)) || !command.execute) {
                return console.warn(`${Color.orange}[Skipping]${Color.reset} ${Color.blue}${relative}${Color.reset} as it is missing an attribute of 'type', 'name' or 'data', 'execute'`);   
            }
            
            // register component handlers
            if (command.interactions) {
                for (const [id, callback] of Object.entries(command.interactions)) {
                    client.componentHandlers.set(id, callback);
                }
            }

            // register commands
            switch (command.type) {
                case 'prefix':
                    console.log(`${Color.yellow}[Loading]${Color.reset} ${Color.blue}${relative}${Color.reset} as prefix command.`);
                    return client.prefixCmds.set(command.name, command);
                case 'slash':
                    console.log(`${Color.yellow}[Loading]${Color.reset} ${Color.blue}${relative}${Color.reset} as slash command.`);
                    return client.slashCmds.set(command.name, command);
                case 'sub':
                    console.log(`${Color.yellow}[Loading]${Color.reset} ${Color.blue}${relative}${Color.reset} as subcommand.`);
                    return client.subcommandHandlers.set(dotNotation, command);
                default:
                    return console.warn(`${Color.orange}[Skipping]${Color.reset} ${Color.blue}${location}/${item}${Color.reset} as it is has an unknown command type.`);
            }
        } else { // possible sub command files / grouped commands
            return fetchCmd(`${location}${path.sep}${item}`);
        }
    });
}
const commandsPath = path.join(__dirname, "commands");
fetchCmd(commandsPath);


// command handling

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {

        const command = client.slashCmds.get(interaction.commandName);

        if (command) {
            await command.execute();
        } else {
            const group = interaction.options.getSubcommandGroup(false);
            const subcommand = interaction.options.getSubcommand(false);

            let key;
            if (group) {
                key = `${interaction.commandName}.${group}`;
            } else if (subcommand) {
                key = `${interaction.commandName}.${subcommand}`;
            }

            if (!key) return await interaction.reply({ content: `Command not found.`, flags: MessageFlags.Ephemeral });

            const handler = client.subcommandHandlers.get(key);
            if (handler) {
                const initialResponse = await interaction.reply({
                    content: `-# ${emojis.loading}`,
                    flags: MessageFlags.Ephemeral
                });
                await handler.execute(interaction, initialResponse);
            } else {
                return await interaction.reply({ content: `Command handler not found.`, flags: MessageFlags.Ephemeral });
            }
        }
    } else if (interaction.isButton()) {
        const handler = client.componentHandlers.get(interaction.customId);
        

        if (handler) {
            await handler(interaction);
        } else {
            return await interaction.reply({
                content: `${emojis.error} Component handler not found.`,
                flags: MessageFlags.Ephemeral
            });
        }
    }
});


client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    if (message.content[0] === ".") {
        const args = message.content.slice(1).trim().split(/ +/);
        const name = args.shift().toLowerCase();
        const command = client.prefixCmds.get(name);

        if (!command) return;

        if (command.permissions) {
            const agent = message.member;
            let allowed = false;
            let required = ``;
            command.permissions.map((permission, index) => {
                if (agent.permissions.has(permission)) allowed = true;
                required += `\`${new PermissionsBitField(permission)}\`${index === command.permissions.length - 1 ? "" : ", "}`;
                
            });
            
            if (!allowed) return await message.reply({
                content: `${emojis.error} Missing permissions.\n-# ${required}`
            });
        }

        const initialResponse = await message.reply({
            content: `-# ${emojis.loading}`
        });
        await command.execute(client, message, initialResponse, args);
    }
});




// on ready
client.once(Events.ClientReady, (client) => {
    client.user.setStatus('dnd');
    client.user.setActivity({ type: 3, name: 'Tactor Development'});
    return console.log(`\n\n${Color.green}[Ready]${Color.reset} Logged in as ${Color.blue}${client.user.tag}${Color.reset}`);
});



// bot start
client.login(TOKEN);