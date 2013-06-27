$(function() {
  /* place values */
  chrome.extension.sendMessage({loadOptions:true}, function(response) {
    $('input[name="whoisIndicator"][value="' + response.indicator + '"]').each(function(){this.checked = true;});
    $('input[name="xhrOption"][value="' + response.queueXHR + '"]').each(function(){this.checked = true;});
    $('input[name="whoisIndicator"]').each(function(){this.disabled=response.queueXHR=='none';});
    $('#noURLWarningBox').each(function(){this.checked=response.noURLWarning;});
  });

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
    chrome.extension.sendMessage({setNoURLWarning:true, noURLWarning:this.checked}, function(response) {
      $('#noURLWarningBox').each(function(){this.checked=response.noURLWarning;});
    });
  });

  /* programatically generated stuff */
  /* fansite links */
  /* starred threads */
  /* BBCode */
});
