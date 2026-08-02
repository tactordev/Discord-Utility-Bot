const fs = require('fs');
const readline = require('readline');

async function saveModeration(guildId, userId, type, agent, victim, duration = Infinity, reason = "No reason provided.") {
    const file = `./data/moderations.jsonl`;


    const writeStream = fs.createWriteStream(file, { flags: 'a' });

    const data = {
        guild: guildId,
        type: type,
        timestamp: new Date().getTime(),
        agent: agent.id,
        victim: victim.id,
        duration: duration,
        reason: reason
    };

    writeStream.write(JSON.stringify( data ));

    writeStream.write("\n");
    writeStream.end();
    return true;
}

async function getVictimModerations(guildId, userId) {
    const file = `./data/moderations.jsonl`;

    const moderations = [];
    const readStream = fs.createReadStream(file);
    const rl = readline.Interface({
        input: readStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const moderation = JSON.parse(line);
        if (moderation.guild === guildId && moderation.victim === userId) {
            moderations.push(moderation);
        }
    }

    return moderations;
}

async function getAgentModerations(guildId, agentId) {
    const file = `./data/moderations.jsonl`;

    const moderations = [];
    const readStream = fs.createReadStream(file);
    const rl = readline.Interface({
        input: readStream,
        crlfDelay: Infinity
    });

    for await (const line of file) {
        const moderation = JSON.parse(line);
        if (moderation.guild === guildId && moderation.agent === agentId) {
            moderations.push(moderation);
        }
    }

    return moderations;
}

module.exports = {
    saveModeration,
    getVictimModerations,
    getAgentModerations
}