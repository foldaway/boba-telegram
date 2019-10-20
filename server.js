const Telegraf = require('telegraf');

const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');

const { leave } = Stage;

const request = require('request');

const geoLib = require('geolib');

const API_TOKEN = process.env.API_TOKEN || '620657925:AAH9wR8PRpeM8anERWSnr_QWdYXLf9deL84';
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://boba-telegram.herokuapp.com';

const bot = new Telegraf(API_TOKEN);
bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
bot.startWebhook(`/bot${API_TOKEN}`, null, PORT);

/**
 * @typedef OutletLocation
 * @property {number} LATITUDE
 * @property {number} LONGITUDE
 */

/**
 * @typedef Outlet
 * @property {string} chain
 * @property {string} title
 * @property {string} address
 * @property {string} phone
 * @property {string} distance
 * @property {OutletLocation} location
 */

const url = 'https://bottleneckco.github.io/sg-scraper/boba.json';
let data = 0;
request({
  url,
  json: true,
}, (error, response, body) => {
  if (!error && response.statusCode === 200) {
    data = body;
  }
});
let nearestLiho = {
  title: '', address: '', phone: '', latitude: 0, longitude: 0, distance: 0,
};
let nearestKoi = {
  title: '', address: '', phone: '', latitude: 0, longitude: 0, distance: 0,
};
let nearestGongCha = {
  title: '', address: '', phone: '', latitude: 0, longitude: 0, distance: 0,
};
let myLocation;

// start scene
const sendLocation = new Scene('sendLocation');
sendLocation.enter(ctx => ctx.reply('Send your location.', Extra.markup(markup => markup.resize()
  .keyboard([
    markup.locationRequestButton('Send location'),
  ]))));
sendLocation.on('location', (ctx) => {
  myLocation = ctx.message.location;
  return ctx.reply('Select store.', Extra.markup(markup => markup.resize()
    .keyboard([
      ['Koi'],
      ['LiHo'],
      ['Gong Cha'],
    ])));
});

// koi scene

const koiScene = new Scene('koiScene');
koiScene.enter((ctx) => {
  if (data != 0) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].location == null) {
        i++;
      }
      const result = geoLib.getDistance(
        { latitude: myLocation.latitude, longitude: myLocation.longitude },
        { latitude: data[i].location.LATITUDE, longitude: data[i].location.LONGITUDE },
      );
      if (data[i].chain == 'Koi') {
        if ((nearestKoi.distance == 0) || (nearestKoi.distance > result)) {
          nearestKoi.title = data[i].title;
          nearestKoi.address = data[i].address;
          nearestKoi.phone = data[i].phone;
          nearestKoi.latitude = data[i].location.LATITUDE;
          nearestKoi.longitude = data[i].location.LONGITUDE;
          nearestKoi.distance = result;
        }
      }
    }
    ctx.reply(`Nearest Koi\n${nearestKoi.title}\n${nearestKoi.address}\n${nearestKoi.phone}\n${nearestKoi.distance}m`);
    ctx.replyWithLocation(nearestKoi.latitude, nearestKoi.longitude);
    nearestKoi = {
      title: '', address: '', phone: '', latitude: 0, longitude: 0, distance: 0,
    };
    ctx.reply('Enter /start to search for another store');
    ctx.scene.leave();
  } else {
    ctx.reply('No data');
  }
});

// LiHo Scene
const LiHoScene = new Scene('LiHoScene');
LiHoScene.enter((ctx) => {
  if (data != 0) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].location == null) {
        i++;
      }
      const result = geoLib.getDistance(
        { latitude: myLocation.latitude, longitude: myLocation.longitude },
        { latitude: data[i].location.LATITUDE, longitude: data[i].location.LONGITUDE },
      );
      if (data[i].chain == 'LiHO') {
        if ((nearestLiho.distance == 0) || (nearestLiho.distance > result)) {
          nearestLiho.title = data[i].title;
          nearestLiho.address = data[i].address;
          nearestLiho.phone = data[i].phone;
          nearestLiho.latitude = data[i].location.LATITUDE;
          nearestLiho.longitude = data[i].location.LONGITUDE;
          nearestLiho.distance = result;
        }
      }
    }
    ctx.reply(`Nearest LiHo\n${nearestLiho.title}\n${nearestLiho.address}\n${nearestLiho.phone}\n${nearestLiho.distance}m`);
    ctx.replyWithLocation(nearestLiho.latitude, nearestLiho.longitude);
    nearestLiho = {
      title: '', address: '', phone: '', latitude: 0, longitude: 0, distance: 0,
    };
    ctx.reply('Enter /start to search for another store');
    ctx.scene.leave();
  } else {
    ctx.reply('No data');
  }
});


// Gong Cha Scene

const GongChaScene = new Scene('GongChaScene');
GongChaScene.enter((ctx) => {
  if (data != 0) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].location == null) {
        i++;
      }
      const result = geoLib.getDistance(
        { latitude: myLocation.latitude, longitude: myLocation.longitude },
        { latitude: data[i].location.LATITUDE, longitude: data[i].location.LONGITUDE },
      );
      if (data[i].chain == 'Gong Cha') {
        if ((nearestGongCha.distance == 0) || (nearestGongCha.distance > result)) {
          nearestGongCha.title = data[i].title;
          nearestGongCha.address = data[i].address;
          // nearestGongCha.phone = data[i].phone;
          nearestGongCha.latitude = data[i].location.LATITUDE;
          nearestGongCha.longitude = data[i].location.LONGITUDE;
          nearestGongCha.distance = result;
        }
      }
    }
    ctx.reply(`Nearest Gong Cha\n${nearestGongCha.title}\n${nearestGongCha.address}\n${nearestGongCha.distance}m`);
    ctx.replyWithLocation(nearestGongCha.latitude, nearestGongCha.longitude);
    nearestGongCha = {
      title: '', address: '', phone: '', latitude: 0, longitude: 0, distance: 0,
    };
    ctx.reply('Enter /start to search for another store');
    ctx.scene.leave();
  } else {
    ctx.reply('No data');
  }
});


sendLocation.hears('Koi', (ctx) => {
  ctx.scene.leave();
  ctx.scene.enter('koiScene');
});

sendLocation.hears('LiHo', (ctx) => {
  ctx.scene.leave();
  ctx.scene.enter('LiHoScene');
});
sendLocation.hears('Gong Cha', (ctx) => {
  ctx.scene.leave();
  ctx.scene.enter('GongChaScene');
});


// Create scene manager
const stage = new Stage();
stage.command('cancel', leave());

// Scene registration
stage.register(sendLocation);
stage.register(koiScene);
stage.register(LiHoScene);
stage.register(GongChaScene);
bot.use(session());
bot.use(stage.middleware());
bot.start((ctx) => {
  ctx.scene.enter('sendLocation');
});
/*
bot.on('location', (ctx) => {
	if(data != 0){
		for (var i = 0; i < data.length; i++){
			if(data[i].location == null){
				i++;
			}
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
		nearestKoi =  {title:"", address:"", phone:"", latitude: 0, longitude:0, distance:0};
	} else{
		ctx.reply(`No data`);
	}
});
*/

bot.startPolling();
