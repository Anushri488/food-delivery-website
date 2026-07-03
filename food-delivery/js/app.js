// ===== STATE =====
let cart = JSON.parse(localStorage.getItem('foodCart') || '[]');
let currentRestaurant = null;
let currentFilter = 'All';
let currentSort = 'default';
let searchQuery = '';

// ===== DOM REFS =====
const homePage = document.getElementById('home-page');
const menuPage = document.getElementById('menu-page');
const restaurantGrid = document.getElementById('restaurant-grid');
const menuContent = document.getElementById('menu-content');
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const cartItemsList = document.getElementById('cart-items-list');
const cartEmpty = document.getElementById('cart-empty');
const cartFooter = document.getElementById('cart-footer');
const cartCountBadge = document.getElementById('cart-count');
const floatingCart = document.getElementById('floating-cart');
const modalOverlay = document.getElementById('modal-overlay');
const successModalOverlay = document.getElementById('success-modal-overlay');
const toastContainer = document.getElementById('toast-container');
const navSearch = document.getElementById('nav-search');
const mobileSearch = document.getElementById('mobile-search');
const resultsCount = document.getElementById('results-count');
const noResults = document.getElementById('no-results');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadRestaurants();
  renderRestaurants();
  updateCartUI();
  initIntersectionObserver();
  
  // Sticky navbar
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });
});

// ===== RESTAURANTS =====
function getFilteredRestaurants() {
  let list = [...restaurantsData];
  
  // Filter by cuisine
  if (currentFilter !== 'All') {
    list = list.filter(r => r.category === currentFilter);
  }
  
  // Filter by search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.menu.some(item => item.name.toLowerCase().includes(q))
    );
  }
  
  // Sort
  if (currentSort === 'rating') list.sort((a, b) => b.rating - a.rating);
  else if (currentSort === 'delivery') list.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
  else if (currentSort === 'price') list.sort((a, b) => a.deliveryFee - b.deliveryFee);
  
  return list;
}

function renderRestaurants() {
  const list = getFilteredRestaurants();
  restaurantGrid.innerHTML = '';
  
  if (list.length === 0) {
    noResults.classList.add('visible');
    resultsCount.innerHTML = 'No restaurants found';
    return;
  }
  noResults.classList.remove('visible');
  resultsCount.innerHTML = `Showing <strong>${list.length}</strong> restaurant${list.length !== 1 ? 's' : ''}`;
  
  list.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.setAttribute('data-aos', '');
    card.style.transitionDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="card-image ${r.category.toLowerCase()}">
        ${isImageUrl(r.image)
          ? `<img src="${r.image}" style="width:100%;height:100%;object-fit:cover;">`
          : `<span class="card-image-emoji">${r.image}</span>`}
        <div class="card-image-overlay"></div>
      </div>
      <div class="card-body">
        <div class="card-header">
          <h3 class="card-name">${r.name}</h3>
          <div class="card-rating">⭐ ${r.rating}</div>
        </div>
        <p class="card-cuisine">${r.cuisine} Cuisine</p>
        <div class="card-meta">
          <span class="card-meta-item">🕐 ${r.deliveryTime}</span>
          <span class="card-meta-item">🛵 ₹${r.deliveryFee} delivery</span>
        </div>
      </div>
      <div class="card-footer">
        <button class="view-menu-btn" onclick="openMenu('${r.id}')">
          View Menu →
        </button>
      </div>
    `;
    restaurantGrid.appendChild(card);
    requestAnimationFrame(() => card.classList.add('aos-animate'));
  });
}

// ===== FILTERS =====
function setFilter(filter, el) {
  currentFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderRestaurants();
}

function setSort(val) {
  currentSort = val;
  renderRestaurants();
}

function handleSearch(q) {
  searchQuery = q;
  renderRestaurants();
}

// ===== MENU PAGE =====
function openMenu(restaurantId) {
  currentRestaurant = restaurantsData.find(r => r.id === restaurantId);
  if (!currentRestaurant) return;

  // Render header
  document.getElementById('menu-restaurant-emoji').textContent = currentRestaurant.image;
  document.getElementById('menu-restaurant-name').textContent = currentRestaurant.name;
  document.getElementById('menu-restaurant-meta').innerHTML = `
    <span class="menu-meta-pill meta-rating">⭐ ${currentRestaurant.rating}</span>
    <span class="menu-meta-pill">🕐 ${currentRestaurant.deliveryTime}</span>
    <span class="menu-meta-pill">🛵 ₹${currentRestaurant.deliveryFee} delivery</span>
    <span class="menu-meta-pill">🍽️ ${currentRestaurant.cuisine}</span>
  `;

  // Group by category
  const categories = {};
  currentRestaurant.menu.forEach(item => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  });

  // Render sidebar
  const sidebar = document.getElementById('menu-sidebar');
  sidebar.innerHTML = '<p class="sidebar-title">Categories</p>';
  Object.entries(categories).forEach(([cat, items], i) => {
    const el = document.createElement('div');
    el.className = `category-nav-item${i === 0 ? ' active' : ''}`;
    el.innerHTML = `${cat} <span class="category-count">${items.length}</span>`;
    el.onclick = () => {
      document.querySelectorAll('.category-nav-item').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      const sec = document.getElementById(`cat-${cat.replace(/\s+/g, '-')}`);
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    sidebar.appendChild(el);
  });

  // Render menu items
  const content = document.getElementById('menu-items-content');
  content.innerHTML = '';
  Object.entries(categories).forEach(([cat, items]) => {
    const section = document.createElement('div');
    section.className = 'menu-category-section';
    section.id = `cat-${cat.replace(/\s+/g, '-')}`;
    section.innerHTML = `<h3 class="menu-category-title">${getCategoryEmoji(cat)} ${cat}</h3><div class="menu-items-grid" id="grid-${cat.replace(/\s+/g, '-')}"></div>`;
    content.appendChild(section);
    
    const grid = section.querySelector('.menu-items-grid');
    items.forEach(item => {
      grid.appendChild(createMenuItemElement(item));
    });
  });

  // Switch pages
  homePage.style.display = 'none';
  menuPage.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  updateCartUI();
}

function createMenuItemElement(item) {
  const el = document.createElement('div');
  el.className = 'menu-item';
  el.id = `menu-item-${item.id}`;
  
  const cartItem = cart.find(c => c.id === item.id);
  const qty = cartItem ? cartItem.qty : 0;
  
  el.innerHTML = `
    <div class="menu-item-emoji">${getItemEmoji(item.name, item.category)}</div>
    <div class="menu-item-body">
      <div class="menu-item-top">
        <span class="menu-item-name">${item.name}</span>
        <div class="badges">
          ${item.isSpicy ? '<span class="badge badge-spicy">🌶 Spicy</span>' : ''}
          ${item.badge === 'Best Seller' ? '<span class="badge badge-bestseller">⭐ Best Seller</span>' : ''}
          ${item.badge === 'New' ? '<span class="badge badge-new">✨ New</span>' : ''}
        </div>
      </div>
      <p class="menu-item-desc">${item.description}</p>
      <div class="menu-item-footer">
        <span class="menu-item-price">${item.price}</span>
        <div id="item-action-${item.id}">
          ${qty > 0 ? getQtyControlHTML(item.id, qty) : getAddBtnHTML(item.id)}
        </div>
      </div>
    </div>
  `;
  return el;
}

function getAddBtnHTML(itemId) {
  return `<button class="add-to-cart-btn" onclick="addToCart('${itemId}')">+ Add</button>`;
}
function getQtyControlHTML(itemId, qty) {
  return `<div class="qty-control">
    <button class="qty-btn" onclick="changeQty('${itemId}', -1)">−</button>
    <span class="qty-num">${qty}</span>
    <button class="qty-btn" onclick="changeQty('${itemId}', 1)">+</button>
  </div>`;
}

function getCategoryEmoji(cat) {
  const map = { Starters:'🥗', 'Main Course':'🍲', Breads:'🫓', Rice:'🍚', Drinks:'🥤', Pizzas:'🍕', Pasta:'🍝', Sides:'🍟', Desserts:'🍰', Burgers:'🍔', Nigiri:'🍣', Rolls:'🌀', Soups:'🥣', Tacos:'🌮', Burritos:'🌯', Quesadillas:'🫔', Noodles:'🍜', Dumplings:'🥟' };
  return map[cat] || '🍽️';
}
function getItemEmoji(name, cat) {
  const n = name.toLowerCase();
  if (n.includes('chicken')) return '🍗';
  if (n.includes('pizza')) return '🍕';
  if (n.includes('burger')) return '🍔';
  if (n.includes('sushi') || n.includes('nigiri') || n.includes('roll')) return '🍣';
  if (n.includes('taco')) return '🌮';
  if (n.includes('noodle') || n.includes('hakka')) return '🍜';
  if (n.includes('rice') || n.includes('biryani')) return '🍛';
  if (n.includes('pasta') || n.includes('arrabbiata')) return '🍝';
  if (n.includes('soup') || n.includes('miso')) return '🥣';
  if (n.includes('ice cream')) return '🍨';
  if (n.includes('milkshake') || n.includes('lassi') || n.includes('horchata')) return '🥤';
  if (n.includes('fries')) return '🍟';
  if (n.includes('dumpling') || n.includes('dim sum')) return '🥟';
  if (n.includes('bread') || n.includes('naan')) return '🫓';
  if (n.includes('salad') || n.includes('guacamole') || n.includes('edamame')) return '🥗';
  if (n.includes('cake') || n.includes('tiramisu') || n.includes('matcha')) return '🍰';
  if (n.includes('spring roll')) return '🥚';
  return getCategoryEmoji(cat);
}

function backToHome() {
  menuPage.style.display = 'none';
  document.getElementById('orders-page').style.display = 'none';
  homePage.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== CART =====
function addToCart(itemId) {
  const item = findItemById(itemId);
  if (!item) return;
  
  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, emoji: getItemEmoji(item.name, item.category), qty: 1, restaurantId: currentRestaurant?.id });
  }
  
  saveCart();
  updateItemAction(itemId);
  updateCartUI();
  showToast(`${item.name} added to cart!`, '🛒', 'success');
}

function changeQty(itemId, delta) {
  const existing = cart.find(c => c.id === itemId);
  if (!existing) return;
  
  existing.qty += delta;
  if (existing.qty <= 0) {
    cart = cart.filter(c => c.id !== itemId);
    const item = findItemById(itemId);
    showToast(`${item?.name || 'Item'} removed`, '🗑️');
  }
  
  saveCart();
  updateItemAction(itemId);
  updateCartUI();
}

function findItemById(itemId) {
  for (const r of restaurantsData) {
    const item = r.menu.find(m => m.id === itemId);
    if (item) return item;
  }
  return null;
}

function updateItemAction(itemId) {
  const el = document.getElementById(`item-action-${itemId}`);
  if (!el) return;
  const cartItem = cart.find(c => c.id === itemId);
  el.innerHTML = cartItem ? getQtyControlHTML(itemId, cartItem.qty) : getAddBtnHTML(itemId);
}

function saveCart() {
  localStorage.setItem('foodCart', JSON.stringify(cart));
}

function updateCartUI() {
  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const count = cart.reduce((sum, c) => sum + c.qty, 0);
  const deliveryFee = currentRestaurant?.deliveryFee || 30;
  const tax = Math.round(total * 0.05);
  const grand = total + deliveryFee + tax;
  
  // Cart badge
  cartCountBadge.textContent = count;
  cartCountBadge.classList.toggle('visible', count > 0);
  
  // Floating cart
  if (count > 0 && menuPage.style.display !== 'none') {
    floatingCart.classList.add('visible');
    document.getElementById('floating-count').textContent = `${count} item${count !== 1 ? 's' : ''}`;
    document.getElementById('floating-total').textContent = `₹${grand}`;
  } else {
    floatingCart.classList.remove('visible');
  }
  
  // Cart drawer items
  if (cart.length === 0) {
    cartEmpty.style.display = 'flex';
    cartFooter.style.display = 'none';
    cartItemsList.innerHTML = '';
    cartItemsList.appendChild(cartEmpty);
    return;
  }
  
  cartEmpty.style.display = 'none';
  cartFooter.style.display = 'block';
  
  cartItemsList.innerHTML = '';
  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price} each</div>
      </div>
      <div class="cart-item-actions">
        <button class="cart-qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
        <span class="cart-qty-num">${item.qty}</span>
        <button class="cart-qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
      </div>
    `;
    cartItemsList.appendChild(el);
  });
  
  // Totals
  document.getElementById('cart-subtotal').textContent = `₹${total}`;
  document.getElementById('cart-delivery').textContent = `₹${deliveryFee}`;
  document.getElementById('cart-tax').textContent = `₹${tax}`;
  document.getElementById('cart-grand').textContent = `₹${grand}`;
}

// ===== CART DRAWER =====
function openCart() {
  cartOverlay.classList.add('open');
  cartDrawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartOverlay.classList.remove('open');
  cartDrawer.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== CHECKOUT =====
function proceedToCheckout() {
  if (cart.length === 0) { showToast('Your cart is empty!', '😕', 'error'); return; }
  closeCart();
  
  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const deliveryFee = currentRestaurant?.deliveryFee || 30;
  const tax = Math.round(total * 0.05);
  const grand = total + deliveryFee + tax;
  
  // Build modal items list
  const itemsHTML = cart.map(item => `
    <div class="modal-item">
      <span class="modal-item-name">${item.name}</span>
      <span class="modal-item-qty">x${item.qty}</span>
      <span class="modal-item-price">₹${item.price * item.qty}</span>
    </div>
  `).join('');
  
  document.getElementById('modal-items-list').innerHTML = itemsHTML;
  document.getElementById('modal-subtotal').textContent = `₹${total}`;
  document.getElementById('modal-delivery').textContent = `₹${deliveryFee}`;
  document.getElementById('modal-tax').textContent = `₹${tax}`;
  document.getElementById('modal-grand').textContent = `₹${grand}`;
  
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCheckoutModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

async function confirmOrder() {
  const user = getCurrentUser();
  if (!user) {
    closeCheckoutModal();
    alert('Order place karne ke liye pehle login karo!');
    openAuthModal();
    return;
  }

  const address = document.getElementById('checkout-address').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();

  if (!address || !phone) {
    alert('Delivery address aur phone number dono bharo');
    return;
  }

  try {
    const orderData = {
      restaurantId: cart[0].restaurantId,
      items: cart.map(item => ({
        menuItemId: item.id,
        quantity: item.qty
      })),
      deliveryAddress: address,
      phone: phone
    };

    const data = await apiCall('/orders', 'POST', orderData, true);
    const newOrder = data.order;

    closeCheckoutModal();

    // Cart clear karo yahin, taaki dubara payment popup se bachne pe bhi cart khaali rahe
    cart = [];
    saveCart();
    updateCartUI();

    // Ab payment shuru karo
    startPaymentForOrder(newOrder);
  } catch (error) {
    alert('Order place karne mein error: ' + error.message);
  }
}

async function startPaymentForOrder(order) {
  try {
    const payData = await apiCall('/payments/create-order', 'POST', { orderId: order._id }, true);
    const user = getCurrentUser();

    const options = {
      key: payData.keyId,
      amount: payData.amount,
      currency: payData.currency,
      name: 'QuickBite',
      description: 'Order Payment',
      order_id: payData.razorpayOrderId,
      handler: async function (response) {
        try {
          await apiCall('/payments/verify', 'POST', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: order._id
          }, true);

          showOrderSuccess(order);
        } catch (err) {
          alert('Payment verify karne mein error: ' + err.message);
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: order.phone
      },
      theme: { color: '#ff5722' },
      modal: {
        ondismiss: function () {
          alert('Payment cancel kar diya. Order place ho chuka hai (unpaid) — "My Orders" mein dekh sakti ho.');
          showOrderSuccess(order);
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (error) {
    alert('Payment start karne mein error: ' + error.message);
  }
}

function showOrderSuccess(order) {
  document.getElementById('order-id').textContent = '#' + order._id.slice(-8).toUpperCase();
  document.getElementById('delivery-eta').textContent = '30–45 mins';

  successModalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  successModalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  backToHome();
}

// ===== TOAST =====
function showToast(msg, icon = '✅', type = '') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${msg}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s reverse';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ===== HAMBURGER =====
function toggleMobileMenu() {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
}

// ===== AOS OBSERVER =====
function initIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('aos-animate');
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
  
  const mutObs = new MutationObserver(() => {
    document.querySelectorAll('[data-aos]:not(.aos-observe-init)').forEach(el => {
      el.classList.add('aos-observe-init');
      observer.observe(el);
    });
  });
  mutObs.observe(document.body, { childList: true, subtree: true });
}

// Close drawer on overlay click
cartOverlay.addEventListener('click', closeCart);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeCheckoutModal(); });
successModalOverlay.addEventListener('click', (e) => { if (e.target === successModalOverlay) closeSuccessModal(); });

// ===== ORDER HISTORY =====
let currentSocket = null;

async function openMyOrders() {
  const user = getCurrentUser();
  if (!user) {
    alert('Orders dekhne ke liye pehle login karo!');
    openAuthModal();
    return;
  }

  homePage.style.display = 'none';
  menuPage.style.display = 'none';
  document.getElementById('orders-page').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  await loadMyOrders();
  connectSocketForTracking();
}

async function loadMyOrders() {
  const listEl = document.getElementById('orders-list');
  listEl.innerHTML = '<p>Loading...</p>';

  try {
    const data = await apiCall('/orders/my-orders', 'GET', null, true);

    if (data.orders.length === 0) {
      listEl.innerHTML = '<p>Abhi tak koi order nahi hai.</p>';
      return;
    }

    listEl.innerHTML = data.orders.map(order => `
      <div class="restaurant-card" style="margin-bottom:15px; padding:20px;" id="order-card-${order._id}">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>${order.restaurant?.name || 'Restaurant'}</h3>
          <span id="order-status-${order._id}" style="background:#ff5722; color:white; padding:5px 12px; border-radius:20px; font-size:13px;">${order.status}</span>
        </div>
        <p style="margin:8px 0; color:#666;">${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
        <p><b>Total: ₹${order.totalAmount}</b></p>
        <p style="font-size:13px; color:#999;">Order ID: ${order._id}</p>
        <p style="font-size:13px; color:#999;">Placed: ${new Date(order.createdAt).toLocaleString('en-IN')}</p>
      </div>
    `).join('');

    // Har order ke liye live tracking room join karo
    data.orders.forEach(order => {
      if (currentSocket) {
        currentSocket.emit('joinOrderRoom', order._id);
      }
    });
  } catch (error) {
    listEl.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

function connectSocketForTracking() {
  if (currentSocket) return; // already connected hai to dobara connect mat karo

  currentSocket = io('http://localhost:5000');

  currentSocket.on('connect', () => {
    console.log('Live tracking connected');
  });

  currentSocket.on('orderStatusUpdated', (data) => {
    const statusEl = document.getElementById(`order-status-${data.orderId}`);
    if (statusEl) {
      statusEl.textContent = data.status;
      showToast(`Order status update hua: ${data.status}`, '🔔', 'success');
    }
  });
}
