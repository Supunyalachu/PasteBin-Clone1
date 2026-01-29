document.getElementById('pasteForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const content = document.getElementById('content').value;
  const expiry = Number(document.getElementById('expiry').value);
  const maxViews = Number(document.getElementById('maxViews').value);

  const res = await fetch('/api/pastes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, ttl_seconds: expiry, max_views: maxViews })
  });

  const data = await res.json();

  const resultEl = document.getElementById('result');
  if (data.url) {
    resultEl.innerHTML = `Paste created! Click here: <a href="${data.url}" target="_blank">${data.url}</a>`;
  } else if (data.error) {
    resultEl.textContent = data.error;
  }
});
