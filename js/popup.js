var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-119305601-3']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

window.onload=function() {

  // setup settings button
  document.getElementById("gear-button").addEventListener("click", function() {
    chrome.runtime.openOptionsPage();
  });

  // make textField automatically focused
  var textField = document.getElementById("searchQuery");
  textField.focus();
  textField.style.cssText = "outline: 0 none; box-shadow: none;";

  // when Enter is pressed, search 
  textField.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      document.getElementById("searchButton").click();
    }
  });

  // load constants
  chrome.storage.sync.get({linkClick: 'current', search: "show"}, function(results) {
    CURRENT_TAB = results.linkClick === "current";
    SEARCH_BAR = results.search === "show"; 

    // listen for when 'search' is used
    if (SEARCH_BAR) {
      document.getElementById("searchButton").addEventListener("click", function() {
        chrome.tabs.query({'active': true, 'currentWindow': true}, function(tabs) {
          var searchQuery = document.getElementById("searchQuery").value;
          var currentURL = tabs[0].url;
          var currentDomain = getDomain(currentURL);
          if (currentDomain) { 
            searchHistory(currentDomain, tabs[0].id, searchQuery);
          }
        });
      });
    } else {
      // remove search bar and button
      document.getElementById("searchbarcolumn").remove();
      var replacementText = document.createElement("p");
      replacementText.textContent = "History: ";
      replacementText.style.cssText = "padding-top: 5px; display: inline;";
      replacementText.classList.add("flex-fill");
      replacementText.classList.add("h6");
      document.getElementById("btn-toolbar").insertBefore(replacementText, document.getElementById("btn-toolbar").childNodes[0]);
    }
  });
    

  // list current history
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs) {
    var currentURL = tabs[0].url;
    var currentDomain = getDomain(currentURL);
    if (currentDomain) { 
      searchHistory(currentDomain, tabs[0].id);
    } else {
      // the domain doesn't exist (i.e chrome page or something)
    }
  });
}

function searchHistory(domain, currentTabId, query = "") {
  if (!query) {
    var searchQuery = domain;
  } else {
    var searchQuery = domain + " " + query;
  }
  
  // when maxResults is 0, it shows all search history
  chrome.history.search({text: searchQuery, startTime: 0, maxResults: 0}, function(results) {
    displayMatchingUrls(results, currentTabId, domain);
  });
}

function displayMatchingUrls(resultArray, currentTabId, targetDomain) {
  // first clear any items
  document.getElementById("searchResults").innerHTML = "";
  var resultsCount = 0;
  for (item in resultArray) {
    if (getDomain(resultArray[item].url) === targetDomain) {
      var listing = document.createElement("span");
      listing.style.cssText = "word-break: break-all;";
      listing.classList.add("small");
      listing.textContent = resultArray[item].title;
      // when a "jump to id" link is recorded in history, it has no title
      if (!listing.textContent) {
        listing.textContent = resultArray[item].url;
      }
      
      // listingLink.setAttribute("href", resultArray[item].url);

      // create favicon
      var fav = document.createElement("img");
      fav.src = getFavLink(resultArray[item].url);
      fav.style.cssText = "vertical-align: middle; margin-right: 5px;";


      var searchResultContainer = document.getElementById("searchResults");
      // place link and image in a container
      var listingContainer = document.createElement("a");
      listingContainer.classList.add("list-group-item");
      listingContainer.classList.add("list-group-item-action");
      listingContainer.appendChild(fav);
      listingContainer.appendChild(listing);

      searchResultContainer.appendChild(listingContainer);

      // set to open link in current tab if clicked 
      setLink(listingContainer, resultArray[item].url, currentTabId);

      resultsCount++;
    }
  }
}

function setLink(element, link, currentTabId) {
  element.addEventListener('click', function() {
    if (CURRENT_TAB) {
      chrome.tabs.update(currentTabId, {url: link});
      window.close();
    } else {
      chrome.tabs.create({url: link});
    }
  });
}

function getDomain(url) {
  var urlObj = new URL(url);
  var regex = /\w+\.\w+$/
  var matches = urlObj.hostname.match(regex);
  if (matches)
    return matches[0];
  else
    return null
}

function getFavLink(url) {
  var urlObj = new URL(url);
  return "chrome://favicon/" + urlObj.protocol + "//" + urlObj.hostname;
}
