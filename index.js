const Discord = require("discord.js");
const client = new Discord.Client();
const Youtube = require("discord-youtube-api");
require("dotenv").config();
const youtube = new Youtube(process.env.YOUTUBE_API);
const fs = require("fs");
const ytdl = require("ytdl-core");

let playList = [];

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message =>{
    //voice only works in guilds, if the message 
    //does not come from a guild then ignore it
    if(!message.guild) return;

    if(message.content.includes("!play")){
        //only try to join the senders voice channel
        if(message.member.voice.channel){
            const connection = await message.member.voice.channel.join();
            //slice off the command of !play to return a string of 
            //the url they wish to play or the text they wish 
            //to search for

            let songUrl = message.content.slice(6);

            let stream = ytdl(songUrl,{filter: 'audioonly'});
            stream.on('error', console.error);
            let dispatcher = await connection.play(stream);
           
            
        } else{
            message.reply("You need to join a voice channel first!");
        }
    }
    if(message.content.includes("!play")){
        
    }
});

client.login(process.env.TOKEN);
