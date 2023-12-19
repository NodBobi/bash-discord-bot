import { SlashCommandBuilder, Client, ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder, EmbedField } from "discord.js";
import { DiscordEmbed } from "../../../utils/classes/DiscordEmbed";

const applicationCommandOptionTypes: any = {
    1: "subcommand",
    2: "subcommandgroup",
    3: "string",
    4: "integer",
    5: "boolean",
    6: "user",
    7: "channel/category",
    8: "role",
    9: "mentionable",
    10: "number",
    11: "attachment",
}

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

        let commandSubCommands: string[] = []

        command.data.options.forEach((option: any) => {
            if (option instanceof SlashCommandSubcommandBuilder) {
                commandSubCommands.push(option.name)
            }
        })

        let fieldsArray: EmbedField[] = []

        if(command.data.options) {
            fieldsArray.push({
                name: "**__OPTIONS__**",
                value: "All the options the command has and info about them.",
                inline: false
            })
            command.data.options.forEach((option: any) => {
                if(option instanceof SlashCommandSubcommandBuilder) return;
                fieldsArray.push({
                    name: `\`\`${option.name}\`\``,
                    value: `> **Description**: ${option.description}\n> **Type**: \`\`${applicationCommandOptionTypes[option.type]}\`\`\n > **Required**: \`\`${option.required}\`\`\n`,
                    inline: true,
                })
            })
        }

        if(command.permissions) {
            fieldsArray.push({
                name: "``REQUIRED PERMISSIONS``",
                value: `\`\`\`hs\n${command.permissions.join(", ")}\`\`\``,
                inline: false,
            })
        }

        if (command.validFlags) {
            fieldsArray.push({
                name: "\n\n**__FLAGS__**",
                value: "Additional flags that the command may take",
                inline: false
            })
            command.validFlags.forEach((flag: any) => {
                fieldsArray.push({ name: `\`\`${flag.flag}\`\``, value: `> ${flag.description}`, inline: true })
            })
        }

        const manualEmbed = new DiscordEmbed(client).embed
            .setDescription(`\`\`NAME\`\`\n> ${command.data.name}\n\n\`\`DESCRIPTION\`\`\n> ${command.data.description}\n\n${commandSubCommands.length > 0 ? `\`\`SUBCOMMANDS\`\`\n> ${commandSubCommands.join(",")}\n:bulb: **TIP**: \`\`/man <command_name> [subcommand_name]\`\` for subcommand manual\n\n` : ""}`)
            .addFields(...fieldsArray)

        await interaction.reply({ embeds: [manualEmbed] })
    }
}