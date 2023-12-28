/*
    TODO:
    - Make a button handler class to handle button interactions.
*/


import { Client, Events, GatewayIntentBits, Collection, REST, Routes, VoiceState, Channel, ThreadChannel, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, GuildMember } from 'discord.js'
import * as dotenv from 'dotenv';
import fs from 'node:fs'
import path from 'node:path'
import pkg from '../../package.json'
import { Logger } from '../utils/logger'
import { Button } from '../utils/classes/Button';

dotenv.config({ path: "/home/luukas/Code/Projects/bash-bot/.env" })

// Extending the base client instance
declare module "discord.js" {
    interface Client {
        commands: Collection<string, any>
        categories: String[]
        log: Logger
        version: string
        buttons: Map<string, Button>
        serverConfig: {
            channels: Map<string, string>
        }
    }
}

// Creating a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] })

// Attach logger to the client instance
client.log = new Logger({})

// Add client version to the client instance
client.version = pkg.version

/*
Add a .commands property to the client instance which holds all the bots commands
and their corresponding command handlers.
*/
client.commands = new Collection()
let allCommands: string[] = []

/* 
Add a map which will hold each buttons custom ids and their corresponding
ButtonBuilder object (holds the button data such as style, button label, etc.) 
and onInteraction function which will be fired on button click.
*/
client.buttons = new Map()

/*
Add a server config property to the client instace which holds configuration of
the server the bot is in. 
*/

// Fix the any type below someday:D
const defaultChannelConfig: any[] = [["help-forum-category", "1187300552393113641"]] 

client.serverConfig = {
    channels: new Map(defaultChannelConfig)
}

const commandCategoriesPath = path.join(__dirname, "commands")
const commandCategories = fs.readdirSync(commandCategoriesPath)
client.categories = commandCategories

// Get all the command categories and commands
for (const category of commandCategories) {
    const categoryPath = path.join(commandCategoriesPath, category)
    const commands = fs.readdirSync(categoryPath).filter(file => file.endsWith(".js"))
    for (const commandName of commands) {
        const commandPath = path.join(categoryPath, commandName)
        const command = require(commandPath)
        if (command.data && command.execute) {
            allCommands.push(command.data.toJSON())
            client.commands.set(command.data.name, command)
        } else {
            client.log.warn(`Command ${commandPath} is missing some required fields`)
        }
    }
}

// Handle events from events folder:
const eventsFolder = fs.readdirSync(`${__dirname}/events/`)
for (const eventFile of eventsFolder) {
    if (eventFile.endsWith(".js")) {
        const eventFilePath = `${__dirname}/events/${eventFile}`
        const event = require(`${__dirname}/events/${eventFile}`)
        if ('once' in event && 'type' in event && 'execute' in event) {
            client.log.info(`Registering event: ${event.type}`)
            if (event.once) {
                client.once(event.type, (...args) => event.execute(client, args))
            } else {
                client.on(event.type, (...args) => event.execute(client, args))
            }
        } else {
            client.log.warn(`Some required fields are missing from ${eventFilePath}`)
        }
    }
}

// Handle the interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) return;

    try {
        await command.execute(interaction, client)
    } catch (err) {
        client.log.error(`Error while executing a command: ${err}`)
        if (interaction.replied) {
            await interaction.followUp({ content: `Well, this is awkward. This should've never happened but here we are\n${err}`, ephemeral: true })
        } else {
            await interaction.reply({ content: `Well, this is awkward. This should've never happened but here we are\n${err}`, ephemeral: true })
        }
    }
})

// Registering all the commands to the guild:
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!)
const guildId: string = process.env.DISCORD_GUILD_ID!
const clientId: string = process.env.DISCORD_CLIENT_ID!
const deployCommands = async () => {
    try {
        client.log.info(`Reloading ${allCommands.length} commands...`)

        /*
        This will reload all the commands in the guild mentioned in the guildId parameter.
        It will make a PUT reques to discords API, something like: https://discord.com/api/v10/applications/:applicationID/commands/:guildID
        The REST is just a helper class to get easiner interaction with the discord api.
        */
        const data: any = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: allCommands })
        client.log.info(`Succesfully reloaded ${data.length} commands!`)
    } catch (error) {
        client.log.error(`Error while reloading a command: ${error}`)
    }
};

deployCommands()

// Start the bot
client.once(Events.ClientReady, (client: Client) => {
    client.log.ready(`Logged in as ${client.user?.displayName}`)
})

client.login(process.env.DISCORD_BOT_TOKEN)