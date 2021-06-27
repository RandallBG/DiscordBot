const Discord = require("discord.js");
const client = new Discord.Client();
const Youtube = require("discord-youtube-api");
require("dotenv").config();
const youtube = new Youtube(process.env.YOUTUBE_API);
const fs = require("fs");
const ytdl = require("ytdl-core");

//array used to store songs
let playList = [];

//function to play a song. requires a connection to a voice channel and 
//the url of the song to play
function PlaySong(connection, url){
    
    let stream = ytdl(url,{ filter: 'audioonly'});
    stream.on('error', () =>{
        console.log("error playing next song");
        console.log(url);
    });
    let dispatcher = connection.play(stream);

    //on finish call the play next song function
    //to continue playing songs in the playlist
    dispatcher.on('finish', ()=>{
        PlayNextSong(connection);
    });
}

//search for song return its url if it is valid
async function searchYoutube(searchParam){
    if (ytdl.validateURL(searchParam)) {
        return searchParam;
    } else
    {
        let video = await youtube.searchVideos(searchParam);
        console.log(video.url);
        return video.url;
    }
}

//Play the next song in the array if there is one
function PlayNextSong(connection){
    //remove last song
    playList.shift();
    if(playList.length === 0){
        connection.channel.leave();
    } else{
        PlaySong(connection, playList[0]);
    }
}

//Add song to list and let the user know.
function AddSong(url){
    playList.push(url);
}

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message =>{
    //ignore message if doesn't come from guild
    if(!message.guild) return;

    if(message.content.includes("#play")){
        //only try to join the senders voice channel
        if(message.member.voice.channel){
            
            //join channel of message sender
            let connection = await message.member.voice.channel.join();
            
            //slice command off
            let songUrl = message.content.slice(6);
            //if array is empty begin playing song otherwise add to queue
            if(playList.length === 0){
                AddSong(await searchYoutube(songUrl));
                PlaySong(connection, await searchYoutube(songUrl));
            }else
            {
                AddSong(await searchYoutube(songUrl));
            }           
        } else{
            message.reply("You need to join a voice channel first!");
        }
    }

    //fun little audio file played reference from theminutehour skit
    if(message.content === "#tellemboys"){
        if(message.member.voice.channel){
        playList.length = 0;
        let connection = await message.member.voice.channel.join();
            connection.play("tellEmBoys.mp3");
        }
    }
    
    //another fun little audio file from the same skit
    if(message.content === "#fuckoffboys"){
        if(message.member.voice.channel){

            playList.length = 0;
            let connection = await message.member.voice.channel.join();
            let dispatcher = connection.play("fuckOffBoys.mp3");

            dispatcher.on('finish', () =>{
                 connection = message.member.voice.channel.leave();
             });
        }
    }

    if(message.content === "#skip"){
        if(message.member.voice.channel){
            let connection = await message.member.voice.channel.join();
            PlayNextSong(connection);
        }
    }
});

client.login(process.env.TOKEN);
