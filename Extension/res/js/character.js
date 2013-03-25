/** This is a content script to get a list from the online characters supposedly stored locally.

  This content script is supposed to work only in http://www.tibia.com/news/?subtopic=characters */


if(/<b>Character Information<\/b>/.test(document.getElementsByTagName('body')[0].innerHTML)) {
  var server = document.getElementsByTagName('body')[0].innerHTML.match(/<td>World:<\/td><td>(.*?)<\/td>/)[1];
  var rows = document.getElementById('characters').getElementsByTagName('table')[0].getElementsByTagName('tr');
  for(var i = 1; i < rows.length; i++) {
    var cell = rows[i].firstChild.nextElementSibling;
    switch (rows[i].firstChild.innerText) {
      case 'Name:':
      case 'Married to:':
        var name = htmlDecode(cell.innerText.trim());
        setIcons(name, cell, false);
        setOnlineStatus(name, server, cell)
      break;
      case 'Sex:':
        var img = document.createElement('img');
        img.style.height = '16px';
        img.style.width = '16px';
        img.style.paddingRight = '3px';
        img.title = img.alt = cell.innerText
        img.src = chrome.extension.getURL('/res/img/' + img.title + '.png');
        img.style.float = 'left';
        cell.appendChild(img);
      break;
      case 'World:':
        var anchor = document.createElement('a');
        anchor.href = 'http://.tibia.com/community/?subtopic=worlds&world=' + server;
        anchor.innerText = server;
        cell.innerHTML = '';
        cell.appendChild(anchor);
        setIcons(server, cell, true);
      break;
      case 'House:':
        // TODO House Linker
      break;
    }
  }
}

function setIcons(name, parent, serverflag) {
  chrome.extension.sendMessage({getIcons: true, iconFlags: 'character'}, function (response) {
    createIcons(name, serverflag, response.icons.iconList, response.icons.iconFlags, parent, null);
  })
}

function setOnlineStatus(name, server, parent) {
  if (typeof onlineIndicators == 'undefined')
    onlineIndicators = {};
  var request = {
    getPlayersOnline: true,
    server: server,
    name: name,
    getPlayersOnlineTimeout: true,
    getIndicator: true
  };
  chrome.extension.sendMessage(request, function (response) {
    if (response.tryAgain === false) {
      setTimeout(function(){setOnlineStatus(name, server, parent);}, response.playersOnlineTimeout);
      if (!onlineIndicators[name])
        onlineIndicators[name] = createIndicator(parent, 'left');
      var isOnline = false;
      if (response.playersOnline)
        isOnline = true;
      setIndicator(onlineIndicators[name], response.indicator, isOnline);
      onlineIndicators[name].style.margin = '0 3px 0 0';
    } else {
      // Characters haven't been loaded yet, wait 1s and retry.
      setTimeout(function(){setOnlineStatus(name, server, parent);}, 1000);
    }
  });
}