
const unitToMs = {
    s: 1000,
    m: 60 * 1000,
    h: 3600 * 1000,
    d: 24 * 3600 * 1000,
    w: 7 * 24 * 3600 * 1000,
    mo: 30 * 24 * 3600 * 1000,
    y: 365 * 30 * 24 * 3600 * 1000,
}

const extractTime = (expression) => {
    if (!expression || typeof expression !== "string" || expression.length === 0) return undefined;

    const timeReg = /^\d+[ywdhms]$/i;
    const tokens = expression.split(/\s+/);

    const durationTokens = [];
    let index = 0;

    while (index < tokens.length && timeReg.test(tokens[index])) {
        durationTokens.push(tokens[index]);
        index++;
    }


    const rawDuration = durationTokens.length > 0 ? durationTokens.join(' ') : null;
    const reason = index < tokens.length ? tokens.slice(index).join(' ') : null;
    
    let duration = null;
    if (rawDuration) {
        const dTokens = rawDuration.trim().toLowerCase().split(/\s+/);
        let total = 0;

        for (const token of tokens) {
            const match = token.match(/^(\d+)([a-z]+)$/);
            if (!match) continue;

            const amount = parseInt(match[1], 10);
            const unit = match[2];

            if (unitToMs[unit]) {
                total += amount * unitToMs[unit];
            }
        }

        duration = total;
    }

    return { rawDuration, duration, reason };
}


module.exports = {
    extractTime: extractTime
}