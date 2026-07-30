


async function fetchUser(value, guild) {
    if (!guild || !value) return undefined;

    let type;
    let obj;
    let info;
    if (value.includes("<@")) {
        info = value.split("<@")[1].split(">")[0];
        type = "id";
    }   else {
        try {
            const test = parseInt(value);
            if (!test) throw Error;
            info = value;
            type = "id";
        } catch (err) {
            info = value;
            type = "name";
        }
    }

    if (!type || !info) return undefined;

    try {
        if (type === "id") {
            obj = await guild.members.fetch({ user: `${info}` });       
        } else if (type === "name") {   
            obj = await guild.members.fetch({ query: info, limit: 1 });
        }
    } catch (err) {
        console.warn(err);
        return undefined;
    }

    return obj;
}

module.exports = {
    fetchUser: fetchUser
}
