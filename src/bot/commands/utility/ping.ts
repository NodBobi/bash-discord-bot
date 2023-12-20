import { SlashCommandBuilder, Client, ChatInputCommandInteraction } from "discord.js";
import ping from 'ping'
import { DiscordEmbed } from "../../../utils/classes/DiscordEmbed";

export = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("I will reply with pong.")
        .addStringOption(option =>
            option
                .setName("host")
                .setDescription("A host to ping for")
        ),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const deferred = await interaction.deferReply()
        const host = interaction.options.getString("host") || null
        if (!host) return await deferred.edit("pong!")

        try {
            const res = await ping.promise.probe(host!, {
                timeout: 10,
                deadline: 11,
                min_reply: 5,
            })

            if (res.alive) {
                const pingStatEmbed = new DiscordEmbed(client).embed
                    .setDescription(`\`\`\`diff\n+ HOST ${res.host} (${res.numeric_host})\`\`\``)
                    .setFields({ name: "**__RESULTS__**", value: `> Packets sent: \`\`${res.times.length}\`\`\n> Times: \`\`${res.times}\`\`\n > Min: \`\`${res.min}ms\`\`\n > Max: \`\`${res.max}\`\`\n > Avg: \`\`${res.avg}\`\`\n> Packet loss: \`\`${res.packetLoss}%\`\`` })
                    .setColor("Green")
                return await deferred.edit({ embeds: [pingStatEmbed] })
            }
            return await deferred.edit({ content: res.output })
        } catch (error) {
            await deferred.edit({ content: `This is not good\n${error}` })
        }
    }
}