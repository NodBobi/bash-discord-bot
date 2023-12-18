import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

export = {
    data: new SlashCommandBuilder()
    .setName("sudo")
    .setDescription("Command for administrative purposes.")
    .addSubcommand(subcommand => 
        subcommand
        .setName("ban")
        .setDescription("Ban a member from the server")
        .addUserOption(option =>
            option
            .setName("member")
            .setDescription("Select a member to ban")
            .setRequired(true)
        )
        .addStringOption(option =>
            option
            .setName("flags") 
            .setDescription("Additional flags to use")   
        )
    ),

    validFlags: [{
        flag: ["-y", "--yes"],
        description: "Override any prompt that the command may ask."
    }],

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        switch (interaction.options.getSubcommand()) {
            case "ban":
                const targetUser = interaction.options.getUser('member')
                const flags = interaction.options.getString("flags")
                await interaction.reply({ content: `Member to ban: ${targetUser?.id},\nFlags provided: ${flags}`, ephemeral: true })
                break;
        
            default:
                break;
        }
    }
}