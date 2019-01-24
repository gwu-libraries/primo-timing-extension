var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	config = require('./config.json'),
	{ Pool } = require('pg'),
	pool = new Pool(config.pg_credentials);
 
app.use(express.static('./'));
// DO we need the following?
// Limit the CORS header to the GW domain?
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//app.use(bodyParser.text());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));
server = app.listen(3000);


app.post('/', async (req, res) => {
	try {
		await updateEventsDB(req.body);
	}
	catch (e) {
		console.error(e);
		console.log(req.body);
	}
	finally {
		res.sendStatus(200); // This line is necessary, otherwise the request won't terminate 
	}

});

// Route for registering the user's browser (for the first time)
// Returns to the app a unique ID
app.post('/browser', async (req, res) => {
	//console.log("Request received") // debugging
	try {
		let browserData = req.body;
		// Insert the browser data into the SQL db, returning the new unique ID for this user/browser
		let rowObj = await pool.query('INSERT INTO browser_info (os, arch, name, vendor, version, buildID) VALUES ($1, $2, $3, $4, $5, $6) RETURNING browser_id', 
			[browserData.os, browserData.arch, browserData.name, browserData.vendor, browserData.version, browserData.buildID]);
		res.send({browserID: rowObj.rows[0].browser_id});
	}
	catch (e) {
		// To Do: Return status code based on type of error
		// To Do: Refactor as error handler function
		res.sendStatus(400);
		console.error(e)
	}

});

async function updateEventsDB(data) {
	let queryText = 'INSERT INTO ils_events (request_id, timestamp, payload, type, browser_id) VALUES ($1, $2, $3, $4, $5)',
		{id, timestamp, payload, type, browserID} = data,
		queryValues = [id, timestamp, payload, type, browserID];
	try {
		await pool.query(queryText, queryValues);
	}
	catch (e) {
		if (e.code && e.code == '22P02') {
			// JSON payload has invalid characters. Just save the other data and drop the payload.
			await pool.query(queryText, [id, timestamp, null, type, browserID]);
		}
		else throw e;
	}
	return;

}