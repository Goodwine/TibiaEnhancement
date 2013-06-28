$(function() {
  chrome.extension.sendMessage({loadOptions:true}, function(response) {
    /* programatically generated stuff */
    /* fansite links */
    var fansiteSection = document.getElementById('fansiteSection');
    var fansiteTable = document.createElement('table');
    fansiteTable.border='1';
    var header = document.createElement('tr');
    header.appendChild(document.createElement('th'));
    for (var i in response.iconList) {
      var headCell = document.createElement('th');
      var imgIcon = document.createElement('img');
      imgIcon.className='icon';
      imgIcon.src=response.iconList[i].icon;
      imgIcon.title=imgIcon.alt=response.iconList[i].name;
      headCell.appendChild(imgIcon);
      header.appendChild(headCell);
    }
    fansiteTable.appendChild(header);
    for (var i in response.iconFlags) {
      var row = document.createElement('tr');
      var cell = document.createElement('td');
      cell.className = 'title';
      cell.innerHTML = i;
      row.appendChild(cell);
      for (var j in response.iconList) {
        cell = document.createElement('td');
        if (i == 'worlds' && !response.iconList[j].urlServer) {
          cell.className = 'disabledCell';
          row.appendChild(cell);
          continue;
        }
        var chBox = document.createElement('input');
        chBox.type = 'checkbox';
        chBox.id=i+'-'+j;
        var label = document.createElement('label');
        label.appendChild(chBox);
        cell.appendChild(label);
        row.appendChild(cell);
      }
      fansiteTable.appendChild(row);
    }
    fansiteSection.appendChild(fansiteTable);

    /* starred threads */
    /* BBCode */

    /* load values */
    $('input[name="whoisIndicator"][value="' + response.indicator + '"]').each(function(){this.checked = true;});
    $('input[name="xhrOption"][value="' + response.queueXHR + '"]').each(function(){this.checked = true;});
    $('input[name="whoisIndicator"]').each(function(){this.disabled=response.queueXHR=='none';});
    $('#noURLWarningBox').each(function(){this.checked=response.noURLWarning;});
    for (var i in response.iconFlags) {
      for (var j = 0; j < response.iconFlags[i].length; j++) {
        $('#fansiteSection #'+i+'-'+response.iconFlags[i][j]).each(function(){this.checked=true;});
      }
    }

    /* add event handlers */
    $('input[name="whoisIndicator"]').change(function(ev) {
      if(!this.checked)
        return;
      chrome.extension.sendMessage({setIndicator:true, indicator:this.value}, function(response) {
        $('input[name="whoisIndicator"][value="' + response.indicator + '"]').each(function(){this.checked = true;});
      });
    });
    $('input[name="xhrOption"]').change(function(ev) {
      if(!this.checked)
        return;
      chrome.extension.sendMessage({setQueueXHR:true, queueXHR:this.value}, function(response) {
        $('input[name="xhrOption"][value="' + response.queueXHR + '"]').each(function(){this.checked = true;});
        $('input[name="whoisIndicator"]').each(function(){this.disabled=response.queueXHR=='none';});
      });
    });
    $('#noURLWarningBox').change(function(ev) {
      chrome.extension.sendMessage({toggleNoURLWarning:true, noURLWarning:this.checked}, function(response) {
        $('#noURLWarningBox').each(function(){this.checked=response.noURLWarning;});
      });
    });
    $('#fansiteSection input[type="checkbox"]').change(function(ev){
      var icon = this.id.split('-');
      chrome.extension.sendMessage({toggleIconFlag:true, iconCategory:icon[0], iconFlagName:icon[1]}, function(response) {
        $('#fansiteSection #'+response.iconCategory+'-'+response.iconFlagName).each(function(){this.checked=response.iconFlag;});
      })
    });
  });
});
