// Auto-retry when connection is restored
window.addEventListener('online', function () {
  setTimeout(() => {
    window.location.reload();
  }, 1000);
});

// Show connection status
function updateConnectionStatus() {
  const btn = document.querySelector('.retry-btn');
  if (!btn) return;

  if (navigator.onLine) {
    btn.textContent = 'Connection Restored - Reload';
    btn.style.background = 'rgba(74, 222, 128, 0.3)';
  } else {
    btn.textContent = 'Try Again';
    btn.style.background = '';
  }
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

// Attach click handler to the retry button
function attachRetryHandler() {
  const btn = document.querySelector('.retry-btn');
  if (!btn) return;
  btn.addEventListener('click', () => window.location.reload());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    attachRetryHandler();
    updateConnectionStatus();
  });
} else {
  attachRetryHandler();
  updateConnectionStatus();
}
