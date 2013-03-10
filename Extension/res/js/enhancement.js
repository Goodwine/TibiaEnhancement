// Initializer
function enhancement() {
	this.queueXHR = false; // This has to be moved to be loaded from the localStorage options later.
	this.loadAllPlayersOnline();
	setInterval(function () {this.loadAllPlayersOnline()}, this.playersOnlineTimeout);
	 // Run this function every playersOnlineTimeout ms
}
enhancement.prototype = {
	serverList: ['Aldora','Amera','Antica','Arcania','Askara','Astera','Aurea','Aurera','Aurora',
	'Azura','Balera','Berylia','Calmera','Candia','Celesta','Chimera','Danera','Danubia','Dolera',
	'Elera','Elysia','Empera','Eternia','Fidera','Fortera','Furora','Galana','Grimera','Guardia',
	'Harmonia','Hiberna','Honera','Inferna','Iridia','Isara','Jamera','Julera','Keltera','Kyra',
	'Libera','Lucera','Luminera','Lunara','Magera','Malvera','Menera','Morgana','Mythera','Nebula',
	'Neptera','Nerana','Nova','Obsidia','Ocera','Olympa','Pacera','Pandoria','Premia','Pythera',
	'Refugia','Rubera','Samera','Saphira','Secura','Selena','Shanera','Shivera','Silvera','Solera',
	'Tenebra','Thoria','Titania','Trimera','Unitera','Valoria','Vinera','Xantera','Xerena','Zanera'],
	/** playersOnline will be a map of serverName=>{name,lvl,voc} */
	playersOnline: {},
	serverReadCounter: [],
	hasFinishedReading: function () {
    return this.serverReadCounter.length >= this.serverList.length;
	},
	/** Appends something to the serverReadCounter to see when is everything loaded. */
	increaseReadCounter: function () {
    if(!this.hasFinishedReading())
      this.serverReadCounter.push(0);
	},
	playersOnlineTimeout: 300000, // 5 minutes
	playersOnlineBaseURL: 'http://www.tibia.com/community/?subtopic=worlds&world=',
	playersOnlineRegExp: /subtopic=characters.*?name=(.*?)['"]\s*>(.*?)<\/a><\/td><td.*?>(\d*?)<\/td><td.*?>(.*?)<\/td>/ig,
	/** Flag used to queue XHR one after another if true, all at once if false */
	queueXHR: false,
	/** Runs loadPlayersOnline for every server in the list. */
	loadAllPlayersOnline: function() {
		if (this.queueXHR) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', this.playersOnlineBaseURL + this.serverList[0]);
			xhr.__enhancement = this;
			xhr.__serverIndex = 1;
			xhr.onreadystatechange = function () {
				if (this.readyState == 4) {
					if (this.status == 200) {
						this.__enhancement.parsePlayersOnline(this.__enhancement.serverList[this.__serverIndex], this.responseText);
						this.__enhancement.increaseReadCounter();
					}
					if(this.__serverIndex < this.__enhancement.serverList.length) {
						this.open('GET', this.__enhancement.playersOnlineBaseURL + this.__enhancement.serverList[this.__serverIndex]);
						this.__serverIndex++;
						this.send();
					}
				}
			};
			xhr.send();
		}
		else {
			for (var i in this.serverList) {
				this.loadPlayersOnline(this.serverList[i]);
			}
		}
	},
	/** Loads a map of players online {name:{lvl,voc}}, saves it to the map playersOnline and
		executes a callback function.
		server - Name of the server to load.
		callback - Function executed as callback(result), where result is a map of players online,
			null is sent when the loading failed (eg. disconnection). */
	loadPlayersOnline: function(server, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', this.playersOnlineBaseURL + server);
		xhr.__enhancement = this;
		xhr.onreadystatechange = function () {
			if (this.readyState == 4) {
				var players = null;
				if (this.status == 200) {
					players = this.__enhancement.parsePlayersOnline(server, this.responseText);
					this.__enhancement.increaseReadCounter();
				}
				if(typeof callback === 'function') {
					callback(players);
				}
			}
		};
		xhr.send();
	},
	/** Parses the raw html loaded from the server's page of online characters */
	parsePlayersOnline: function(server, responseText) {
		var row = null;
		var players = {};
		while ((row = this.playersOnlineRegExp.exec(responseText))) {
			players[this.htmlDecode(row[2])] = {lvl: parseInt(row[3], 10), voc: this.htmlDecode(row[4])};
		}
		this.playersOnline[server] = players;
		return players;
	},
	/** Decodes HTML entities such as &nbsp; or &amp; */
	htmlDecode: function(input) {
		if(/[<>]/.test(input)) {
			return "Invalid Input";
		}
		var e = document.createElement('div');
		e.innerHTML = input;
		return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
	}
};

// Create the extension's handler.
tibia = new enhancement();

/** Handle various requests made by the content scripts.

    request - implies the form {string action, ...}
*/
chrome.extension.onMessage.addListener(function (request, sender, callback) {
  var response = {};
  if(request.action != null) {
    switch(request.action) {
      case 'whois':
        if(!tibia.hasFinishedReading()){
          response.tryAgain = true;
          break;
        }
        response.tryAgain = false;
        if(request.server != null) {
          if(request.name == null) {
            response.playersOnline = tibia.playersOnline[request.server];
          } else {
            response.playersOnline = tibia.playersOnline[request.server][request.name];
          }
        } else if(request.playerList != null) {
          // TODO Forum.
        }
        break;
      default:
        console.error("Unable to handle action: " + request.action);
    }
  }
  if(request.htmlDecode)
	response.htmlDecode = tibia.htmlDecode.toString();
  callback(response);
});

// Listen when the Browser Action button gets clicked and open the options page.
chrome.browserAction.onClicked.addListener(function(tab) {
  var optionsPage = {'url':chrome.extension.getURL('options.html')};
  chrome.tabs.query(optionsPage, function (result) {console.log(result)});
  chrome.tabs.query(optionsPage, function (result) {
    if(result.length == 0) {
      chrome.tabs.create({'url':chrome.extension.getURL('options.html')});
    }
  });
});