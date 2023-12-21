import { Client, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption, ModalBuilder, TextInputBuilder, ActionRowBuilder, ModalActionRowComponentBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, ButtonInteraction } from "discord.js";
import { DiscordEmbed } from "../../../utils/classes/DiscordEmbed";
import * as prettier from 'prettier'
import { Button } from "../../../utils/classes/Button";

interface Languages {
    [language: string]: { parser: string | null, name: string }
}

const languages: Languages = {
    javascript: { parser: "flow", name: "javascript" },
    typescript: { parser: "typescript", name: "typescript" },
    python: { parser: null, name: "python (formatting not available)" },
    rust: { parser: null, name: "rust (formatting not available)" },
    golang: { parser: null, name: "golang (formatting not available)" },
    cpp: { parser: null, name: "C++ (formatting not available)" },
    cs: { parser: null, name: "C# (formatting not available)" },
    c: { parser: null, name: "C (fomatting not available)" },
    v: { parser: null, name: "v-lang (formatting not available)" },
    sh: { parser: null, name: "shell (formatting not available)" },
    json: { parser: "json", name: "json" },
    yaml: { parser: "yaml", name: "yaml" },
    jsx: { parser: "babel", name: "jsx" },
    tsx: { parser: "babel-ts", name: "tsx" },
    vue: { parser: "vue", name: "vue" },
    angular: { parser: "angular", name: "angular" },
    html: { parser: "html", name: "html" },
    markdown: { parser: "markdown", name: "markdown" },
}

const languageData: { name: string, value: string }[] = Object.keys(languages).map((value) => {
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
        const language: string = interaction.options.getString("language")!

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
                const formattedCode = languages[language].parser ? await prettier.format(`${submit.fields.getField("sourceCodeInput").value}`, { semi: false, parser: languages[language].parser! }) : submit.fields.getField("sourceCodeInput").value

                const codeBlockReplyEmbed = new DiscordEmbed(client).embed
                    .setDescription(`\`\`\`diff\n+ HERE'S THE CODE. COPY IT FROM THE TOP RIGHT CORNER \`\`\`\n${languages[language].parser ? "" : `> :warning: Your code isn't formatted as i do not have a parser for ${language}\n`}\`\`\`${language}\n${formattedCode}\`\`\``)
                    .setColor("Green")

                const hideEmbedButton = new Button(client, {
                    id: "codeblock_hide_embed_button",
                    style: ButtonStyle.Secondary,
                    text: "Hide embed",
                    onInteraction: async function(client: Client, buttonInteraction: ButtonInteraction) {
                        try {
                            await reply.edit({ content: `\`\`\`${language}\n${formattedCode}\`\`\``, components: [], embeds: [] })
                        } catch (error) {
                            console.log(error)
                            await reply.edit({ content: `Something went horribly wrong:\nERROR: ${error}` })
                        }
                    }
                })

                const actionRow = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(hideEmbedButton.button)

                const reply = await submit.reply({ embeds: [codeBlockReplyEmbed], components: [actionRow] })

                try {
                    /*
                    We're waiting for any interaction to components attached in to the embed, if there
                     is no interaction within 60secs the promise will be rejected. If there is interaction, 
                     the promise will be resolved and the result will be assigned in to the componentInteraction
                     variable
                    */
                    const componentInteraction = await reply.awaitMessageComponent({ time: 60000 })
                    console.log("received interaction", componentInteraction)
                    if (componentInteraction.customId === "codeblock_hide_embed_button") {
                        console.log("Button clicked")
                        submit.editReply({ content: `\`\`\`${language}\n${formattedCode}\`\`\``, embeds: [], components: [] })
                    }
                    console.log("In bottom of the try catch loop")
                } catch (error) {
                    // Interaction timeout will be catched here (the user did not respond or click on the button)
                    client.log.error(`Error while receiving interaction: ${error}`)
                }
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