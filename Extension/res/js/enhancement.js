// Initializer
function enhancement() {
  this.queueXHR = false; // This has to be moved to be loaded from the localStorage options later.
  this.indicator = 'icon'; // This has to be moved to be loaded from the localStorage options later.
  this.iconFlags = {
    guild: ['tibiaml', 'exhiti', 'pskonejott', 'guildstats'],
    worlds: ['tibiaml', 'exhiti', 'pskonejott', 'guildstats'],
    character: ['tibiaml', 'exhiti', 'pskonejott', 'guildstats'],
    forum: ['tibiaml', 'exhiti', 'pskonejott', 'guildstats']
  };// This has to be moved to be loaded from the localStorage options later.
  if (localStorage['defaultCharacter'] != null)
    this.defaultCharacter = localStorage['defaultCharacter'];
  this.loadAllPlayersOnline();
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
  /** Kind of indicator to use. */
  indicator: 'icon',
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
      var vocation = htmlDecode(row[4]);
      players[htmlDecode(row[2])] = {
        lvl: parseInt(row[3], 10),
        voc: vocation,
        vocShort: this.shortenVocation(vocation)
      };
    }
    this.playersOnline[server] = players;
    return players;
  },
  /** Shortens Vocation */
  shortenVocation: function (voc) {
    switch(voc) {
      case 'Knight':          return 'K';
      case 'Elite Knight':    return 'EK';
      case 'Paladin':         return 'P';
      case 'Royal Paladin':   return 'RP';
      case 'Sorcerer':        return 'S';
      case 'Master Sorcerer': return 'MS';
      case 'Druid':           return 'D';
      case 'Elder Druid':     return 'ED';
      case 'None':            return 'ROOK';
      default:                return '?';
    }
  },
  iconList: {
    tibiaml: {
      name: 'Tibia ML',
      url: 'http://en.tibiaml.com/character/*PLAYER_NAME_HERE*',
      icon: chrome.extension.getURL('/res/img/tibiaml.png')
    },
    exhiti: {
      name: 'Exhiti',
      url: 'http://www.exhiti.com/experience_history/*PLAYER_NAME_HERE*',
      urlServer: 'http://www.exhiti.com/top_experience/gameworld/*SERVER_NAME_HERE*',
      icon: chrome.extension.getURL('/res/img/exhiti.png')
    },
    pskonejott: {
      name: 'Pskonejott',
      url: 'http://www.pskonejott.com/otc_display.php?character=*PLAYER_NAME_HERE*',
      urlServer: 'http://www.pskonejott.com/otc_display.php?server=*SERVER_NAME_HERE*',
      icon: chrome.extension.getURL('/res/img/pskonejott.ico')
    },
    guildstats: {
      name: 'Guild Stats',
      url: 'http://www.guildstats.eu/character?nick=*PLAYER_NAME_HERE*',
      urlServer: 'http://www.guildstats.eu/guilds?world=*SERVER_NAME_HERE*',
      icon: chrome.extension.getURL('/res/img/guildstats.png')
    }
  },
  iconFlags: {
    guild: ['tibiaml', 'exhiti', 'pskonejott'],
    worlds: ['tibiaml', 'exhiti', 'pskonejott'],
    character: ['tibiaml', 'exhiti', 'pskonejott'],
    forum: ['tibiaml', 'exhiti', 'pskonejott']
  },
  defaultCharacter: -1
};

// Create the extension's handler.
tibia = new enhancement();

// Refresh players online every once in a while.
setInterval(function () {tibia.loadAllPlayersOnline()}, tibia.playersOnlineTimeout);

/** Handle various requests made by the content scripts. */
chrome.extension.onMessage.addListener(function (request, sender, callback) {
  var response = {};
  if (request.getPlayersOnline) {
    if (!tibia.hasFinishedReading()){
      response.tryAgain = true;
    } else {
      response.tryAgain = false;
      if(request.server != null) {
        if(request.name == null) {
          response.playersOnline = tibia.playersOnline[request.server];
        } else {
          response.playersOnline = tibia.playersOnline[request.server][request.name];
        }
      } else if(request.playerList != null) {
        response.playersOnline = {};
        for (var i = 0; i < request.playerList.length; i++) {
          if (tibia.playersOnline[request.playerList[i].server]) {
            response.playersOnline[request.playerList[i].name] = tibia.playersOnline[request.playerList[i].server][request.playerList[i].name];
          }
        }
      }
    }
  }
  if (request.getPlayersOnlineTimeout)
    response.playersOnlineTimeout = tibia.playersOnlineTimeout;
  if (request.getIndicator)
    response.indicator = tibia.indicator;
  if (request.getIcons)
    response.icons = {iconList: tibia.iconList, iconFlags: tibia.iconFlags[request.iconFlags]};
  if (request.getDefaultCharacter)
    response.defaultCharacter = tibia.defaultCharacter;
  if (request.setDefaultCharacter) {
    tibia.defaultCharacter = request.defaultCharacter;
    localStorage['defaultCharacter'] = tibia.defaultCharacter;
    response.defaultCharacter = tibia.defaultCharacter;
  }
  callback(response);
});

// Listen when the Browser Action button gets clicked and open the options page.
chrome.browserAction.onClicked.addListener(function(tab) {
  var optionsPage = {'url':chrome.extension.getURL('options.html')};
  chrome.tabs.query(optionsPage, function (result) {
    if(result.length == 0) {
      chrome.tabs.create({'url':chrome.extension.getURL('options.html')});
    } else {
      chrome.tabs.update(result[0].id, {'active': true});
    }
  });
});