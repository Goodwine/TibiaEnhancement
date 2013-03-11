/** This is a content script to get a list from the online characters supposedly stored locally.

	This content script is supposed to work only in http://www.tibia.com/news/?subtopic=latestnews
	and in http://www.tibia.com/news/?subtopic=newsarchive */

/*chrome.extension.sendMessage({action:'whois', server: 'Danera'}, function (response) {
  console.log(response);
});*/

server = document.getElementsByTagName('body')[0].innerHTML.match(/The guild was founded on (.*?) on/);
characters = [];
header = null;

if(server != null) {
  server = server[1];
  loadCharacters(server);
}

function loadCharacters(server) {
  chrome.extension.sendMessage({action: 'whois', server: server}, function (response) {
    if(response.tryAgain === false) {
      setOnlineStatus(response.playersOnline);
    } else {
      setTimeout(function(){loadCharacters(server);}, 1000);
    }
  })
}

function setOnlineStatus(playersOnline, htmlDecode) {
	if(characters.length == 0) {
    function htmlDecode (input) {
      if(/[<>]/.test(input)) {
        return "Invalid Input";
      }
      var e = document.createElement('div');
      e.innerHTML = input;
      return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    }
    var memberList = document.getElementsByTagName('table');
    var foundMembers = false;
    for(var i = 0; i < memberList.length; i++) {
      if (/<b>Guild Members<\/b>/.test(memberList[i].innerHTML)) {
        memberList = memberList[i].getElementsByTagName('tr');
        foundMembers = memberList.length > 0;
        break;
      }
    }
    if (foundMembers) {
      var characterNameRegex = /<a.*?href.*?subtopic=characters.*?>(.*?)<\/a>/i;
      header = memberList[0];
      var rank = null;
      for(var j = 2; j < memberList.length; j++) {
        var tempRank = memberList[j].getElementsByTagName('td')[0].childNodes[0].nodeValue.trim();
        if(tempRank.length > 0)
          rank = tempRank;
        characters.push({
          'name': htmlDecode(characterNameRegex.exec(memberList[j].innerHTML)[1]),
          'row': memberList[j],
          'rank': rank
        });
      }
    }
	}
	console.log(characters);
}