const fs = require('fs');

const config = "./data/config.json";
const configObj = JSON.parse(fs.readFileSync(config));
const assets = configObj.assets;

module.exports = {
    emojis: {
        loading: `<:loading:${assets.loading.id}>`,
        success: `<:check:${assets.check.id}>`,
        error: `<:error:${assets.error.id}>`,

        refresh: `<:refresh:${assets.refresh.id}>`,
        info: `<:info:${assets.info.id}>`,
        cog: `<:cog:${assets.cog.id}>`,
        
        left: `<:leftchevron:${assets.leftchevron.id}>`,
        right: `<:rightchevron:${assets.rightchevron.id}>`,

        plus: `<:plus:${assets.plus.id}>`,
        edit: `<:edit:${assets.edit.id}>`,
        sliders: `<:sliders:${assets.sliders.id}>`,
        remove: `<:delete:${assets.delete.id}>`
    }
}