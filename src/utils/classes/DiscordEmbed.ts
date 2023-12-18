/*
    Embed builder to add all the static fields that do not change
*/

import { Client, EmbedBuilder } from 'discord.js'

export class DiscordEmbed {
    embed: EmbedBuilder

    constructor(client: Client) { // Pass the client as param so we get access to the client version
        this.embed = new EmbedBuilder().setFooter({ text: `Bot version ${client.version}`, iconURL: "https://cdn.discordapp.com/attachments/1186259145247174667/1186276538753220699/image.png?ex=6592a91e&is=6580341e&hm=1b88b7cca46059637bad04692e4669db1d2c1f1fbaa6f484e683341950b779e5&" }).setTimestamp()
        return this
    }
}