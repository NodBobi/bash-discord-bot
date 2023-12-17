import { Client, Events, GatewayIntentBits, Collection, REST, Routes } from 'discord.js'
import * as dotenv from 'dotenv';
import fs from 'node:fs'
import path from 'node:path'

dotenv.config({ path: "../../.env" })

// Extending the base client instance
declare module "discord.js" {
    interface Client {
        commands: Collection<string, any>
    }
}

// Creating a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]})

// Add a .commands property to the client instance
client.commands = new Collection()
let allCommands: string[] = []

const commandCategoriesPath = path.join(__dirname, "commands")
const commandCategories = fs.readdirSync(commandCategoriesPath)

// Get all the command categories and commands
for(const category of commandCategories) {
    const categoryPath = path.join(commandCategoriesPath, category)
    const commands = fs.readdirSync(categoryPath).filter(file => file.endsWith(".js"))
    for(const commandName of commands) {
        const commandPath = path.join(categoryPath, commandName)
        const command = require(commandPath)
        if(command.data && command.execute) {
            allCommands.push(command.data.toJSON())
            client.commands.set(command.data.name, command)
        } else {
            console.log(`[WARN] Command ${commandPath} is missing some required fields`)
        }
    }
}

// Handle the command execution
client.on(Events.InteractionCreate, async (interaction) => {
    if(!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName)

    if(!command) {
        console.log("No command found")
    }

    try {
        await command.execute(interaction, client)
    } catch(err) {
        console.log(`[ERROR] Faced an error wheb tried to execute a command: ${err}`)
        if(interaction.replied) {
            await interaction.followUp({ content: `Well, this is awkward. This should've never happened but here we are\n${err}`, ephemeral: true })
        } else {
            await interaction.reply({ content: `Well, this is awkward. This should've never happened but here we are\n${err}`, ephemeral: true })
        }
    }
})

// Registering all the commands:
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!)
const guildId: string = process.env.DISCORD_GUILD_ID!
const clientId: string = process.env.DISCORD_CLIENT_ID!
const deployCommands = async() => {
    try {
        console.log(`[COMMAND RELOAD] Reloading ${allCommands.length} commands...`)
        const data: any = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: allCommands })
        console.log(`[COMMAND RELOAD] Succesfully reloaded ${data.length} commands!`)
    } catch (error) {
        console.log(`[RELOAD ERROR] Error while reloading a command:`, error)
    }
};

deployCommands()

// Start the bot
client.once(Events.ClientReady, (client: Client) => {
    console.log(`[READY] Logged in as ${client.user?.displayName} at ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`)
})

client.login(process.env.DISCORD_BOT_TOKEN)