(function () {
  'use strict';

  var fields = document.querySelectorAll('.address');
  var cards = document.querySelectorAll('.coin');
  var page = document.querySelector('.page');
  var wallets = document.getElementById('wallets');
  var tabs = document.createElement('div');
  var selected = 0;
  var buttons = [];
  var layoutWidth = document.documentElement.clientWidth;
  var layoutHeight = window.innerHeight;
  tabs.className = 'wallet-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Cryptocurrency');
  tabs.hidden = true;

  function chooseWallet(index, focus) {
    selected = index;
    for (var i = 0; i < cards.length; i++) {
      cards[i].hidden = page.classList.contains('wallet-picker') && i !== selected;
      buttons[i].setAttribute('aria-selected', i === selected ? 'true' : 'false');
      buttons[i].tabIndex = i === selected ? 0 : -1;
    }
    if (focus) { buttons[selected].focus(); }
  }

  function fitPicker(height, width) {
    page.style.setProperty('--qr-size', '200px');
    var qr = cards[selected].querySelector('.qr-image');
    var available = qr.getBoundingClientRect().width + height - page.getBoundingClientRect().height - 8;
    var maximum = width <= 560 ? width - 60 : 280;
    page.style.setProperty('--qr-size', Math.max(160, Math.min(maximum, available, width - 60)) + 'px');
    for (var pass = 0; pass < 4; pass++) {
      var overflow = page.getBoundingClientRect().height - height + 8;
      var current = parseFloat(page.style.getPropertyValue('--qr-size'));
      if (overflow <= 0 || current <= 160) { break; }
      page.style.setProperty('--qr-size', Math.max(160, current - overflow) + 'px');
    }
  }

  function selectTab(index, focus) {
    chooseWallet(index, focus);
    fitPicker(layoutHeight, layoutWidth);
  }

  function fitLayout() {
    var height = layoutHeight;
    var width = document.documentElement.clientWidth;
    page.classList.remove('wallet-picker');
    tabs.hidden = true;
    page.style.setProperty('--qr-size', Math.max(160, Math.min(232, (height - 540) / 2)) + 'px');
    for (var i = 0; i < cards.length; i++) {
      cards[i].hidden = false;
      cards[i].removeAttribute('role');
      cards[i].setAttribute('aria-labelledby', cards[i].querySelector('h2').id);
    }
    
    if (width > 880) {
      var excess = page.getBoundingClientRect().height - height + 8;
      var gridSize = parseFloat(page.style.getPropertyValue('--qr-size'));
      if (excess > 0 && gridSize > 160) {
        page.style.setProperty('--qr-size', Math.max(160, gridSize - excess / 2) + 'px');
      }
    }
    if (width <= 880 || page.getBoundingClientRect().height > height) {
      page.classList.add('wallet-picker');
      tabs.hidden = false;
      for (var j = 0; j < cards.length; j++) {
        cards[j].setAttribute('role', 'tabpanel');
        cards[j].setAttribute('aria-labelledby', buttons[j].id);
      }
      chooseWallet(selected, false);
      fitPicker(height, width);
    }
  }

  for (var c = 0; c < cards.length; c++) {
    (function (index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'wallet-tab';
      button.id = 'wallet-tab-' + index;
      button.textContent = cards[index].querySelector('.ticker').textContent;
      button.setAttribute('aria-label', cards[index].querySelector('h2').textContent);
      button.setAttribute('role', 'tab');
      cards[index].id = 'wallet-panel-' + index;
      button.setAttribute('aria-controls', cards[index].id);
      button.addEventListener('click', function () { selectTab(index, false); });
      button.addEventListener('keydown', function (event) {
        var next = index;
        if (event.key === 'ArrowRight') { next = (index + 1) % cards.length; }
        else if (event.key === 'ArrowLeft') { next = (index + cards.length - 1) % cards.length; }
        else if (event.key === 'Home') { next = 0; }
        else if (event.key === 'End') { next = cards.length - 1; }
        else { return; }
        event.preventDefault();
        selectTab(next, true);
      });
      tabs.appendChild(button);
      buttons.push(button);
    }(c));
  }
  wallets.parentNode.insertBefore(tabs, wallets);

  function selectAddress(field) {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(field);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function copied(field) {
    window.clearTimeout(field.copyResetTimer);
    field.classList.add('is-copied');
    var feedback = document.getElementById(field.id + '-feedback');
    if (feedback) { feedback.textContent = 'Copied'; }
    field.copyResetTimer = window.setTimeout(function () {
      field.classList.remove('is-copied');
      if (feedback) { feedback.textContent = ''; }
    }, 2200);
  }

  function legacyCopy(field) {
    selectAddress(field);
    try {
      if (document.execCommand('copy')) {
        copied(field);
      }
    } catch (error) {
      
    }
  }

  function copyAddress(field) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(field.textContent.trim()).then(function () {
        copied(field);
      }, function () {
        legacyCopy(field);
      });
    } else {
      legacyCopy(field);
    }
  }

  for (var i = 0; i < fields.length; i++) {
    fields[i].classList.add('copy-enabled');
    fields[i].addEventListener('click', function () {
      copyAddress(this);
    });
    fields[i].addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        copyAddress(this);
      }
    });
  }

  fitLayout();
  window.addEventListener('resize', function () {
    var width = document.documentElement.clientWidth;
    if (width <= 880 && width === layoutWidth) { return; }
    layoutWidth = width;
    layoutHeight = window.innerHeight;
    fitLayout();
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitLayout);
  }
}());
