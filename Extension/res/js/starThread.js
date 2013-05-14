/* This will enable you to star threads for easier follow up.
 * This is supposed to run only at http://forum.tibia.com/forum/?action=board */

threads = {};

temp = document.getElementsByClassName('HNCContainer');
if (temp.length > 0) {
  var regexp = /<a .*?href=.*?threadid=(\d+).*?>(.*?)<\/a>.*?<a .*?href=.*?subtopic=characters.*?>(.*?)<\/a>/;
  var head = temp[0].parentNode.parentNode.previousElementSibling;
  head.parentNode.firstElementChild.firstElementChild.colSpan++;
  head.insertBefore(head.firstElementChild.cloneNode(true), head.firstElementChild);
  for (var i = 0; i < temp.length; i++) {
    var threadInfo = temp[i].parentNode.parentNode.innerHTML.match(regexp);
    var thread = {
      row: temp[i].parentNode.parentNode,
      starCell: document.createElement('td'),
      star: document.createElement('a'),
      thread: {
        id: threadInfo[1],
        title: threadInfo[2],
        poster: htmlDecode(threadInfo[3])
      }
    }
    threads[thread.thread.id] = thread;
    thread.starCell.bgColor = temp[i].parentNode.nextElementSibling.bgColor;
    thread.starCell.style.textAlign = 'center';
    thread.star.style.width = '15px';
    thread.star.style.height = '15px';
    thread.star.style.display = 'inline-block';
    thread.star.style.margin = '0';
    thread.starCell.appendChild(thread.star);
    thread.row.insertBefore(thread.starCell, thread.row.firstElementChild);
    thread.star.href = 'javascript:;';
    thread.star._threadId = thread.thread.id;
    thread.star.onclick = function() {
      chrome.extension.sendMessage({
        'toggleThreadStar': true,
        'thread': threads[this._threadId].thread
      }, function(response) {
        updateStars(response.starredThreads);
      });
    }
  }
  chrome.extension.sendMessage({
    'getStarredThreads': true
  }, function(response) {
    updateStars(response.starredThreads);
  });
}

function updateStars(starredThreads) {
  var ids = Object.keys(threads);
  for (var i = 0; i < ids.length; i++) {
    if (starredThreads[ids[i]]) {
      threads[ids[i]].star.style.background = "url('" + chrome.extension.getURL('/res/img/star_on.gif') + "')";
    } else {
      threads[ids[i]].star.style.background = "url('" + chrome.extension.getURL('/res/img/star_off.gif') + "')";
    }
  }
}
