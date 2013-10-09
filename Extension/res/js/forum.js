/** This is a content script to get a list from the online characters supposedly stored locally.

  This content script is supposed to work only in http://forum.tibia.com/forum/ */

/* Default character */
characterSelect = document.getElementsByName('forum_character');
if (characterSelect.length > 0) {
  characterSelect = characterSelect[0];
  chrome.extension.sendMessage({getDefaultCharacter: true}, function(response) {
    characterSelect.value = response.defaultCharacter;
    if (characterSelect.selectedIndex < 0) {
      characterSelect.selectedIndex = 0;
    }
  });
  var anchor = document.createElement('a');
  anchor.style.marginLeft = '5px';
  anchor.href = 'javascript:;';
  anchor.onclick = function(e) {
    chrome.extension.sendMessage({setDefaultCharacter: true, defaultCharacter: characterSelect.value}, function (response) {
      var message = null;
      if (response.defaultCharacter == -1)
        message = "Default posting character cleared.";
      else {
        message = "Character <b>" + htmlDecode(characterSelect.selectedOptions[0].label) + "</b> was set as the default posting character.";
      }
      htmlAlert(message, 800, 800);
    });
  };
  anchor.innerText = '[Set as default]';
  characterSelect.parentNode.appendChild(anchor);
}

/* Online/Offline Indicators */
characters = [];
charactersSimple = [];
posts = document.getElementsByClassName('PostCharacterText');
charRegExp = /<a.*?href=".*?subtopic=characters.*?">(.*?)<\/a>/i
serverRegExp = /Inhabitant\s*of\s*(.*?)<br>/
for (var i = 0; i < posts.length; i++) {
  // Skip cip's characters, there is no need for useless icons.
  if (posts[i].getElementsByClassName('CipPostIcon').length > 0) {
    continue;
  }
  var charText = posts[i].innerHTML;
  var res = charText.match(charRegExp);
  if(!res)
    continue;
  var name = htmlDecode(res[1]);
  var server = charText.match(serverRegExp)[1];
  var indParent = document.createElement('span');
  var iconElement = document.createElement('div');
  posts[i].insertBefore(indParent, posts[i].firstElementChild.nextElementSibling);
  posts[i].insertBefore(iconElement, posts[i].getElementsByClassName('ff_infotext')[0]);
  posts[i].insertBefore(document.createElement('br'), posts[i].getElementsByClassName('ff_infotext')[0]);
  characters.push({
    name: name,
    server: server,
    indParent: indParent,
    indicator: null,
    iconElement: iconElement,
  });
  charactersSimple.push({name: name, server: server});
}
if (characters.length > 0) {
  loadCharacters(charactersSimple);
  setIcons();
}

function loadCharacters(charactersSimple) {
  var request = {
    getPlayersOnline: true,
    playerList: charactersSimple,
    getPlayersOnlineTimeout: true,
    getIndicator: true
  };
  chrome.extension.sendMessage(request, function (response) {
    if (response.tryAgain === false) {
      setTimeout(function(){loadCharacters(charactersSimple);}, response.playersOnlineTimeout);
      setOnlineStatus(response.playersOnline, response.indicator);
    } else {
      // Characters haven't been loaded yet, wait 1s and retry.
      setTimeout(function(){loadCharacters(charactersSimple);}, 1000);
    }
  })
}

function setOnlineStatus(playersOnline, indicator) {
  for (var i = 0; i < characters.length; i++) {
    if (!characters[i].indicator)
      characters[i].indicator = createIndicator(characters[i].indParent, 'right');
    if (playersOnline[characters[i].name]) {
      setIndicator(characters[i].indicator, indicator, true);
    } else {
      setIndicator(characters[i].indicator, indicator, false);
    }
  }
}

/* Fansite Icons */
function setIcons() {
  chrome.extension.sendMessage({getIcons: true, iconFlags: 'forum'}, function (response) {
    for (var i = 0; i < characters.length; i++) {
      createIcons(characters[i].name, false, response.icons.iconList, response.icons.iconFlags, characters[i].iconElement, 'left');
    }
  })
}