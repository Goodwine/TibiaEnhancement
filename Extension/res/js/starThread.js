/* This will enable you to star threads for easier follow up.
 * This is supposed to run only at http://forum.tibia.com/forum/?action=board */

threads = {};
starTable = null;
sThreads = {};

temp = document.getElementsByClassName('HNCContainer');
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
  chrome.extension.sendMessage({
    'getStarredThreads': true
  }, function(response) {
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
  var container = document.getElementsByClassName('Box')[0];
  var before = container.getElementsByTagName('table')[1];
  before.parentElement.insertBefore(starTable, container.getElementsByTagName('table')[1]);
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
