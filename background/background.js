var pattern = "https://wrlc-gwu.primo.exlibrisgroup.com/*";

function tracker(details) {
	
	let decoder = new TextDecoder("utf-8"),
		encoder = new TextEncoder();
	if (details.url.includes('ILSServices')) {
		console.log("----------------Request-------------------")
		console.log(details);
		
		let filter = browser.webRequest.filterResponseData(details.requestId);
		
		filter.ondata = event => {
   			console.log("---------------Response---------------------")
    		let dataStr = decoder.decode(event.data, {stream: true});
    		console.log(dataStr);
    		filter.write(event.data);
  		}

  		filter.onstop = event => {
      		console.log("Response finished: " + Date.now())
			filter.disconnect();
  		}
	}
}

browser.webRequest.onBeforeRequest.addListener(tracker,
												{urls: [pattern]},
												["requestBody",
												"blocking"]);


