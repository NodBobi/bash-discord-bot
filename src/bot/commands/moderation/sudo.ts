import { SlashCommandBuilder, ChatInputCommandInteraction, Client, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { DiscordEmbed } from "../../../utils/classes/DiscordEmbed";

export = {
    data: new SlashCommandBuilder()
        .setName("sudo")
        .setDescription("Command for administrative purposes.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("mod")
                .setDescription("Do moderation operations.")
                .addStringOption(option =>
                    option
                        .setName("action")
                        .setDescription("Choose the action to use")
                        .addChoices(
                            { name: "Ban", value: "sudo_mod_ban" },
                            { name: "Kick", value: "sudo_mod_kick" },
                            { name: "Mute", value: "sudo_mode_mute" }
                        )
                        .setRequired(true)
                )
                .addUserOption(option =>
                    option
                        .setName("member")
                        .setDescription("Select a target user")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("flags")
                        .setDescription("Additional flags to use")
                )
        ),

    permissions: ["BAN_MEMBERS", "KICK_MEMBERS", "MUTE_MEMBERS"],

    validFlags: [
        {
            flag: ["-y", "--yes"],
            parsedFlag: ["y", "yes"],
            description: "Override any prompt that the command may ask as a yes or truthy value.",
        },
        {
            flag: ["-d", "--duration"],
            parsedFlag: ["d", "duration"],
            description: "Specify duration of the given punishment (used when using the ``mod`` subcommand.)"
        },
        {
            flag: ["-r", "--reason"],
            parsedFlag: ["r", "reason"],
            description: "Specify the reason of given punishment (used with the ``mod`` subcommand.)"
        }
    ],

    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        switch (interaction.options.getSubcommand()) {
            case "mod":
                const action = interaction.options.getString("action")
                const targetUser = interaction.options.getUser('member')
                const flags = interaction.options.getString("flags")

                switch (action) {
                    case "sudo_mod_ban":
                        let banData = {}

                        if (!interaction.memberPermissions?.has("BanMembers")) return await interaction.reply({ content: "``Permission denied``, you need to have **BAN_MEMBERS** permissions." })
                        if (interaction.user.id === targetUser!.id) return await interaction.reply({ content: "Why'd you want to ban yourself? Lets not do that." })
                        //if(targetUser?.id === client.user?.id) return await interaction.reply({ content: "You can't ban me lol." })

                        if(flags) {
                            console.log("ALL THE FLAGS", flags)
                            const parsedFlags = flags.split("-").join("").trim().split(" ")
                            console.log("PARSED FLAGS:", parsedFlags)
                        }

                        const confirmBanEmbed = new DiscordEmbed(client).embed
                            .setDescription(`\`\`\`diff\n- CONFIRM YOUR ACTION\`\`\`\n> You are about to ban user <@${targetUser?.id}>\n\`\`\`hs\nDO YOU WANT TO BAN THIS USER?  \`\`\``)
                            .setColor("Yellow")

                        const confirmButton = new ButtonBuilder()
                            .setLabel("CONFIRM BAN")
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId("sudo_mod_ban_confirm")

                        const cancelButton = new ButtonBuilder()
                            .setLabel("CANCEL")
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId("sudo_mod_ban_cancel")

                        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(confirmButton, cancelButton)

                        const reply = await interaction.reply({ embeds: [confirmBanEmbed], components: [buttonRow] })

                        const responseCollectionFilter = (i: any) => i.user.id === interaction.user.id
                        try {
                            const confirmation = await reply.awaitMessageComponent({ filter: responseCollectionFilter, time: 10_000 })

                            if (confirmation.customId === "sudo_mod_ban_confirm") {
                                client.log.info(`${targetUser?.displayName} will was banned from the guild`)

                                const banSuccessEmbed = new DiscordEmbed(client).embed
                                    .setColor("Green")
                                    .setDescription(`\`\`\`diff\n+ Member banned!\`\`\`\n> \`\`MODERATOR:\`\` <@${interaction.user.id}>\n> \`\`TARGET:\`\` <@${targetUser?.id}>\n> \`\`TIMESTAMP:\`\`<t:${Math.floor(Date.now() / 1000)}:F>`)
                                await confirmation.update({ embeds: [banSuccessEmbed], components: [] })
                            } else if (confirmation.customId === "sudo_mod_ban_cancel") {
                                const banCancelledEmbed = new DiscordEmbed(client).embed
                                    .setColor("Red")
                                    .setDescription('```diff\n- ACTION CANCELLED!```\n> Successfully cancelled, no action was taken.')
                                await confirmation.update({ embeds: [banCancelledEmbed], components: [] })
                            }
                        } catch (error) {
                            const interactionTimeoutEmbed = new DiscordEmbed(client).embed
                            .setDescription(`\`\`\`diff\n- INTERACTION TIMEOUT\`\`\`\n> <@${interaction.user.id}> where did you go? You never echoed back. I guess you found something better to do?\n`)
                            .setColor("Red")
                            await interaction.editReply({ embeds: [interactionTimeoutEmbed], components: [] })
                        }
                    default:
                        break;
                }
                break;

            default:
                break;
        }
    }
}