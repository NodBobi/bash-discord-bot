/*
Wrapper class around the ButtonBuilder API.
Use the onInteraction property to handle the buttons clicks. 
This makes the code way cleaner and do not need to pass every custom_button_id to events folder.
*/

import { ButtonStyle, Client, ButtonBuilder } from "discord.js"

interface IConstructorOptions {
    style: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger | ButtonStyle.Link,
    text: string,
    id: string,
    disabled?: Boolean,
    onInteraction?: Function,
}


export class Button {
    onInteraction: Function
    button: ButtonBuilder

    constructor(client: Client, options: IConstructorOptions) {
        /* 
        If the onInteraction function is not passed, set the onInteraction function to be 
        just an empty function so that it will still always be a function
        */
        this.onInteraction = options.onInteraction ? options.onInteraction : async function() { return; }
        this.button = new ButtonBuilder()
            .setStyle(options.style)
            .setCustomId(options.id)
            .setLabel(options.text)

        client.buttons.set(options.id, this)
    }
}