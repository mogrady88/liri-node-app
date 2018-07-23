var dotenv = require("dotenv").config();

var fs = require('fs');
var keys = require("./keys.js");
var Twitter = require('twitter');
var request = require('request');
var inquirer = require('inquirer');
var Spotify = require('node-spotify-api');

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

var userChoice = "";
var action = "";
var d = new Date();

//------------------------- Inquirer Prompt ------------------------------------//

inquirer.prompt([
    {
        type: 'list',
        message: 'What would you like to do?',
        choices: ['Check Tweets','Spotify a song','Look up a movie','Do whatever'],
        name: 'selection'
    }
])
.then(function(inquirerResponse){
    if (inquirerResponse.selection == "Check Tweets"){
        action = "my-tweets";
        fs.appendFile("log.txt",d+" - "+action+" "+userChoice);
        runCases();
    }else
    if (inquirerResponse.selection == "Spotify a song"){
        action = "spotify-this-song";

        inquirer
        .prompt([
            {
                type: 'input',
                message: 'Artist',
                name: 'artist'
            },
            {
                type: 'input',
                message: 'Song title',
                name: 'song'
            }
        ])
        .then(function(inquirerSong){
            if (!inquirerSong.artist && !inquirerSong.song){
                userChoice = "The Sign Ace of Base";
            }else{
                userChoice = inquirerSong.song+" "+inquirerSong.artist;
            }
            fs.appendFile("log.txt",d+" - "+action+" "+userChoice);
            runCases();
        })
    }else
    if (inquirerResponse.selection == "Look up a movie"){
        action = "movie-this";

        inquirer
        .prompt([
            {
                type: 'input',
                message: 'Type your movie',
                name: 'movie'
            }
        ])
        .then(function(inquirerMovie){
            if (!inquirerMovie.movie){
                userChoice = "Mr. Nobody";
            }else{
                userChoice = inquirerMovie.movie;
            }
            fs.appendFile("log.txt",d+" - "+action+" "+userChoice);
            runCases();
        })
    }else
    if (inquirerResponse.selection == "Do whatever"){
        action = "do-what-it-says";
        fs.appendFile("log.txt",d+" - "+action+" "+userChoice);
        runCases();
    }
    
})

//------------------------- Cases ------------------------------------//
function runCases(){
switch(action){
    case "my-tweets":
      runTwitter();
    break;

    case "spotify-this-song":
      runSpotify();
    break;

    case "movie-this":
        runMovie();
    break;

    case "do-what-it-says":
    runDoWhatItSays();
    break;
}
}

//------------------------- Functions ------------------------------------//
function runMovie(){
    request("http://www.omdbapi.com/?t="+userChoice+"+&apikey=trilogy", function(error, response, body) {
        if (!error && response.statusCode === 200) {
           var body = JSON.parse(body);
           console.log("");
           console.log(body.Title);
           console.log("Released: "+ body.Released);
           console.log("IMDB Rating: "+body.Ratings[0].Value);
           console.log("Rotten Tomatoes Rating: "+body.Ratings[1].Value);
           console.log("Released in: "+body.Country);
           console.log("Languages available: "+body.Language);
           console.log("Plot summary: "+body.Plot);
           console.log("Actors: "+body.Actors);
        }
      });
}

function runSpotify(){
        spotify.search({type: "track" ,query: userChoice, limit: 1}, function(err,data){
            if(err){
                return console.log(err);
            } 
            console.log("");
            console.log("Artist: "+data.tracks.items[0].artists[0].name);
            console.log("Track: "+data.tracks.items[0].name);
            console.log("Listen: "+data.tracks.items[0].external_urls.spotify);
            console.log("Album: "+data.tracks.items[0].album.name);
        });
}

function runTwitter(){

    var params = {
        q: 'MarkOgrady16',
        count: 20
        };

    client.get("search/tweets", params, function (error, tweets, response){
        if (error){
            console.log(error);
        }
        for(i = 0;i < tweets.statuses.length;i++){
        console.log(tweets.statuses[i].text);
    }
      });
}

function runDoWhatItSays(){
    fs.readFile("random.txt", "utf8", function(error, data){
        if (error){
            console.log(error);
        }
        var dataArray = data.split(",");
        // console.log(dataArray);
        userChoice = dataArray[1];
        switch(dataArray[0]){
            case "my-tweets":
                runTwitter();
            break;
            case "spotify-this-song":
                runSpotify();
            break;
            case "movie-this":
                runMovie();
            break;
        }
    })
}