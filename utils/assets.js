const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'data', 'config.json');

function getAssetsConfig() {
    try {
        const configObj = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return configObj.assets || {};
    } catch {
        return {};
    }
}

const emojis = new Proxy({}, {
    get(target, prop) {
        const assets = getAssetsConfig();
        const asset = assets[prop];

        if (!asset?.id) {
            return `:${prop}:`; 
        }

        return `<:${asset.name}:${asset.id}>`;
    }
});

module.exports = { emojis };