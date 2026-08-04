const fs = require('fs');

const config = "./data/config.json";
const configObj = JSON.parse(fs.readFileSync(config));
const assets = configObj.assets;

module.exports = {
    emojis: {
        loading: `<:loading:${assets.loading}>`,
        success: `<:check:${assets.check}>`,
        error: `<:error:${assets.error}>`,

        refresh: `<:refresh:${assets.refresh}>`,
        info: `<:info:${assets.info}>`,
        cog: `<:cog:${assets.cog}>`,
        
        left: `<:leftchevron:${assets.leftchevron}>`,
        right: `<:rightchevron:${assets.rightchevron}>`,

        plus: `<:plus:${assets.plus}>`,
        edit: `<:edit:${assets.edit}>`,
        sliders: `<:sliders:${assets.sliders}>`,
        remove: `<:delete:${assets.delete}>`
    }
}