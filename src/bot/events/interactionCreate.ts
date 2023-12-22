import { Events, Client, Interaction } from "discord.js";

export = {
    type: Events.InteractionCreate,
    once: false,
    async execute(client: Client, args: any) {
        const [interaction]: [Interaction] = args

        // Check if it's a button interaction and see if it's registered with a custom id in client.buttons Map
        if (interaction.isButton() && interaction.customId && client.buttons.get(interaction.customId)) {
            return client.buttons.get(interaction.customId)!.onInteraction(client, interaction)
        }
    }
}