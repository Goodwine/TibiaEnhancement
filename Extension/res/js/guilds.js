/** This is a content script to get a list from the online characters supposedly stored locally.

	This content script is supposed to work only in http://www.tibia.com/news/?subtopic=latestnews
	and in http://www.tibia.com/news/?subtopic=newsarchive */

chrome.extension.sendMessage({action:'whois', server: 'Danera'}, function (response) {
  console.log(response);
});