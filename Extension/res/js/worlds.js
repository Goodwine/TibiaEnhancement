/** This is a content script to get a list from the online characters supposedly stored locally.

  This content script is supposed to work only in http://www.tibia.com/news/?subtopic=worlds */

chrome.extension.sendMessage({getIcons: true, iconFlags: 'worlds'}, function (response) {
  if(response.icons.iconFlags.length == 0)
    return;
  if(/<b>Overall Maximum:<\/b>/.test(document.getElementsByTagName('body')[0].innerHTML)) {
    var worlds = document.getElementById('worlds').getElementsByClassName('TableContent')[1].getElementsByTagName('tr');
    for (var i = 1; i < worlds.length; i++) {
      var server = worlds[i].firstChild;
      createIcons(server.innerText, true, response.icons.iconList, response.icons.iconFlags, server, 'left');
    }
  } else if (/<div\s*class="Text"\s*>World Information<\/div>/.test(document.getElementsByTagName('body')[0].innerHTML)) {
    var tables = document.getElementById('worlds').getElementsByTagName('table');
    var server = tables[1].getElementsByTagName('select')[0].value;
    var infoTable = tables[3];
    var row = document.createElement('tr');
    var cellLabel = document.createElement('td');
    cellLabel.className = 'LabelV200';
    cellLabel.innerText = 'Fansite Links:';
    var cellContent = document.createElement('td');
    createIcons(server, true, response.icons.iconList, response.icons.iconFlags, cellContent, 'left');
    row.appendChild(cellLabel);
    row.appendChild(cellContent);
    infoTable.appendChild(row);
    var characters = tables[5].getElementsByTagName('tr');
    for (var i = 1; i < characters.length; i++) {
      var character = characters[i].firstChild;
      createIcons(htmlDecode(character.innerText), false, response.icons.iconList, response.icons.iconFlags, character, 'left');
    }
  }
})

