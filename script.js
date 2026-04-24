const chatArea = document.getElementById('chat-area');
const form = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const langToggle = document.getElementById('lang-toggle');
const html = document.documentElement;

// State: current language
let currentLang = localStorage.getItem('kosherLang') || 'en';

// Apply language UI
function applyLanguage(lang) {
  if (lang === 'he') {
    html.dir = 'rtl';
    html.lang = 'he';
    userInput.placeholder = 'למשל: האם סלמון כשר?';
    sendBtn.textContent = 'שלח';
  } else {
    html.dir = 'ltr';
    html.lang = 'en';
    userInput.placeholder = 'Is salmon kosher?';
    sendBtn.textContent = 'Send';
  }
}

// Toggle language
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'he' : 'en';
  localStorage.setItem('kosherLang', currentLang);
  applyLanguage(currentLang);
  // Re-focus input
  userInput.focus();
}

// Add a message to the chat
function addMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.innerHTML = `<p>${text}</p>`;
  chatArea.appendChild(msgDiv);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// Handle form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  // Show user message
  addMessage(question, 'user');
  userInput.value = '';

  // Show thinking indicator
  const thinkingDiv = document.createElement('div');
  thinkingDiv.classList.add('message', 'bot');
  thinkingDiv.innerHTML = currentLang === 'he' ? '<p><em>בודק...</em></p>' : '<p><em>Checking...</em></p>';
  chatArea.appendChild(thinkingDiv);
  chatArea.scrollTop = chatArea.scrollHeight;

  try {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    if (!response.ok) throw new Error('Server error');

    const data = await response.json();
    // Remove thinking indicator
    thinkingDiv.remove();
    // Add bot answer
    addMessage(data.answer, 'bot');
  } catch (err) {
    thinkingDiv.remove();
    addMessage(currentLang === 'he' ? 'מצטערים, משהו השתבש. נסו שוב.' : 'Sorry, something went wrong. Please try again.', 'bot');
    console.error(err);
  }
});

// Language toggle event
langToggle.addEventListener('click', toggleLanguage);

// Apply stored language on load
applyLanguage(currentLang);
