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
posts = document.getElementsByClassName('ForumPost');
charRegExp = /<a.*?href=".*?subtopic=characters.*?">(.*?)<\/a>/i
serverRegExp = /Inhabitant\s*of\s*(.*?)<br>/
for (var i = 1; i < posts.length; i++) {
  var charTextElement = posts[i].getElementsByClassName('PostCharacterText')[0];
  var charText = charTextElement.innerHTML;
  var name = htmlDecode(charText.match(charRegExp)[1]);
  var server = charText.match(serverRegExp)[1];
  var indElement = document.createElement('span');
  charTextElement.insertBefore(indElement, charTextElement.firstElementChild.nextElementSibling);
  characters.push({
    name: name,
    server: server,
    indElement: indElement,
    indicator: null,
    iconParent: null,
    iconElement: null
  });
  charactersSimple.push({name: name, server: server});
}
if (characters.length > 0) {
  loadCharacters(charactersSimple);
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
      characters[i].indicator = createIndicator(characters[i].indElement, 'right');
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