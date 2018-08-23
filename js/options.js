// TODO: set default open behaviour when a link is left clicked

function saveOptions() {
  var linkClick = document.getElementById('linkclick').value;
  var search = document.getElementById('search').value;
  chrome.storage.sync.set({linkClick: linkClick,
                           search: search}, function() {
    var status = document.getElementById('status');
    status.classList.add("alert");
    status.textContent = "Options saved.";
    setTimeout(function() {
      status.classList.remove("alert");
      status.textContent = "";
    }, 1000);
  });
}

function restoreOptions() {
  chrome.storage.sync.get({linkClick: 'current', search: "show"}, function(results) {
    document.getElementById('linkclick').value = results.linkClick;
    document.getElementById('search').value = results.search;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  restoreOptions();
  document.getElementById('save').addEventListener('click', saveOptions);
});
