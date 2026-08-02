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

    for await (const line of rl) {
        const moderation = JSON.parse(line);
        if (moderation.guild === guildId && moderation.agent === agentId) {
            moderations.push(moderation);
        }
    }

    return moderations;
}

async function getModerationById(guildId, moderationId) {
    const file = `./data/moderations.jsonl`;

    let moderation;
    const readStream = fs.createReadStream(file);
    const rl = readline.Interface({
        input: readStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const mod = JSON.parse(line);

        if (mod.guild === guildId && String(mod.timestamp) === String(moderationId)) {
            moderation = mod;
            break;
        }
    }

    return moderation;
}

async function deleteModeration(guildId, moderationId) {
    const file = `./data/moderations.jsonl`;
    const temp = `./data/moderations.jsonl.tmp`;

    if (!fs.existsSync(file)) return false;

    const readStream = fs.createReadStream(file);
    const writeStream = fs.createWriteStream(temp, { flags: 'w' });

    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity
    });

    let deleted = false;

    for await (const line of rl) {
        if (!line.trim()) continue;

        const mod = JSON.parse(line);
        
        if (mod.guild === guildId && String(mod.timestamp) === String(moderationId)) {
            deleted = true;
            continue;
        }

        writeStream.write(line + "\n");
    }

    await new Promise((resolve) => writeStream.end(resolve));

    await fs.promises.rename(temp, file);

    return deleted;
}

async function editModeration(guildId, moderationId, type, duration, reason) {
    const file = `./data/moderations.jsonl`;

    if (!fs.existsSync(file)) return false;

    const readStream = fs.createReadStream(file);
    const writeStream = fs.createWriteStream(`${file}.tmp`, { flags: 'w' });

    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity
    });

    let edited = false;
    
    for await (const line of rl) {
        if (!line.trim()) continue;

        const mod = JSON.parse(line);
        
        if (mod.guild === guildId && String(mod.timestamp) === String(moderationId)) {
            mod.type = type;
            mod.duration = duration;
            mod.reason = reason;
            edited = true;
        }

        writeStream.write(JSON.stringify(mod) + "\n");
    }

    await new Promise((resolve) => writeStream.end(resolve));

    await fs.promises.rename(`${file}.tmp`, file);

    return edited;
}

module.exports = {
    saveModeration,
    getVictimModerations,
    getAgentModerations,
    getModerationById,
    deleteModeration,
    editModeration
}