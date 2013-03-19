/** This is a content script to get a list from the online characters supposedly stored locally.

  This content script is supposed to work only in http://www.tibia.com/news/?subtopic=guilds */

/** Each has the form {name,row,rank,ranke,lvlvoc,indicator,online}
    ranke is the element holding the rank name.
    lvlvoc is the element holding the lvlvoc text.
    indicator is the element that shows if online or not.
*/
characters = [];
header = null;
headerSpan = null;
hide = false;
hideUnhideAnchor = null;

// This is to avoid being misguided by the guild's description.
server = document.getElementsByTagName('body')[0].innerHTML.match(/The guild was founded on .*? on/g);
if (server != null) {
  server = server[server.length - 1].match(/The guild was founded on (.*?) on/)[1];
  loadCharacters(server);
}

function htmlDecode (input) {
  if (/[<>]/.test(input)) {
    return "Invalid Input";
  }
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue.replace(/\s/g, ' ');
}

function createLvlvoc(parent) {
  var lvlvoc = document.createElement('span');
  lvlvoc.style.fontSize = 'xx-small';
  lvlvoc.style.float = 'right';
  parent.appendChild(lvlvoc);
  return lvlvoc;
}

function loadCharacters(server) {
  chrome.extension.sendMessage({action: 'whois', server: server, getPlayersOnlineTimeout: true}, function (response) {
    if (response.tryAgain === false) {
      setTimeout(function(){loadCharacters(server);}, response.playersOnlineTimeout);
      setOnlineStatus(response.playersOnline);
    } else {
      setTimeout(function(){loadCharacters(server);}, 1000);
    }
  })
}

function setOnlineStatus(playersOnline) {
  if (characters.length == 0) {
    var memberList = document.getElementsByTagName('table');
    var foundMembers = false;
    for (var i = 0; i < memberList.length; i++) {
      if (/<b>Guild Members<\/b>/.test(memberList[i].innerHTML)) {
        memberList = memberList[i].getElementsByTagName('tr');
        foundMembers = memberList.length > 0;
        break;
      }
    }
    if (foundMembers) {
      var characterNameRegex = /<a.*?href.*?subtopic=characters.*?>(.*?)<\/a>/i;
      header = memberList[0].getElementsByTagName('td')[0];
      var rank = null;
      for (var i = 2; i < memberList.length; i++) {
        var tempRank = memberList[i].firstElementChild.firstChild.nodeValue.trim();
        if (tempRank.length > 0)
          rank = tempRank;
        characters.push({
          'name': htmlDecode(characterNameRegex.exec(memberList[i].innerHTML)[1]),
          'row': memberList[i],
          'rank': rank,
          'ranke': memberList[i].firstElementChild.firstChild,
          'lvlvoc': null,
          'indicator': null,
          'online': false
        });
      }
    }
  }
  var totalOnline = 0;
  for (var i = 0; i < characters.length; i++) {
    var cells = characters[i].row.getElementsByTagName('td');
    if (!characters[i].lvlvoc)
      characters[i].lvlvoc = createLvlvoc(cells[0]);
    if (playersOnline[characters[i].name]) {
      totalOnline++;
      var player = playersOnline[characters[i].name];
      characters[i].lvlvoc.style.display = '';
      characters[i].lvlvoc.innerText = 'Lv:' + player.lvl + ' Voc:' + player.vocShort;
      characters[i].online = true;
    } else {
      characters[i].lvlvoc.style.display = 'none';
      characters[i].online = false;
    }
  }
  if (!hideUnhideAnchor) {
    hideUnhideAnchor = document.createElement('a');
    hideUnhideAnchor.style.fontWeight = 'bold';
    hideUnhideAnchor.style.marginLeft = '5px';
    hideUnhideAnchor.href = 'javascript:;';
    hideUnhideAnchor.onclick = function(e) {
      hide = !hide;
      hideUndhide();
    };
    header.appendChild(hideUnhideAnchor);
  }
  hideUndhide();
  if (!headerSpan) {
    headerSpan = document.createElement('span');
    headerSpan.style.fontSize = 'xx-small';
    headerSpan.style.paddingRight = '5px';
    headerSpan.style.float = 'right';
    header.appendChild(headerSpan);
  }
  headerSpan.innerHTML =  'Guild Members: ' + characters.length + ' (Online: ' + totalOnline + ') &nbsp; Online on ' + server + ': ' + Object.keys(playersOnline).length;
}

function hideUndhide() {
  hideUnhideAnchor.className = hide ? 'red' : 'green';
  hideUnhideAnchor.innerHTML = hide ? '[Show Offline]' : '[Show Online Only]';
  var lastUsedRank = null;
  var evenRow = '#F1E0C6';
  var pairRow = '#D4C0A1';
  for (var i = 0, j = 0; i < characters.length; i++) {
    characters[i].row.style.display = hide && !characters[i].online ? 'none' : '';
    if(characters[i].row.style.display == '') {
      if(lastUsedRank != characters[i].rank) {
        lastUsedRank = characters[i].rank;
        characters[i].ranke.nodeValue = lastUsedRank;
        j++;
      } else {
        characters[i].ranke.nodeValue = '';
      }
      if (j % 2 == 0) {
        characters[i].row.style.backgroundColor = pairRow;
      } else {
        characters[i].row.style.backgroundColor = evenRow;
      }
    }
  }
}