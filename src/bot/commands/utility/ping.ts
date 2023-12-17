import { SlashCommandBuilder, Client } from "discord.js";

export = {
    data: new SlashCommandBuilder().setName("ping").setDescription("I will reply with pong."),
    async execute(interaction: any, client: Client) {
        await interaction.reply("pong!")
    }
}