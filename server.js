require('dotenv').config();
const Telegraf = require('telegraf');

const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');

const { leave } = Stage;

const request = require('request');

const geoLib = require('geolib');

const { API_TOKEN } = process.env;
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://boba-telegram.herokuapp.com';

const bot = new Telegraf(API_TOKEN);

if (process.env.DYNO) {
  // Running on Heroku
  bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
  bot.startWebhook(`/bot${API_TOKEN}`, null, PORT);
} else {
  bot.startPolling();
}

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
let data = null;
request({
  url,
  json: true,
}, (error, response, body) => {
  if (!error && response.statusCode === 200) {
    data = body;
  }
});

// start scene
const mainScene = new Scene('main');
mainScene.enter(ctx => ctx.reply('Send your location.', Extra.markup(markup => markup.resize()
  .keyboard([
    markup.locationRequestButton('Send location'),
  ]))));
mainScene.on('location', (ctx) => {
  ctx.scene.state.location = ctx.message.location;
  return ctx.reply('Select store.', Extra.markup(markup => markup.resize()
    .keyboard([
      ['KOI'],
      ['LiHO'],
      ['Gong Cha'],
    ])));
});
mainScene.on('message', (ctx) => {
  if (data === null) {
    ctx.reply('No data');
    ctx.scene.leave();
    return;
  }
  /** @type {Array<Outlet>} */
  const nearestChains = data
    .filter(outlet => outlet.chain === ctx.update.message.text)
    .map(outlet => Object.assign(outlet, {
      distance: geoLib.getDistance(
        ctx.scene.state.location,
        { latitude: outlet.location.LATITUDE, longitude: outlet.location.LONGITUDE },
      ),
    }))
    .sort((a, b) => {
      return a.distance - b.distance;
    });
  if (nearestChains.length === 0) {
    ctx.reply('No data. Enter /start to search for another store');
    Markup.removeKeyboard(true);
    ctx.scene.leave();
    return;
  }
  ctx.reply(`Nearest ${ctx.update.message.text}\n${nearestChains[0].title}\n${nearestChains[0].address}\n${nearestChains[0].phone}\n${nearestChains[0].distance}m`);
  ctx.replyWithLocation(nearestChains[0].location.LATITUDE, nearestChains[0].location.LONGITUDE);
  ctx.reply('Enter /start to search for another store');
  ctx.scene.leave();
});

// Create scene manager
const stage = new Stage();
stage.command('cancel', leave());
stage.register(mainScene);

// Scene registration
bot.use(session());
bot.use(stage.middleware());
bot.start((ctx) => {
  ctx.scene.enter('main');
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
