import { SlashCommandBuilder, Client, ChatInputCommandInteraction } from "discord.js";

export = {
    data: new SlashCommandBuilder().setName("ping").setDescription("I will reply with pong."),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        await interaction.reply("pong!")
    }
}