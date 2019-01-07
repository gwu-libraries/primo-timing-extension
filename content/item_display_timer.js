/*On the MutationObserver API, see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/MutationObserver*/
function mutationCallback(mutationList, observer) {
	/* Implement logic here to iterate through mutation list to find changed elements*/
	console.log(mutationList)
}

var targetNode = document.querySelector('body'),
	observer = new MutationObserver(mutationCallback);

observer.observe(targetNode, {
 					attributes: true,
  					subtree: true,
  					childList: true,
  					characterDate: true
				});
console.log("Extension finished")