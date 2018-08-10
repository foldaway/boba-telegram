const Telegraf = require('telegraf')

const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

var request = require("request")

var geoLib = require("geolib")

const Telegraf = require('telegraf');

const API_TOKEN = process.env.API_TOKEN || '620657925:AAH9wR8PRpeM8anERWSnr_QWdYXLf9deL84';
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://boba-telegram.herokuapp.com';

const bot = new Telegraf(API_TOKEN);
bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
bot.startWebhook(`/bot${API_TOKEN}`, null, PORT)

var url = "https://bottleneckco.github.io/boba-scraper/data.json"
var data;
request({
    url: url,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
    	data = body;
    }
})
var nearestLiho = {title:"", address:"", phone:"", latitude: 0, longitude:0, distance:0};
var nearestKoi = {title:"", address:"", phone:"", latitude: 0, longitude:0, distance:0};
var nearestGongCha = {title:"", address:"", phone:"", latitude: 0, longitude:0, distance:0};

bot.start((ctx)=>{
	return ctx.reply('Send your location.', Extra.markup((markup) => {
    return markup.resize()
      .keyboard([
        markup.locationRequestButton('Send location')
      ])
  	}))
})

bot.on('location', (ctx) => {
	for (var i = 0; i < data.length; i++){
		var result = geoLib.getDistance(
			{latitude: ctx.message.location.latitude, longitude: ctx.message.location.longitude},
			{latitude: data[i].location.LATITUDE, longitude: data[i].location.LONGITUDE}
		);
		if (data[i].chain == "Koi"){
			if ((nearestKoi.distance == 0) || (nearestKoi.distance > result)){
				nearestKoi.title = data[i].title;
				nearestKoi.address = data[i].address;
				nearestKoi.phone = data[i].phone;
				nearestKoi.latitude = data[i].location.LATITUDE;
				nearestKoi.longitude = data[i].location.LONGITUDE;
				nearestKoi.distance = result;
			}
		} else if (data[i].chain == "LiHO"){
			if ((nearestLiho.distance == 0) || (nearestLiho.distance > result)){
				nearestLiho.title = data[i].title;
				nearestLiho.address = data[i].address;
				nearestLiho.phone = data[i].phone;
				nearestLiho.latitude = data[i].location.LATITUDE;
				nearestLiho.longitude = data[i].location.LONGITUDE;
				nearestLiho.distance = result;
			}
		} else if (data[i].chain == "Gong Cha"){
			if ((nearestGongCha.distance == 0) || (nearestGongCha.distance > result)){
				nearestGongCha.title = data[i].title;
				nearestGongCha.address = data[i].address;
				nearestGongCha.phone = data[i].phone;
				nearestGongCha.latitude = data[i].location.LATITUDE;
				nearestGongCha.longitude = data[i].location.LONGITUDE;
				nearestGongCha.distance = result;
			}
		}
	}
	ctx.reply(`Nearest Koi\n${nearestKoi.title}\n${nearestKoi.address}\n${nearestKoi.phone}\n${nearestKoi.distance}m`);
	ctx.replyWithLocation(nearestKoi.latitude, nearestKoi.longitude);
});

bot.command('nearby', (ctx)=>{
	return ctx.reply('Send your location.', Extra.markup((markup) => {
    return markup.resize()
      .keyboard([
        markup.locationRequestButton('Send location')
      ])
  	}))
})

bot.startPolling()
