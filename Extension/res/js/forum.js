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