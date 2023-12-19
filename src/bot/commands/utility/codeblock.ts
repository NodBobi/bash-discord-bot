import { Client, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption, ModalBuilder, TextInputBuilder, ActionRowBuilder, ModalActionRowComponentBuilder, TextInputStyle } from "discord.js";
import { DiscordEmbed } from "../../../utils/classes/DiscordEmbed";
import * as prettier from 'prettier'

const languages: any = {
    javascript: { parser: "flow", name: "javascript" },
    typescript: { parser: "typescript", name: "typescript" },
    python: { parser: null, name: "python (formatting not available)" },
    rust: { parser: null, name: "rust (formatting not available)" },
    golang: { parser: null, name: "golang (formatting not available)" },
    v: { parser: null, name: "v-lang (formatting not available)" },
    json: { parser: "json", name: "json" },
    yaml: { parser: "yaml", name: "yaml" },
    jsx: { parser: "babel", name: "jsx" },
    tsx: { parser: "babel-ts", name: "tsx" },
    vue: { parser: "vue", name: "vue" },
    angular: { parser: "angular", name: "angular" },
    html: { parser: "html", name: "html" },
    markdown: { parser: "markdown", name: "markdown" },
}

const languageData: any = Object.keys(languages).map((value) => {
    return {
        name: languages[value].name,
        value
    }
})

export = {
    data: new SlashCommandBuilder()
        .setName("codeblock")
        .setDescription("Quickly make beautifully formatted codeblocks from a set of pre-defined programming languages")
        .addStringOption((option: SlashCommandStringOption) =>
            option
                .setName("language")
                .setDescription("The programming language to format")
                .addChoices(...languageData)
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const language = interaction.options.getString("language")!

        const askSourceCodeModal = new ModalBuilder()
        .setCustomId("sourceCodeModal")
        .setTitle("Code block builder")

        const sourceCodeTextField = new TextInputBuilder()
        .setValue("")
        .setMaxLength(2000)
        .setCustomId("sourceCodeInput")
        .setLabel(`Paste your ${language} source code here`)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)

        const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(sourceCodeTextField)
        askSourceCodeModal.addComponents(actionRow)

        await interaction.showModal(askSourceCodeModal)
        try {
            const submit = await interaction.awaitModalSubmit({ filter: (interaction) => interaction.customId === "sourceCodeModal", time: 120000 })
            try {
                const formattedCode = languages[language].parser ? await prettier.format(`${submit.fields.getField("sourceCodeInput").value}`, { semi: false, parser: languages[language].parser }) : submit.fields.getField("sourceCodeInput").value

                const codeBlockReplyEmbed = new DiscordEmbed(client).embed
                .setDescription(`\`\`\`diff\n+ HERE'S THE CODE. COPY IT FROM THE TOP RIGHT CORNER  \`\`\`\n\n\`\`\`${language}\n${formattedCode}\`\`\``)
                .setColor("Green")

                await submit.reply({ embeds: [codeBlockReplyEmbed] })
            } catch (error) {
                const codeParsingErrorEmbed = new DiscordEmbed(client).embed
                .setDescription(`\`\`\`diff\n- SNIPPER PARSING ERROR\`\`\`\n> **There was an error while parsing your code snippet.**\n> Check your code is formatted correctly, because the code parser could not parse your code.\n\`\`\`${error}\`\`\``)
                .setColor("Red")
                return await submit.reply({ embeds: [codeParsingErrorEmbed] })
            }
        } catch (error) {
            const errorEmbed = new DiscordEmbed(client).embed
            .setDescription(`\`\`\`diff\n- INTERACTION TIMEOUT\`\`\`\n> <@${interaction.user.id}> where did you go? You never echoed back. I guess you found something better to do?\n`)
            .setColor("Red")
            return await interaction.followUp({ embeds: [errorEmbed] })
        }
    }
}