require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
    console.error('TOKEN or CLIENT_ID missing in .env.');
    process.exit(1);
}

const commandsPath = path.join(__dirname, 'commands');
const slashCommands = [];
const subcommandParents = new Map();

function loadCommands(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            loadCommands(fullPath);
            continue;
        }

        if (!entry.name.endsWith('.js')) continue;

        const command = require(fullPath);

        if (!command.type || (!command.name && !command.data) || !command.execute) {
            console.warn(
                `Skipping ${fullPath} as it is missing 'type', 'name' or 'data', or 'execute'.`
            );
            continue;
        }

        if (command.type === 'prefix') {
            continue;
        }

        if (command.type === 'slash') {
            if (!command.data?.name) {
                console.warn(`Skipping ${fullPath} as it is missing a valid slash command builder.`);
                continue;
            }

            slashCommands.push(command.data);
            continue;
        }

        if (command.type === 'sub') {
            if (!command.data?.name) {
                console.warn(`Skipping ${fullPath} as it is missing a valid subcommand builder.`);
                continue;
            }

            const relative = path.relative(commandsPath, fullPath);
            const parts = relative.split(path.sep);
            const parentName = parts[0];

            if (!subcommandParents.has(parentName)) {
                const parentCommand = new SlashCommandBuilder()
                    .setName(parentName)
                    .setDescription(`Commands for ${parentName}`);

                subcommandParents.set(parentName, parentCommand);
                slashCommands.push(parentCommand);
            }

            subcommandParents.get(parentName).addSubcommand(command.data);
            continue;
        }

        console.warn(`Skipping ${fullPath} as it has an unknown command type.`);
    }
}

loadCommands(commandsPath);

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${slashCommands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: slashCommands.map(cmd => cmd.toJSON()) }
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();