const needle = require('needle'),
	request= require('request'),
    cheerio = require("cheerio");


const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);


app.use(express.json());


httpServer.listen(1488, function(){
    console.log('listen on port 1488');
});

let url = 'https://www.cvk.gov.ua/pls/vp2019/wp300pt001f01=720.html';


app.get('/', function(req, res) {
	console.log(getPoll());
	res.send(getPoll());
});

setInterval(() => {
	let poll = getPoll();
	if(poll) {
		let text = '';
		for(let p of poll) {
			text += `${p.name} ${p.percent} ${p.count}\n`
		}
		sendMsg(339018008, text);
	}
}, 2*60*60*1000);

function getPoll() {
	needle.get(url, function(err, resp) {
	    if (!err) {
	        let $ = cheerio.load(resp.body);
	        let results = [];
	        $('.pure-table tbody tr').each(function(i, td) {
	        	if(i>2) {
		        	let children = $(this).children();
		        	var name = children.children().eq(0).text();
		        	var percent = children.eq(2).text();
		        	var count = children.eq(3).text();
		        	results.push({'name' : name, 'percent' : percent, 'count' : count});
	        	}
	    	}); 
	        return results;
	    } else {
	        console.log("Произошла ошибка: " + err);
	        return null;
	    }

	});
}

function sendMsg(id, msg) {

	let options = {
		chat_id: id,
		text: msg,
		parse_mode: 'HTML'
	}

    let requestOptions = {
		uri: 'https://api.telegram.org/bot651878334:AAFVTWmY_vwlQ5PJZ69LdoMyphHFfSxIPsg/sendMessage',
		body: JSON.stringify(options),
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	}
	request(requestOptions, (error, response, body) => {	
		if (error || !body.ok) {
			console.log(error || body);
		} else {
			console.log(body);
		}
	}); 
}

//https://api.telegram.org/bot651878334:AAFVTWmY_vwlQ5PJZ69LdoMyphHFfSxIPsg/setWebhook?url=http://gsi.esm.hk:1488/pol