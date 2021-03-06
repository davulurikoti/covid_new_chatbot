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


const worldurl = "https://coronavirus-19-api.herokuapp.com/all";
const countryurl = "https://coronavirus-19-api.herokuapp.com/countries";

let dashes = "➖➖➖➖➖➖➖";
let mainMenu = '\n*1*. World report \n*2*. My country report \n*3*. Country wise report \n*4*. Top 5 countries report \n*5*. About and Help\n*6*. India state wise\n*7*. Content of the day';
let errorMessage = '🤷‍Sorry!! I did\'n\'t understand';
let chooseOptions = '\n\nPlease choose from the following options.\n';
let helloMsg = '🙏Hello there! Currently the world has ';
let covidCasesMsg = ' COVID-19 cases reported.😷';
let toMainMenu = '\n➖➖➖➖➖➖➖\n *0* to go to main menu';
let botMsg = "This 🤖Bot is made to track the current corona cases.\nYou can ping me 'https://wa.me/918220432496' for any queries.\nCopy and share this(https://api.whatsapp.com/send?phone=14155238886&text=join%20event-rubber) link with your friends if they want to join this channel.\n\nSelect from main menu again. \n";
let feedback = "🤳🏻Please leave your Suggestions and Feedback here.\nPlease restrict your content to single message.";
let issues = 'We have issues in fetching data.';

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
app.use(session({secret: 'anything-you-want-but-keep-secret'}));

app.post('/whatsapp', (req, res) => {
  const twiml = new MessagingResponse();
  const currentmsg = req.session.current || 0;

  let message = '';
  if(currentmsg == 0){
    req.session.current = 1;
  	https.get(worldurl, rs => {
  	rs.setEncoding("utf8");
  	let body = "";
  	rs.on("data", data => {
    body += data;
    message = helloMsg +JSON.parse(body).cases+ covidCasesMsg;
	  
    //Start Code to get the my country data.
    var id = req.body.From.split("+")[1];
    var options = { method: 'GET',
      url: 'https://covid-8840.restdb.io/rest/members?q={"number":"'+id+'"}',
      headers: 
        { 'cache-control': 'no-cache',
        'x-apikey': '5febb36d47b1aa8004dc42c3fd6f20d0c5b5d' } };

      request(options, function (error, response, body) {
        if (error) throw new Error(error);

        if(JSON.parse(body).length == 0){
          message = message + chooseOptions;   
          message = message + mainMenu;
          twiml.message(message);
          res.writeHead(200, {'Content-Type': 'text/xml'});
          res.end(twiml.toString());
        }
        else{
          axios.get('https://coronavirus-19-api.herokuapp.com/countries/'+JSON.parse(body)[0].country)
          .then(response => {
          if(undefined != response.data){
           message = message + '\n🚩'+response.data.country+'\n➖➖➖➖➖➖➖\n Cases:'+response.data.cases+'\n Today cases:'+response.data.todayCases+'\n Deaths:'+response.data.deaths+'\n Today deaths:'+response.data.todayDeaths+'\n Recovered: '+response.data.recovered+'\n Active:'+response.data.active+'\n Critical:'+response.data.critical+'\n Cases per million:'+response.data.casesPerOneMillion; 
          }
          message = message + chooseOptions;   
          message = message + mainMenu;          
          twiml.message(message);
          res.writeHead(200, {'Content-Type': 'text/xml'});
          res.end(twiml.toString());
        })
        .catch(error => {
        console.log(error);
        });
        }   
    
  });
  	//End Code to get the my country data.
    
    });
  });
  }
  else if(currentmsg == 1){
  	
 	if(req.body.Body == 1){
 		req.session.current = 1;
 		https.get(worldurl, rs => {
  		rs.setEncoding("utf8");
  		let body = "";
  		rs.on("data", data => {
    	body += data;
    	message = '🌎🌍🌏 _World report._\n';
    	message = message+ 'Total Cases:'+JSON.parse(body).cases+'\nDeaths:'+JSON.parse(body).deaths+'\nRecovered:'+JSON.parse(body).recovered;
    	message = message + '\n'+ dashes + mainMenu;
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
  				twiml.message("💁🏻‍♂You haven't set your country. 🤳🏻Please *enter your country name* here");

  				res.writeHead(200, {'Content-Type': 'text/xml'});
 				res.end(twiml.toString());
  			}
  			else{
  				axios.get('https://coronavirus-19-api.herokuapp.com/countries/'+JSON.parse(body)[0].country)
  				.then(response => {
    
    			message = '🚩'+response.data.country+'\n➖➖➖➖➖➖➖\n Cases:'+response.data.cases+'\n Today cases:'+response.data.todayCases+'\n Deaths:'+response.data.deaths+'\n Today deaths:'+response.data.todayDeaths+'\n Recovered: '+response.data.recovered+'\n Active:'+response.data.active+'\n Critical:'+response.data.critical+'\n Cases per million:'+response.data.casesPerOneMillion;
    			message = message + '\n'+ dashes + mainMenu;
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
 		message = '🤳🏻Please enter the country name';
 		twiml.message(message);

  		res.writeHead(200, {'Content-Type': 'text/xml'});
 		res.end(twiml.toString());
 	}
 	else if(req.body.Body == 4){
 		
  		axios.get(countryurl)
  			.then(response => {
    
    		for (var i = 0; i < 5; i++) {
    			let curr = '🚩'+response.data[i].country+'\nCases:'+response.data[i].cases+'\nToday cases:'+response.data[i].todayCases+'\nDeaths:'+response.data[i].deaths+'\nToday deaths:'+response.data[i].todayDeaths+'\n';
    			message = message + curr;
    		}
    		message = message + toMainMenu;
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
    message = helloMsg + JSON.parse(body).cases+ covidCasesMsg;
    message = message + mainMenu;
  	twiml.message(message);

  	res.writeHead(200, {'Content-Type': 'text/xml'});
 	  res.end(twiml.toString());
      });});
  	}
 		
 	else if(req.body.Body == 5){
 		req.session.current = 1;
 		twiml.message(botMsg + mainMenu);

  		res.writeHead(200, {'Content-Type': 'text/xml'});
 		res.end(twiml.toString());
 	}
  else if(req.body.Body == 6){
    req.session.current = 1;
    message = '🇮🇳'+'Confirmed Cases\n';
    axios.get('https://api.covid19india.org/state_district_wise.json')
  .then(response => {
    /*let message1='';
    Object.keys(response.data).forEach(function(key) {
    var value = response.data[key];
    message1 = message1+'🇮🇳'+key+'\n'+'Cases:'+(parseInt(value.total_indian)+parseInt(value.total_foreign))+'\n'+'Deaths:'+value.death+'\n';
    */
    var data = Object.keys(response.data);
    for (state in response.data) {
      var stateData = response.data[state];
      var districtData = stateData['districtData'];
      var confirmed = 0;
      for(x in districtData){
        confirmed = confirmed + districtData[x]['confirmed'];
      }
      message = message+state+':'+confirmed+'\n';
    }
    twiml.message(message+toMainMenu);

      res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());

});


   /* axios.get('https://cdn.jsdelivr.net/gh/covid-19-tracker/india-state-wise@latest/data.json')
  .then(response => {
    let message1='';
    Object.keys(response.data).forEach(function(key) {
    var value = response.data[key];
    message1 = message1+'🇮🇳'+key+'\n'+'Cases:'+(parseInt(value.total_indian)+parseInt(value.total_foreign))+'\n'+'Deaths:'+value.death+'\n';
    
});
    twiml.message(message1+toMainMenu);

      res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());

  });*/
    
  }
  else if(req.body.Body == 7){
    req.session.current = 1;
    twiml.message("https://www.youtube.com/watch?v=54XLXg4fYsc \n" + mainMenu);

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
    message = helloMsg + JSON.parse(body).cases+ covidCasesMsg;
    message = message + mainMenu;
  	twiml.message(message);

  	res.writeHead(200, {'Content-Type': 'text/xml'});
 	res.end(twiml.toString());
      });});
  
    req.session.current = 1;
  	}
  	else{
  		axios.get('https://coronavirus-19-api.herokuapp.com/countries/'+req.body.Body)
  	.then(response => {
      if(undefined != response.data.country){
        message = '🚩'+response.data.country+'\n ➖➖➖➖➖➖➖\n Cases:'+response.data.cases+'\n Today cases:'+response.data.todayCases+'\n Deaths:'+response.data.deaths+'\n Today deaths:'+response.data.todayDeaths+'\n Recovered: '+response.data.recovered+'\n Active:'+response.data.active+'\n Critical:'+response.data.critical+'\n Cases per million:'+response.data.casesPerOneMillion;
      }else{
        message = "🤷‍♂Invalid country name or the country has no corona cases reported. Report me in help section if something is wrong! Thank you."
      }   
    	
    	message = message+'\n➖➖➖➖➖➖➖\n You can enter another country name _or_ \n➖➖➖➖➖➖➖\n *0* to go to main menu'
    	twiml.message(message);

  		res.writeHead(200, {'Content-Type': 'text/xml'});
 		res.end(twiml.toString());	
   
  })
  .catch(error => {
  	twiml.message("🤷‍♂Invalid country name");

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

  		axios.get('https://coronavirus-19-api.herokuapp.com/countries/'+ req.body.Body )
          .then(response => {
    
          message = '✅Your Country is set. Please go to help in main menu and ping me, if something is wrong.\n🚩'+response.data.country+'\n➖➖➖➖➖➖➖\n Cases:'+response.data.cases+'\n Today cases:'+response.data.todayCases+'\n Deaths:'+response.data.deaths+'\n Today deaths:'+response.data.todayDeaths+'\n Recovered: '+response.data.recovered+'\n Active:'+response.data.active+'\n Critical:'+response.data.critical+'\n Cases per million:'+response.data.casesPerOneMillion;
          message = message + toMainMenu;
          twiml.message(message);

          res.writeHead(200, {'Content-Type': 'text/xml'});
          res.end(twiml.toString());
        })
        .catch(error => {
        console.log(error);
        });

      
});
 }
 else if(currentmsg == 12){
  req.session.current = 1;
  if(0 != req.body.Body){
    client.messages
      .create({
         from: 'whatsapp:+14155238886',
         body: 'Hi Koti, You got a feedback from '+req.body.From+':'+req.body.Body,
         to: 'whatsapp:+918220432496'
       })
      .then(message => console.log(message.sid));
   message = '✅Thanks for your feedback.\n';
  }
  
   message = message + mainMenu;
   twiml.message(message);

   res.writeHead(200, {'Content-Type': 'text/xml'});
   res.end(twiml.toString()); 

 }

 
});

app.post('/expire', (req, res) => {
  const twiml = new MessagingResponse();
  let message = 'To adopt latest updates, send *join setting-go*.\nAlternatively, you can click here(https://api.whatsapp.com/send?phone=14155238886&text=join%20setting-go). \nYou can ping me at whatsapp: +918220432496(https://wa.me/918220432496) for any queries.';
  twiml.message(message);

    res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
  
});


