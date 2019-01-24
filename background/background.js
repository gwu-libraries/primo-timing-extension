var pattern = "https://wrlc-gwu.primo.exlibrisgroup.com/*",
	remoteLogUrl = "http://localhost:3000",
	fetchOptions = {
			method: "POST",
			mode: "cors", // Is this necessary?
			headers: {
            	"Content-Type": "application/json",
        		}
        	};
// Posts data to the server
function postToRemote(data) {
	
	let options = fetchOptions;
	options.body = JSON.stringify(data);
	fetch(remoteLogUrl, options)
		.catch(e => console.log(e));
}
// Function to record the info about the current browser and platform on the server and get a unique ID associated with it for future sessions
function registerBrowser() {
	return Promise.all([browser.runtime.getPlatformInfo(),
				browser.runtime.getBrowserInfo()])
			.then(data => {
				let options = fetchOptions;
				// the function passed to JSON.stringify reduces an array of objects into a single object, given non-overlapping keys between the objects to be reduced
				options.body = JSON.stringify(
									data.reduce( (prev, curr) => Object.assign(prev, curr), {})
								);
				return fetch(`${remoteLogUrl}/browser`, options)
			})
			.then(response => response.json())
			.then(data => data.browserID)
			.catch(e => console.error(e));
}
// function to intercept requests that match a certain pattern and time and record the request and response
function tracker(browserID, details) {
	
	let decoder = new TextDecoder("utf-8"),
		encoder = new TextEncoder();
	if (details.url.includes('ILSServices')) {
		console.log(`Request made ${details.requestId}`) // debugging
		// Log the request
		postToRemote({timestamp: Date.now(),
					type: "request",
					id: details.requestId,
					payload: details,
					browserID: browserID});
		
		// StreamFilter object for capturing the response to this request
		let filter = browser.webRequest.filterResponseData(details.requestId),
		// variable for holding the JSON data returned --> need to account for the fact that this data may be sent in multiple packets
		responseData = null;
		// Capture the data packets
		filter.ondata = event => {
    		let responsePart = decoder.decode(event.data, {stream: true});
    		responseData += responsePart; 
    		filter.write(event.data);
  		}
  		// Once all the data has been received, log the response to the server
  		filter.onstop = event => {
  			console.log(`Request completed ${details.requestId}`) //debugging
			postToRemote({timestamp: Date.now(),
						type: "response",
						id: details.requestId,
						payload: responseData,
						browserID: browserID});
			filter.disconnect();
  		}
	}
}

// Checks for an existing user ID (in the browser's local storage). If it finds one, return that. Otherwise, query the server to get (a new) one from the database and store it
function storeIdLocal() {
	return browser.storage.local.get("primoTimingId")
		.then(result => {
			//console.log(result)
			// Already exits --> we're good to go
			if (result.primoTimingId) {
				// Using a global variable -- not the most elegant solution
				browserID = result.primoTimingId;
				return Promise.resolve(browserID);
			}
			else {
				// Need to ask the server
				return registerBrowser();
			}
		})
		.catch(e => {
			console.error(e);
		});
}

storeIdLocal().then( (browserID) => {
					// Assign the id from the server to the global variable
					let trackerPartial = tracker.bind(null, browserID);

					browser.webRequest.onBeforeRequest.addListener(trackerPartial,
												{urls: [pattern]},
												["requestBody",
												"blocking"]);
					// Set the local storage to the value of the id
					// this function returns a Promise
					return browser.storage.local.set({"primoTimingId": browserID});
					
				});


