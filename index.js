const express = require('express')
const path = require('path')
const axios = require('axios');
const request = require("request");
const https = require("https");
const bodyParser = require('body-parser');
const session = require('express-session');

const PORT = process.env.PORT || 5000
const client = require('twilio')(process.env.SID, process.env.AUTH);
const MessagingResponse = require('twilio').twiml.MessagingResponse;


const worldurl = "https://corona.lmao.ninja/all";
const countryurl = "https://corona.lmao.ninja/countries";

let mainMenu = '1. World report \n2. My country report \n3. Country wise report \n4. Top 5 countries report \n5. About and Help';
let errorMessage = 'Sorry!! I did\'n\'t understand';

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
app.use(session({secret: 'anything-you-want-but-keep-secret'}));

app.post('/whatsapp', (req, res) => {
  const twiml = new MessagingResponse();
  const currentmsg = req.session.current || 0;

  let message = '';
  if(currentmsg == 0){
  	https.get(worldurl, rs => {
  	rs.setEncoding("utf8");
  	let body = "";
  	rs.on("data", data => {
    body += data;
    message = 'Hello there! Currently the world has '+JSON.parse(body).cases+' COVID cases reported.\n';
	  message = message + "\nPlease choose from the following options.\n"   
    message = message + mainMenu;
  	twiml.message(message);
  	res.writeHead(200, {'Content-Type': 'text/xml'});
 	  res.end(twiml.toString());
    });
  });
    req.session.current = 1;
  }
  else if(currentmsg == 1){
  	
 	if(req.body.Body == 1){
 		req.session.current = 1;
 		https.get(worldurl, rs => {
  		rs.setEncoding("utf8");
  		let body = "";
  		rs.on("data", data => {
    	body += data;
    	message = 'Here is the World report.\n';
    	
    	message = message+ 'Total Cases:'+JSON.parse(body).cases+'\nDeaths:'+JSON.parse(body).deaths+'\nRecovered:'+JSON.parse(body).recovered+'\n';
    	message = message +'\n-----------\n 0 to go to main menu';
  		twiml.message(message);

  		res.writeHead(200, {'Content-Type': 'text/xml'});
 		res.end(twiml.toString());
      });});
 	}
 	else if(req.body.Body == 2){
 		req.session.current = 1;
 		var id = req.body.From.split("+")[1];
		var options = { method: 'GET',
  		url: 'https://covid-8840.restdb.io/rest/members?q={"number":"'+id+'"}',
  		headers: 
   			{ 'cache-control': 'no-cache',
    	 	'x-apikey': '5febb36d47b1aa8004dc42c3fd6f20d0c5b5d' } };

		request(options, function (error, response, body) {
  			if (error) throw new Error(error);

  			if(JSON.parse(body).length == 0){
  				req.session.current = 11;
  				twiml.message("You haven't set your country. Please enter your country name here");

  				res.writeHead(200, {'Content-Type': 'text/xml'});
 				res.end(twiml.toString());
  			}
  			else{
  				axios.get('https://corona.lmao.ninja/countries/'+JSON.parse(body)[0].country)
  				.then(response => {
    
    			message = response.data.country+'\n -------------------\n Cases:'+response.data.cases+'\n Today cases:'+response.data.todayCases+'\n Deaths:'+response.data.deaths+'\n Today deaths:'+response.data.todayDeaths+'\n Recovered: '+response.data.recovered+'\n Active:'+response.data.active+'\n Critical:'+response.data.critical+'\n Cases per million:'+response.data.casesPerOneMillion;
    			message = message +'\n-----------\n 0 to go to main menu';
    			twiml.message(message);

  				res.writeHead(200, {'Content-Type': 'text/xml'});
 				res.end(twiml.toString());
  			})
  			.catch(error => {
   		 	console.log(error);
  			});
  			}		
  	
	});
		
 	}
 	else if(req.body.Body == 3){
 		req.session.current = 10;
 		message = 'Please enter the country name';
 		twiml.message(message);

  		res.writeHead(200, {'Content-Type': 'text/xml'});
 		res.end(twiml.toString());
 	}
 	else if(req.body.Body == 4){
 		
  		axios.get(countryurl)
  			.then(response => {
    
    		for (var i = 0; i < 5; i++) {
    			let curr = '**'+response.data[i].country+'\nCases:'+response.data[i].cases+'\nToday cases:'+response.data[i].todayCases+'\nDeaths:'+response.data[i].deaths+'\nToday deaths:'+response.data[i].todayDeaths+'\n';
    			message = message + curr;
    		}
    		message = message+'\n-----------\n 0 to go to main menu'
    		twiml.message(message);

  		res.writeHead(200, {'Content-Type': 'text/xml'});
 		res.end(twiml.toString());
  		})
  		.catch(error => {
    	console.log(error);
  		});
 	}
  	else if(req.body.Body == 0){
  		https.get(worldurl, rs => {
  	rs.setEncoding("utf8");
  	let body = "";
  	rs.on("data", data => {
    body += data;
    message = 'Hello there! Currently the world has '+JSON.parse(body).cases+' COVID cases reported.\n';
    message = message + mainMenu;
  	twiml.message(message);

  	res.writeHead(200, {'Content-Type': 'text/xml'});
 	res.end(twiml.toString());
      });});
  	}
 		
 	else if(req.body.Body == 5){
 		req.session.current = 1;
 		twiml.message("This Bot is made to track the current corona cases.\n You can ping me 'https://wa.me/918220432496' for any queries.\n Select from main menu again. \n"+mainMenu);

  		res.writeHead(200, {'Content-Type': 'text/xml'});
 		res.end(twiml.toString());
 	}
 	else{
 		req.session.current = 1;
 		message = errorMessage+'\n'+mainMenu;
  		twiml.message(message);

  		res.writeHead(200, {'Content-Type': 'text/xml'});
 		res.end(twiml.toString());
 	}
    
  }
  else if(currentmsg == 10){
  	if(req.body.Body == 0){
  		https.get(worldurl, rs => {
  	rs.setEncoding("utf8");
  	let body = "";
  	rs.on("data", data => {
    body += data;
    message = 'Hello there! Currently the world has '+JSON.parse(body).cases+' COVID cases reported.\n';
    message = message + mainMenu;
  	twiml.message(message);

  	res.writeHead(200, {'Content-Type': 'text/xml'});
 	res.end(twiml.toString());
      });});
  
    req.session.current = 1;
  	}
  	else{
  		axios.get('https://corona.lmao.ninja/countries/'+req.body.Body)
  	.then(response => {
    
    	message = response.data.country+'\n -------------------\n Cases:'+response.data.cases+'\n Today cases:'+response.data.todayCases+'\n Deaths:'+response.data.deaths+'\n Today deaths:'+response.data.todayDeaths+'\n Recovered: '+response.data.recovered+'\n Active:'+response.data.active+'\n Critical:'+response.data.critical+'\n Cases per million:'+response.data.casesPerOneMillion;
    	message = message+'\n-----------\n You can enter another country \n-----------\n 0 to go to main menu'
    	twiml.message(message);

  		res.writeHead(200, {'Content-Type': 'text/xml'});
 		res.end(twiml.toString());	
   
  })
  .catch(error => {
  	twiml.message("Invalid country name");

  		res.writeHead(200, {'Content-Type': 'text/xml'});
 		res.end(twiml.toString());
    console.log(error);
  });
  	}
  	
  }
 else if(currentmsg == 11){
 	req.session.current = 1;
 	var options2 = { method: 'POST',
  url: 'https://covid-8840.restdb.io/rest/members',
  headers: 
   { 'cache-control': 'no-cache',
     'x-apikey': '5febb36d47b1aa8004dc42c3fd6f20d0c5b5d',
     'content-type': 'application/json' },
  body: { number: req.body.From.split("+")[1], country: req.body.Body },
  json: true };

	request(options2, function (error, response, body) {
  	if (error) throw new Error(error);

  		twiml.message("Your country is set. \n 0 to go to main menu and try.");

  		res.writeHead(200, {'Content-Type': 'text/xml'});
 		res.end(twiml.toString());
});
 }

 
});


