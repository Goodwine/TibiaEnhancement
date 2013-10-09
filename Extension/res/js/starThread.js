/* This will enable you to star threads for easier follow up.
 * This is supposed to run only at http://forum.tibia.com/forum/?action=board */

threads = {};
starTable = null;
starThread = null;
sThreads = {};
currThread = null;
currThreadTable = null;

temp = $('.HNCContainer');
if (temp.length > 0) {
  var regexp = /<a .*?href=.*?threadid=(\d+).*?>(.*?)<\/a>.*?<a .*?href=.*?subtopic=characters.*?>(.*?)<\/a>/;
  var head = temp[0].parentNode.parentNode.previousElementSibling;
  head.parentNode.firstElementChild.firstElementChild.colSpan++;
  head.insertBefore(head.firstElementChild.cloneNode(true), head.firstElementChild);
  for (var i = 0; i < temp.length; i++) {
    var threadInfo = temp[i].parentNode.parentNode.innerHTML.match(regexp);
    threads[threadInfo[1]] = createThreadObject(
      temp[i].parentNode.parentNode,
      temp[i].parentNode.nextElementSibling.bgColor,
      threadInfo[1],
      threadInfo[2],
      threadInfo[3]
    );
  }
}

if(/action=thread/.test(window.location.href)) {
  chrome.extension.sendMessage({
    'isStarred': true,
    'thread': getCurrentThread()
  }, function(response) {
    updateThreadStar(response.isStarred);
  });
}
else {
  chrome.extension.sendMessage({
    'getStarredThreads': true
  }, function(response) {
    pushAnnouncements(temp[0]);
    fixCipBorders();
    updateStars(response.starredThreads);
  });
}

function createThreadObject(rowElement, bgColor, threadId, threadTitle, threadPoster) {
  var thread = {
    row: rowElement,
    starCell: document.createElement('td'),
    star: document.createElement('a'),
    table: false,
    thread: {
      id: threadId,
      title: threadTitle,
      poster: htmlDecode(threadPoster)
    }
  }
  thread.starCell.bgColor = bgColor;
  thread.starCell.style.textAlign = 'center';
  thread.star.style.width = '15px';
  thread.star.style.height = '15px';
  thread.star.style.display = 'inline-block';
  thread.star.style.margin = '0';
  thread.starCell.appendChild(thread.star);
  thread.row.insertBefore(thread.starCell, thread.row.firstElementChild);
  thread.star.href = 'javascript:;';
  thread.star._thread = thread;
  thread.star.onclick = function() {
    chrome.extension.sendMessage({
      'toggleThreadStar': true,
      'thread': this._thread.thread,
      'table': this._thread.table
    }, function(response) {
      updateStars(response.starredThreads, response.table);
    });
  }
  return thread;
}

function updateStars(starredThreads, ignoreTable) {
  var ids = Object.keys(threads);
  for (var i = 0; i < ids.length; i++) {
    if (starredThreads[ids[i]]) {
      threads[ids[i]].star.style.background = "url('" + chrome.extension.getURL('/res/img/star_on.gif') + "')";
    } else {
      threads[ids[i]].star.style.background = "url('" + chrome.extension.getURL('/res/img/star_off.gif') + "')";
    }
  }
  if(!ignoreTable)
    showStarTable(starredThreads);
  ids = Object.keys(sThreads);
  for (var i = 0; i < ids.length; i++) {
    if (starredThreads[ids[i]]) {
      sThreads[ids[i]].star.style.background = "url('" + chrome.extension.getURL('/res/img/star_on.gif') + "')";
    } else {
      sThreads[ids[i]].star.style.background = "url('" + chrome.extension.getURL('/res/img/star_off.gif') + "')";
    }
  }
}

function updateThreadStar(isStarred) {
  if (starThread == null) {
    createThreadStar();
  }
  if (isStarred) {
    starThread.css({background:"url('" + chrome.extension.getURL('/res/img/star_on.gif') + "')"});
  } else {
    starThread.css({background:"url('" + chrome.extension.getURL('/res/img/star_off.gif') + "')"});
  }
}

function showStarTable(starredThreads) {
  if(starTable != null)
    starTable.parentElement.removeChild(starTable);
  var ids = Object.keys(starredThreads);
  if(ids.length == 0) {
    starTable = null;
    return;
  }
  starTable = document.createElement('table');
  starTable.border=0;
  starTable.cellPadding=3;
  starTable.cellSpacing=1;
  starTable.width='100%';
  starTable.style.marginBottom='10px';
  var container = $('.Box')[0];
  var before = $(container).find('table')[1];
  before.parentElement.insertBefore(starTable, $(container).find('table')[1]);
  starTable.innerHTML='';
  var head = document.createElement('tr');
  var sHead = document.createElement('td');
  sHead.style.backgroundColor = '#505050';
  sHead.style.height = '22px';
  sHead.colSpan=3;
  sHead.innerHTML='Starred Threads';
  sHead.className='ff_white';
  head.appendChild(sHead);
  starTable.appendChild(head);
  for(var i = 0; i < ids.length; i++) {
    var row = document.createElement('tr');
    var thread = createThreadObject(row, '#F1E0C6', ids[i], starredThreads[ids[i]].title, starredThreads[ids[i]].poster);
    thread.table = true;
    sThreads[ids[i]] = thread;
    var titleCell = document.createElement('td');
    var posterCell = document.createElement('td');
    titleCell.style.backgroundColor='#D4C0A1';
    posterCell.style.backgroundColor='#F1E0C6';
    var title = document.createElement('a');
    title.innerHTML = starredThreads[ids[i]].title;
    title.href = 'http://forum.tibia.com/forum/?action=thread&threadid=' + ids[i];
    titleCell.appendChild(title);
    var poster = document.createElement('a');
    poster.innerHTML = starredThreads[ids[i]].poster;
    poster.href = 'http://www.tibia.com/community/?subtopic=characters&name=' + starredThreads[ids[i]].poster;
    posterCell.appendChild(poster);
    row.appendChild(thread.starCell);
    row.appendChild(titleCell);
    row.appendChild(posterCell);
    starTable.appendChild(row);
  }
  updateStars(starredThreads, true);
}

function createThreadStar() {
  var table = getThreadTable();
  starThread = $("<a/>", {css:{width:'15px',height:'15px',display:'inline-block',margin:'0'},href:'javascript:;'});
  starThread.click(function(){
    chrome.extension.sendMessage({
      'toggleThreadViewStar': true,
      'thread': getCurrentThread(),
    }, function(response) {
      updateThreadStar(response.isStarred);
    });
  });
  starThread.insertBefore($(table).find('tr .Text').last().children().first());
}

function pushAnnouncements(hncContainer) {
  if (hncContainer == null) return;
  var rows = $(hncContainer).closest('table').find('tr');
  for (var i = 0; i < rows.length; i++) {
    if ($(rows[i]).find('.HNCContainer').length > 0)
      break;
    if (rows[i].firstElementChild.bgColor == "#505050")
      continue;
    $(rows[i]).find('td')[0].colSpan=2;
  }
}

function fixCipBorders() {
  $('.BoardThreadLine').each(function(){$(this).parent()[0].innerHTML=this.innerHTML});
  $('.CipPost').each(function(){
    $(this).closest('tr').each(function(){
      var o = $(this).offset();
      $(this).find('.CipPost .Text').css({'padding':'10px 0'});
      var c = $(this).find('.CipPost').parent().offset();
      $(this).find('.CipBorderTop .CipBorder').css({top:-3, left:o.left-c.left, width:o.width-9});
      $(this).find('.CipBorderLeft .CipBorderV').css({left:o.left-c.left});
      $(this).find('.CipBorderBottom .CipBorder').css({bottom:0, left:o.left-c.left, width:o.width-9});
      $(this).find('.CipBorderRight .CipBorderV').css({left:o.left-c.left+o.width-8});
    });
  });
}

function getCurrentThread() {
  if (currThread == null) {
    var table = getThreadTable();
    currThread = {
      id: table.next('table')[0].innerHTML.match(/<td.*?bgcolor=['"]#505050['"].*?><b>Thread #(\d*?)<\/b><\/td>/i)[1],
      title: table.find('tr .Text b')[0].innerText,
      poster: htmlDecode(table.next('table')[0].innerHTML.match(/<a.*?href=['"].*?subtopic=characters.*?['"]>(.*?)<\/a>/)[1])
    }
  }
  return currThread;
}

function getThreadTable() {
  if(currThreadTable == null) {
    var tables = $('table');
    for(var i = 0; i < tables.length; i++) {
      var res = tables[i].innerHTML.match(/<td.*?bgcolor=['"]#505050['"].*?><b>Thread #(\d*?)<\/b><\/td>/i);
      if(res && res.length > 1) {
        currThreadTable = tables[i - 1];
        break;
      }
    }
  }
  return $(currThreadTable);
}