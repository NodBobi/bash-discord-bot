import { SlashCommandBuilder, ChatInputCommandInteraction, Client, ButtonBuilder, ButtonStyle, ActionRowBuilder, ButtonInteraction, DiscordAPIError } from "discord.js";
import { DiscordEmbed } from "../../../utils/classes/DiscordEmbed";
import { Button } from "../../../utils/classes/Button";

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
                const targetUser = interaction.options.getUser('member')!
                const flags = interaction.options.getString("flags")

                switch (action) {
                    case "sudo_mod_ban":
                        let banData = {}

                        if (!interaction.memberPermissions?.has("BanMembers")) return await interaction.reply({ content: "``Permission denied``, you need to have **BAN_MEMBERS** permissions." })
                        if (interaction.user.id === targetUser.id) return await interaction.reply({ content: "I'm not going to ban you as long as you're trying to do it yourself. Nice try tho." })
                        if (targetUser.id === client!.user!.id) return await interaction.reply({ content: "You want to remove me, huh? I cannot ban myself sadly." })

                        if(flags) {
                            console.log("ALL THE FLAGS", flags)
                            const parsedFlags = flags.split("-").join("").trim().split(" ")
                            console.log("PARSED FLAGS:", parsedFlags)
                        }

                        const confirmBanEmbed = new DiscordEmbed(client).embed
                            .setDescription(`\`\`\`diff\n- CONFIRM YOUR ACTION\`\`\`\n> You are about to ban user <@${targetUser?.id}>\n\`\`\`hs\nDO YOU WANT TO BAN THIS USER?  \`\`\``)
                            .setColor("Yellow")


                        const confirmBanButton = new Button(client, {
                            id: "sudo_mod_confirm_ban_button",
                            text: "BAN USER",
                            style: ButtonStyle.Danger,
                            onInteraction: async function(client: Client, buttonInteraction: ButtonInteraction) {
                                try {
                                    if(interaction.user.id !== buttonInteraction.user.id) return;
                                    await interaction.guild?.bans.create(`${targetUser?.id}`)   
                                } catch (error) {
                                    console.log(error)
                                    await interaction.editReply({ content: `Well something went horribly wrong here\nERROR: ${error}`, embeds: [], components: [] })
                                }
                            }
                        })

                        const cancelBanButton = new Button(client, {
                            id: "sudo_mod_ccancel_ban_button",
                            text: "CANCEL",
                            style: ButtonStyle.Secondary,
                            onInteraction: async function(client: Client, buttonInteraction: ButtonInteraction) {
                                try {
                                    interaction.editReply({ content: "Ban cancelled, no action was taken. Let peace be with us.", embeds: [], components: [] })
                                } catch (error) {
                                    await interaction.editReply({ content: `Well something went horribly wrong here\nERROR: ${error}`, embeds: [], components: [] })
                                }
                            }
                        })

                        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(confirmBanButton.button, cancelBanButton.button)

                        await interaction.reply({ embeds: [confirmBanEmbed], components: [buttonRow] })
                    default:
                        break;
                }
                break;

            default:
                break;
        }
    }
}