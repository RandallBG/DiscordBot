const Discord = require("discord.js");
const client = new Discord.Client();
require("dotenv").config();

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
    if(msg.content === "ping") {
        msg.reply("pong");
    }
});

client.on('message', async message =>{
    //voice only works in guilds, if the message 
    //does not come from a guild then ignore it
    if(!message.guild) return;

    if(message.content === '/join'){
        //only try to join the senders voice channel
        if(message.member.voice.channel){
            const connection = await message.member.voice.channel.join();
        } else{
            message.reply("You need to join a voice channel first!");
        }
    }
});

client.login(process.env.TOKEN);
