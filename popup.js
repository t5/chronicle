window.onload=function() {
  // listen for when 'search' is used
  document.getElementById("searchButton").addEventListener("click", function() {
    chrome.tabs.query({'active': true, 'currentWindow': true}, function(tabs) {
      var searchQuery = document.getElementById("searchQuery").value;
      console.log(searchQuery);
      var currentURL = tabs[0].url;
      var currentDomain = getDomain(currentURL);
      if (currentDomain) { 
        searchHistory(currentDomain, tabs[0].id, searchQuery);
      }
    });
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
  // when maxResults is 0, it shows all search history
  if (!query) {
    var searchQuery = domain;
  } else {
    var searchQuery = domain + " " + query;
  }
  console.log("search query: " + searchQuery);
  console.log("currentTab: " + currentTabId);
  console.log("dom: " + domain);

  chrome.history.search({text: searchQuery, startTime: 0, maxResults: 0}, function(results) {
    displayMatchingUrls(results, currentTabId, domain);
  });
}

function displayMatchingUrls(resultArray, currentTabId, targetDomain) {
  // first clear any items
  document.getElementById("searchResults").innerHTML = "";
  for (item in resultArray) {
    if (getDomain(resultArray[item].url) === targetDomain) {

      var listing = document.createElement("p");
      var listingLink = document.createElement("a");
      listingLink.textContent = resultArray[item].title;
      // when a "jump to id" link is recorded in history, it has no title
      if (!listingLink.textContent) {
        listingLink.textContent = resultArray[item].url;
      }
      
      listingLink.setAttribute("href", resultArray[item].url);

      // create favicon
      var fav = document.createElement("img");
      fav.src = getFavLink(resultArray[item].url);

      // set to open link in current tab if clicked 
      setLink(listingLink, resultArray[item].url, currentTabId);

      listing.appendChild(listingLink);
      var searchResultContainer = document.getElementById("searchResults");
      searchResultContainer.appendChild(listing);
      searchResultContainer.appendChild(fav);
    }
  }
}

// Echo - Current Site History Toolbar Menu

// TODO: set default open list behaviour and how many search results shown, and key shortcut
// show search bar or not
function setLink(element, link, currentTabId) {
    element.addEventListener('click', function() {
      chrome.tabs.update(currentTabId, {url: link});
      window.close();
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
