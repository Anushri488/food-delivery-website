// ===== API CONFIGURATION =====
const API_BASE_URL = 'http://localhost:5000/api';

// Token ko localStorage mein save/get karne ke helper functions
function getToken() {
  return localStorage.getItem('authToken');
}

function setToken(token) {
  localStorage.setItem('authToken', token);
}

function removeToken() {
  localStorage.removeItem('authToken');
}

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// Generic API call helper — sab jagah yahi use hoga
async function apiCall(endpoint, method = 'GET', body = null, needsAuth = false) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (needsAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Kuch galat ho gaya');
  }

  return data;
}
// ===== AUTH UI LOGIC =====

function openAuthModal() {
  const user = getCurrentUser();
  if (user) {
    // Agar already login hai, to logout confirm karo
    if (confirm(`${user.name}, kya aap logout karna chahte hain?`)) {
      handleLogout();
    }
    return;
  }
  document.getElementById('auth-modal-overlay').classList.add('open');
}

function closeAuthModal() {
  document.getElementById('auth-modal-overlay').classList.remove('open');
  document.getElementById('auth-error').style.display = 'none';
}

function switchToRegister() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
  document.getElementById('auth-modal-title').innerText = '📝 Register';
}

function switchToLogin() {
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('auth-modal-title').innerText = '🔑 Login';
}

function showAuthError(message) {
  const errorEl = document.getElementById('auth-error');
  errorEl.innerText = message;
  errorEl.style.display = 'block';
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showAuthError('Email aur password dono bharo');
    return;
  }

  try {
    const data = await apiCall('/auth/login', 'POST', { email, password });
    setToken(data.token);
    setCurrentUser(data.user);
    updateAuthUI();
    closeAuthModal();
    alert(`Welcome back, ${data.user.name}!`);
  } catch (error) {
    showAuthError(error.message);
  }
}

async function handleRegister() {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const phone = document.getElementById('register-phone').value.trim();

  if (!name || !email || !password) {
    showAuthError('Naam, email, aur password zaroori hai');
    return;
  }

  try {
    const data = await apiCall('/auth/register', 'POST', { name, email, password, phone });
    setToken(data.token);
    setCurrentUser(data.user);
    updateAuthUI();
    closeAuthModal();
    alert(`Welcome, ${data.user.name}! Registration successful.`);
  } catch (error) {
    showAuthError(error.message);
  }
}

function handleLogout() {
  removeToken();
  localStorage.removeItem('currentUser');
  updateAuthUI();
  alert('Logout ho gaye');
}

function updateAuthUI() {
  const user = getCurrentUser();
  const authBtnText = document.getElementById('auth-btn-text');
  if (user) {
    authBtnText.innerText = user.name.split(' ')[0];
  } else {
    authBtnText.innerText = 'Login';
  }
}

// Page load hote hi UI update karo
document.addEventListener('DOMContentLoaded', updateAuthUI);
// ===== RESTAURANTS DATA (backend se fetch hoga) =====
let restaurantsData = [];

async function loadRestaurants() {
  try {
    const data = await apiCall('/restaurants');
    // Backend "_id" deta hai, purana code "id" expect karta hai — isliye map karo
    restaurantsData = data.restaurants.map(r => ({
      ...r,
      id: r._id,
      menu: r.menu.map(item => ({ ...item, id: item._id }))
    }));
  } catch (error) {
    console.error('Restaurants load karne mein error:', error);
    alert('Restaurants load nahi ho paye. Backend server chal raha hai check karo.');
  }
}

function isImageUrl(str) {
  return typeof str === 'string' && str.startsWith('http');
}