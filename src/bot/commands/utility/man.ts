import { SlashCommandBuilder, Client, ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";

export = {
    data: new SlashCommandBuilder()
    .setName("man")
    .setDescription("Manual page for a command.")
    .addStringOption(option => 
        option
        .setName("command")
        .setDescription("Command manual page to search for")
        .setRequired(true)    
    ),

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const targetCommand: string = interaction.options.getString("command")!

        if(!client.commands.get(targetCommand)) return await interaction.reply({
            content: `Hmm, command **${targetCommand}** does not exist\n`
        })

        const command = client.commands.get(targetCommand)
        let commandSubCommands: string[] = []

        command.data.options.forEach((option: any) => {
            console.log(option instanceof SlashCommandSubcommandBuilder)
            if(option instanceof SlashCommandSubcommandBuilder) {
                commandSubCommands.push(option.name)
            }
        })

        console.log(commandSubCommands.join(", "))

        const manualEmbed = new EmbedBuilder()
        .setDescription(`\`\`NAME\`\`\n> ${command.data.name}\n\n\`\`DESCRIPTION\`\`\n> ${command.data.description}\n\n${commandSubCommands.length > 0 ? `\`\`SUBCOMMANDS\`\`\n> ${commandSubCommands.join(",")}\n` : ""}`)
        .setFooter({ text: `Requested by ${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp()

        console.log(client.commands.get(targetCommand).data.options)
        await interaction.reply({ embeds: [manualEmbed] })
    }
}