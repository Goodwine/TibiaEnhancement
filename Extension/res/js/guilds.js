/** This is a content script to get a list from the online characters supposedly stored locally.

	This content script is supposed to work only in http://www.tibia.com/news/?subtopic=latestnews
	and in http://www.tibia.com/news/?subtopic=newsarchive */

/*chrome.extension.sendMessage({action:'whois', server: 'Danera'}, function (response) {
  console.log(response);
});*/

server = document.getElementsByTagName('body')[0].innerHTML.match(/The guild was founded on (.*?) on/);
if(server != null) {
  server = server[1];
  loadCharacters(server);
}

function loadCharacters(server) {
  chrome.extension.sendMessage({action: 'whois', server: server, htmlDecode: true}, function (response) {
    if(response.tryAgain === false) {
      setOnlineStatus(response.playersOnline, response.htmlDecode);
    } else {
      setTimeout(function(){loadCharacters(server);}, 1000);
    }
  })
}

function setOnlineStatus(playersOnline, htmlDecode) {
	console.log(htmlDecode);
	console.log(playersOnline);
}