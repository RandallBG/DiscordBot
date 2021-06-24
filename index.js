const Discord = require("discord.js");
const client = new Discord.Client();
const Youtube = require("discord-youtube-api");
require("dotenv").config();
const youtube = new Youtube(process.env.YOUTUBE_API);
const fs = require("fs");
const ytdl = require("ytdl-core");
const { url } = require("inspector");

//array used to store a list of songs to be played
//every #play function will add a song to the end of the list
//when a song is finished we will move to the next in the list
let playList = [];

//function to play a song. requires a connection to a voice channel and 
//the url of the song to play
function PlaySong(connection, url){
    
    let stream = ytdl(url,{ filter: 'audioonly'});
    stream.on('error', () =>{
        console.log("error playing next song");
    });
    let dispatcher = connection.play(stream);

    //on finish call the play next song function
    //to continue playing songs in the playlist
    dispatcher.on('finish', ()=>{
        PlayNextSong(connection);
    });
}

//Play the next song in the array if there is one
function PlayNextSong(connection){
    //shift the current song off the list and begin playing
    //the next one if there is one
    playList.shift();

    if(playList.length === 0){
        return;
    } else{
        PlaySong(connection, playList[0]);
    }
}

//Add song to list and let the user know.
function AddSong(message, url){
    playList.push(url);
    message.reply(`Adding ${url} to the playlist`);
}

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message =>{
    //voice only works in guilds, if the message 
    //does not come from a guild then ignore it
    if(!message.guild) return;

    if(message.content.includes("#play")){
        //only try to join the senders voice channel
        if(message.member.voice.channel){
            
            //join channel of message sender
            let connection = await message.member.voice.channel.join();
            
            //slice off the command of !play to return a string of 
            //the url they wish to play or the text they wish 
            //to search for
            let songUrl = message.content.slice(6);

            //we only want to begin playing a song on the first song, subsequent
            //songs will then just be pushed to the playlist array and the current
            //song will continue playing.
            if(playList.length === 0){
                AddSong(message, songUrl);
                PlaySong(connection, playList[0]);
            }else
            {
                //only add the song if there is currently a song playing.
                //the playsong function will automatically begin the next song
                //in the list if there is one
                AddSong(message, songUrl);
            }           
        } else{
            message.reply("You need to join a voice channel first!");
        }
    }

    //fun little audio file played reference from theminutehour skit
    if(message.content === "#tellemboys"){
        if(message.member.voice.channel){
        let connection = await message.member.voice.channel.join();
            connection.play("tellEmBoys.mp3");
        }
    }
    
    //another fun little audio file from the same skit
    if(message.content === "#fuckoffboys"){
        if(message.member.voice.channel){
            let connection = await message.member.voice.channel.join();
            let dispatcher = connection.play("fuckOffBoys.mp3");

            dispatcher.on('finish', () =>{
                 connection = message.member.voice.channel.leave();
             });
        }
        
        
    }
});

client.login(process.env.TOKEN);
