import { SlashCommandBuilder, Client, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export = {
    data: new SlashCommandBuilder().setName("help").setDescription("A compact guide on how to use this bot."),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        const helpEmbed = new EmbedBuilder()
        .setDescription(`Hello, this is the help embed!\nWe have the following command categories:\n${client.categories}`)
        .setFields({ name: "Use the command below to get help on a specific command", value: "```/man [COMMAND_NAME]```" })

        await interaction.reply({ embeds: [helpEmbed] })
    }
}