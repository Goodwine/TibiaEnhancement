/** Decodes HTML entities such as &nbsp; or &amp; */
function htmlDecode(input) {
  if (/[<>]/.test(input)) {
    return "Invalid Input";
  }
  if (typeof(dumpDiv) == 'undefined' || !dumpDiv) {
    dumpDiv = document.createElement('div');
  }
  dumpDiv.innerHTML = input;
  return dumpDiv.childNodes.length === 0 ? "" : dumpDiv.childNodes[0].nodeValue.replace(/\s/g, ' ');
}

/** Create the indicator element and appends it to a parent.

  @param element
    elment which will contain the created element.
  @param flt
    str, sets the css property float. */
function createIndicator(parent, flt) {
  var indicator = document.createElement('div');
  indicator.style.float = flt;
  indicator.style.margin = '0 0 0 5px';
  parent.appendChild(indicator);
  parent.style.whiteSpace = 'nowrap';
  return indicator;
}

/** "Fills" the indicator element passed with the given type and status

  @param indicator
    str, type of indicator
  @param online
    bool, online status */
function setIndicator(element, indicator, online) {
  switch (indicator) {
    case 'text':
      element.style.display = 'block';
      element.style.fontWeight = 'bold';
      element.style.height = null;
      element.style.background = null;
      if (online) {
        element.innerText = 'On';
        element.className = 'green';
      } else {
        element.innerText = 'Off';
        element.className = 'red';
      }
    break;
    case 'icon':
      element.style.display = 'block';
      element.innerText = '';
      element.className = '';
      element.style.height = '16px';
      element.style.width = '16px';
      if (online) {
        element.style.background = 'url(' + chrome.extension.getURL("res/img/green_indicator.svg") + ')';
      } else {
        element.style.background = 'url(' + chrome.extension.getURL("res/img/gray_indicator.svg") + ')';
      }
      element.style.background += ' 0 / cover'
    break
    default:
      element.style.display = 'none';
  }
}

/** Creates the icon DOMelements and appends it to a parent.

  @param name
    What server or which player to link
  @param serverflag
    bool, if we are looking for a server or for players
  @param iconList
    json, this is actually a map and not a list. format is of each element is
    {name, url, urlServer, icon}
  @param iconFlags
    array of str, this are the keys to be used from the iconList.
  @param parent
    elment which will contain the created elements.
  @param flt
    str, sets the css property float. */
function createIcons(name, serverflag, iconList, iconFlags, parent, flt) {
  for(var i in iconFlags) {
    if (serverflag && !iconList[iconFlags[i]].urlServer)
      continue;
    var anchor = document.createElement('a');
    anchor.style.float = flt;
    if (serverflag)
      anchor.href = iconList[iconFlags[i]].urlServer.replace(/\*SERVER_NAME_HERE\*/, name);
    else
      anchor.href = iconList[iconFlags[i]].url.replace(/\*PLAYER_NAME_HERE\*/, name);
    var img = document.createElement('img');
    img.alt = img.title = iconList[iconFlags[i]].name;
    img.style.maxHeight = '16px';
    img.style.maxWidth = '16px';
    img.padding = '0';
    img.src = iconList[iconFlags[i]].icon;
    anchor.appendChild(img);
    parent.appendChild(anchor);
    parent.style.whiteSpace = 'nowrap';
  }
}