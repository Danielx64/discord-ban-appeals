const fetch = require("node-fetch");

const { API_ENDPOINT } = require("./discord-helpers.js");

async function getUserInfo(token) {
    const result = await fetch(`${API_ENDPOINT}/users/@me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!result.ok) {
        throw new Error("Failed to get user information");
    }

    return await result.json();
}

module.exports = { getUserInfo };