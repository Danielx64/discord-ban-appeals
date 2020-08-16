const fetch = require("node-fetch");

const { API_ENDPOINT } = require("./helpers/discord-helpers.js");
const { createJwt, decodeJwt } = require("./helpers/jwt-helpers.js");

exports.handler = async function (event, context) {
    let payload;

    if (process.env.USE_NETLIFY_FORMS) {
        payload = JSON.parse(event.body).payload.data;
    } else {
        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405
            };
        }

        const params = new URLSearchParams(event.body);
        payload = {
            discordtime: params.get("discordtime") || undefined,
            timezone: params.get("timezone") || undefined,
            why: params.get("why") || undefined,
            aboutyourself: params.get("aboutyourself") || undefined,
            moderatedbefore: params.get("moderatedbefore") || undefined,
            currentmod: params.get("currentmod") || undefined,
            currentmodinfo: params.get("currentmodinfo") || undefined,
            token: params.get("token") || undefined
        };
    }

    if (payload.token !== undefined) {
        
        const userInfo = decodeJwt(payload.token);
        const embedFields = [
            {
                name: "Submitter",
                value: `<@${userInfo.id}> (${userInfo.username}#${userInfo.discriminator})`
            },
            {
                name: "How long have you been an active user of Discord?",
                value: payload.discordtime
            },
            {
                name: "Which timezone do you currently live in?",
                value: payload.timezone
            },
            {
                name: "Why do you want to be a moderator of this particular community?",
                value: payload.why
            },
            {
                name: "Something about yourself(optional)",
                value: payload.aboutyourself
            }
            ,
            {
                name: "Have you ever moderated before on Discord?",
                value: payload.moderatedbefore
            }
            ,
            {
                name: "Do you currently moderate any kind of community?",
                value: payload.currentmod
            }
            ,
            {
                name: "What kind of community is it? What are you responsible for there?",
                value: payload.currentmodinfo
            }
        ];

        const result = await fetch(`${API_ENDPOINT}/channels/${encodeURIComponent(process.env.APPEALS_CHANNEL)}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`
            },
            body: JSON.stringify({
                embed: {
                    title: "New appeal submitted!",
                    timestamp: new Date().toISOString(),
                    fields: embedFields
                }
            })
        });

        if (result.ok) {
            if (process.env.USE_NETLIFY_FORMS) {
                return {
                    statusCode: 200
                };
            } else {
                return {
                    statusCode: 303,
                    headers: {
                        "Location": "/success"
                    }
                };
            }
        } else {
            throw new Error("Failed to submit message");
        }
    }

    return {
        statusCode: 400
    };
}