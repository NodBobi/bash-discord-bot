import { Client, Events, ThreadChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } from "discord.js";
import { DiscordEmbed } from "../../utils/classes/DiscordEmbed";
import { Button } from "../../utils/classes/Button";

export = {
    type: Events.ThreadCreate,
    once: false,
    async execute(client: Client, args: any) {
        const [ channel ]: [ ThreadChannel ] = args
        
        // Check if the channel is thread and that the parentID is the forum channel id
        if (channel.isThread() && channel.parentId === "1187300552393113641") {
            try {
                const searchQuery = channel.name
                const rawData = await fetch(`https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&site=stackoverflow&q=${searchQuery}`)
                const { items } = await rawData.json()

                // If there's no items (stackoverflow questions) found, throw to get out of the if condition
                if (!items.length) throw `No relevant stackoverflow question matches found for query "${searchQuery}"`;

                const relevantStackoverflowQuestions = items.slice(0, 5).map((data: any, idx: number) => {
                    return `${idx + 1}: [${data.title}](${data.link})`
                }).join("\n")

                const embed = new DiscordEmbed(client).embed
                    .setTitle("These resources might be handy:")
                    .setDescription(relevantStackoverflowQuestions)
                    .setColor("Orange")
                    .setThumbnail("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ficonape.com%2Fwp-content%2Fpng_logo_vector%2Fstack-overflow-icon.png&f=1&nofb=1&ipt=b9890fdbd3c05f6062e8435341bbd3918f4215d77bed0f9773f806a581ca064b&ipo=images")

                channel.send({ embeds: [embed] })
            } catch (error) {
                client.log.error(error)
            }

            const archiveThreadButton = new Button(client, {
                id: "thread_archive_button",
                style: ButtonStyle.Success,
                text: "Mark as solved",
                onInteraction: async function (client: Client, interaction: ButtonInteraction) {
                    if (interaction.user.id !== channel.ownerId) return;

                    /* 
                    When the user interacts with the button, it will change the thread name to <previous name> + (solved)
                    and the button text will be changed to "Thread has been solved"
                    */
                    await channel.setName(`${channel.name} (solved)`)
                    console.log(channel.appliedTags)
                    const setDisabledButton = client.buttons.get(interaction.customId)?.button.setDisabled(true).setLabel("Thread has been solved")!
                    const updatedActionRow = new ActionRowBuilder<ButtonBuilder>()
                        .setComponents(setDisabledButton)

                    await interaction.update({ components: [updatedActionRow] })
                    await channel.setArchived(true)
                    await channel.send(":card_box: This forum post has been archived, as the owner marked it as solved.")
                }
            })

            const actionRow = new ActionRowBuilder<ButtonBuilder>()
                .setComponents(archiveThreadButton.button)

            const message = await channel.send({
                content: `
            **__GENERAL RULES__**
            \n- Use codeblocks to format your code
            \n- If you found an answer to your question, click the button below.
            `,
                components: [actionRow]
            })
        }
    }
}