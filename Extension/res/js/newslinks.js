/** This is a content script to add [Permalink] to the news and newstickers.
	Note: this will have to change if Cip implements sticky news.

	This content script is supposed to work only in http://www.tibia.com/news/?subtopic=latestnews
	and in http://www.tibia.com/news/?subtopic=newsarchive */

/** This function runs a XHR with POST to get the contents, it will add [Permalink] as well. */
function loadNewsLinks() {
  if(!document.getElementById('newsticker'))
    return;
	var newsHeadlineDates = $('.NewsHeadlineDate');
	var newsTickerDates = $('.NewsTickerDate');
	var beginDate = new Date(newsHeadlineDates[newsHeadlineDates.length - 1].innerText.trim().substring(0,11).replace(/\s/g, '.'));
	var endDate = new Date(newsHeadlineDates[0].innerText.trim().substring(0,11).replace(/\s/g, '.'));
	var beginDateTicker = new Date(newsTickerDates[newsTickerDates.length - 1].innerText.trim().substring(0,11).replace(/\s/g, '.'));
	var endDateTicker = new Date(newsTickerDates[0].innerText.trim().substring(0,11).replace(/\s/g, '.'));
	if(beginDate > beginDateTicker)
		beginDate = beginDateTicker;
	if(endDate < endDateTicker)
		endDate = endDateTicker;
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://www.tibia.com/news/?subtopic=newsarchive');
	xhr.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			var newsHeadlines = $('.NewsHeadlineText');
			var i = 0;
			var newsTickers = $('.NewsTickerText');
			var j = 0;
			var regexp = /<small>(.*?)<\/small><\/td>\s*<td><a .*?href=['"]http:\/\/www\.tibia\.com\/news\/\?subtopic=newsarchive.*?id=(\d+).*?>/ig;
			var row = null;
			while((row = regexp.exec(this.responseText))) {
				if(i >= newsHeadlines.length && j >= newsTickers.length) {
					break;
				}
				var link = document.createElement('a');
				link.innerText = '[Permalink]';
				link.href = 'http://www.tibia.com/news/?subtopic=newsarchive&id='+row[2];
				link.style.position = 'absolute';
				link.style.fontSize = '7pt';
				link.target = 'new';
				if(row[1] == 'News' && i < newsHeadlines.length) {
          link.style.color = 'white';
					link.style.right = '10px';
					link.style.top = '8px';
					newsHeadlines[i].parentElement.appendChild(link);
					i++;
				} else if (j < newsTickers.length){
					link.style.right = '20px';
					link.style.top = '0px';
					newsTickers[j].appendChild(link);
					j++;
				}
			}
			// Pushes News Tickers' content, so the link fits nicely.
			$('.NewsTickerShortText,.NewsTickerFullText').css({marginLeft:'85px !important',marginRight:'85px !important',height:'auto !important'});
		}
	};
	var params =
	'filter_begin_day=' + beginDate.getDate() +
	'&filter_begin_month=' + (beginDate.getMonth() + 1) +
	'&filter_begin_year=' + beginDate.getFullYear() +
	'&filter_end_day=' + endDate.getDate() +
	'&filter_end_month=' + (endDate.getMonth() + 1) +
	'&filter_end_year=' + endDate.getFullYear() +
	'&filter_ticker=ticker'+
	'&filter_news=news'+
	'&filter_cipsoft=cipsoft'+
	'&filter_community=community'+
	'&filter_development=development'+
	'&filter_support=support'+
	'&filter_technical=technical';
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send(params);
}

/*	No need for XHR when we are already there. This cleans up the URL because normally you get
  more parameters used when clicking the 'Back' button, which is not really part of the URL */
newsArchiveId = /[?&]id=(\d+)/.exec(location.search);
if(newsArchiveId && newsArchiveId.length > 0) {
  var link = document.createElement('a');
  link.innerText = '[Permalink]';
  link.href = 'http://www.tibia.com/news/?subtopic=newsarchive&id=' + newsArchiveId[1];
  link.style.position = 'absolute';
  link.style.color = 'white';
  link.style.fontSize = '7pt';
  link.target = 'new';
  link.style.right = '10px';
  link.style.top = '8px';
  $('.NewsHeadlineText')[0].parentElement.appendChild(link);
} else {
	loadNewsLinks();
}