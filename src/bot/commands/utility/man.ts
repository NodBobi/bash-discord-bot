import { SlashCommandBuilder, Client, ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, EmbedField } from "discord.js";
import { DiscordEmbed } from "../../../utils/classes/DiscordEmbed";

export = {
    data: new SlashCommandBuilder()
        .setName("man")
        .setDescription("Manual page for a command.")
        .addStringOption(option =>
            option
                .setName("command")
                .setDescription("Command manual page to search for")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("subcommand")
                .setDescription("Search for a subcommand manual page")
        ),

    async execute(interaction: ChatInputCommandInteraction, client: Client) {

        // Check if we are looking for subcommand manual
        if (interaction.options.getString("subcommand")) {
            const targetCommand: string = interaction.options.getString("command")!
            const subCommand = interaction.options.getString("subcommand")

            if (!client.commands.get(targetCommand)) return await interaction.reply({
                content: `Hmm, command **${targetCommand}** does not exist\n`
            })

            const commandOptions = client.commands.get(targetCommand).data.options
            const foundSubcommand = commandOptions.filter((option: SlashCommandSubcommandBuilder | any) => {
                if (option instanceof SlashCommandSubcommandBuilder && option.name === subCommand) {
                    return option
                }
            })[0]

            console.log(foundSubcommand)

            if (!foundSubcommand) {
                return await interaction.reply({ content: `Hmm, subcommand **${subCommand}** does not exist on command **${targetCommand}**\n` })
            }

            const manualEmbed = new DiscordEmbed(client).embed
                .setDescription(`\`\`NAME\`\`\n> ${targetCommand} ${foundSubcommand.name}\n\n\`\`DESCRIPTION\`\`\n> ${foundSubcommand.description}\n`)

            return await interaction.reply({ embeds: [manualEmbed] })
        }

        const targetCommand: string = interaction.options.getString("command")!

        if (!client.commands.get(targetCommand)) return await interaction.reply({
            content: `Hmm, command **${targetCommand}** does not exist\n`
        })

        const command = client.commands.get(targetCommand)
        console.log("Command: ", command)

        let commandSubCommands: string[] = []

        command.data.options.forEach((option: any) => {
            if (option instanceof SlashCommandSubcommandBuilder) {
                commandSubCommands.push(option.name)
            }
        })

        let fieldsArray: EmbedField[] = []

        if (command.validFlags) {
            command.validFlags.forEach((flag: any) => {
                fieldsArray.push({ name: `\`\`${flag.flag}\`\``, value: `> ${flag.description}`, inline: true })
            })
        }

        const manualEmbed = new DiscordEmbed(client).embed
            .setDescription(`\`\`NAME\`\`\n> ${command.data.name}\n\n\`\`DESCRIPTION\`\`\n> ${command.data.description}\n\n${commandSubCommands.length > 0 ? `\`\`SUBCOMMANDS\`\`\n> ${commandSubCommands.join(",")}\n:bulb: **TIP**: \`\`/man <command_name> [subcommand_name]\`\` for subcommand manual` : ""}${command.validFlags ? "\n\n**__FLAGS__**" : ""}`)
            .addFields(...fieldsArray)

        await interaction.reply({ embeds: [manualEmbed] })
    }
}