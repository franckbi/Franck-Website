// Fallback script used by the service worker when returning the offline HTML
(function () {
  function attachRetry() {
    var btn = document.getElementById('sw-retry-btn');
    if (btn)
      btn.addEventListener('click', function () {
        window.location.reload();
      });
  }

  function setupOnlineListeners() {
    window.addEventListener('online', function () {
      setTimeout(function () {
        window.location.reload();
      }, 1000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      attachRetry();
      setupOnlineListeners();
    });
  } else {
    attachRetry();
    setupOnlineListeners();
  }
})();
