// Admin JavaScript

let currentAdmin = null;
let currentSection = 'dashboard';

// Check admin authentication
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = '../login.html';
    return;
  }

  // Check if user is admin
  const db = firebase.firestore();
  const userDoc = await db.collection('users').doc(user.uid).get();
  
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    alert('Access denied. Admin only.');
    firebase.auth().signOut();
    window.location.href = '../login.html';
    return;
  }

  currentAdmin = user;
  document.getElementById('adminName').textContent = userDoc.data().username || 'Admin';
  loadSection('dashboard');
});

// Toggle sidebar
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// Load different sections
function loadSection(section) {
  currentSection = section;
  
  // Update active menu item
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });
  event?.target.closest('.menu-item')?.classList.add('active');
  
  // Update page title
  const titles = {
    'dashboard': 'Dashboard',
    'products': 'Product Management',
    'payments': 'Payment Methods',
    'users': 'User Management',
    'transactions': 'Transactions',
    'withdrawals': 'Withdrawal Requests',
    'referrals': 'Referral Management',
    'settings': 'System Settings'
  };
  document.getElementById('pageTitle').textContent = titles[section];
  
  // Load section content
  switch(section) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'products':
      loadProducts();
      break;
    case 'payments':
      loadPaymentMethods();
      break;
    case 'users':
      loadUsers();
      break;
    case 'transactions':
      loadTransactions();
      break;
    case 'withdrawals':
      loadWithdrawals();
      break;
    case 'referrals':
      loadReferrals();
      break;
    case 'settings':
      loadSettings();
      break;
  }
}

// Dashboard
function loadDashboard() {
  const content = document.getElementById('contentArea');
  content.innerHTML = `
    <div class="stats-grid" id="dashboardStats">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(45deg, #667eea, #764ba2);">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-info">
          <h3>Total Users</h3>
          <div class="stat-value" id="totalUsers">0</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(45deg, #ff6b6b, #feca57);">
          <i class="fas fa-box"></i>
        </div>
        <div class="stat-info">
          <h3>Active Products</h3>
          <div class="stat-value" id="activeProducts">0</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(45deg, #4caf50, #8bc34a);">
          <i class="fas fa-wallet"></i>
        </div>
        <div class="stat-info">
          <h3>Total Investments</h3>
          <div class="stat-value" id="totalInvestments">₹0</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(45deg, #f44336, #ff9800);">
          <i class="fas fa-hand-holding-usd"></i>
        </div>
        <div class="stat-info">
          <h3>Pending Withdrawals</h3>
          <div class="stat-value" id="pendingWithdrawals">0</div>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <h3 style="margin-bottom: 20px;">Recent Transactions</h3>
      <table id="recentTransactions">
        <thead>
          <tr>
            <th>User</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="5" style="text-align: center;">Loading...</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
  
  loadDashboardStats();
  loadRecentTransactions();
}

async function loadDashboardStats() {
  const db = firebase.firestore();
  
  // Get total users
  const usersSnapshot = await db.collection('users').get();
  document.getElementById('totalUsers').textContent = usersSnapshot.size;
  
  // Get active products
  const productsSnapshot = await db.collection('products').where('active', '==', true).get();
  document.getElementById('activeProducts').textContent = productsSnapshot.size;
  
  // Get total investments
  const investmentsSnapshot = await db.collection('investments').get();
  let totalInvestments = 0;
  investmentsSnapshot.forEach(doc => {
    totalInvestments += doc.data().amount || 0;
  });
  document.getElementById('totalInvestments').textContent = '₹' + totalInvestments;
  
  // Get pending withdrawals
  const withdrawalsSnapshot = await db.collection('withdrawals').where('status', '==', 'pending').get();
  document.getElementById('pendingWithdrawals').textContent = withdrawalsSnapshot.size;
}

async function loadRecentTransactions() {
  const db = firebase.firestore();
  const tbody = document.querySelector('#recentTransactions tbody');
  
  const snapshot = await db.collection('transactions')
    .orderBy('timestamp', 'desc')
    .limit(10)
    .get();
  
  if (snapshot.empty) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No transactions</td></tr>';
    return;
  }
  
  let html = '';
  for (const doc of snapshot.docs) {
    const trans = doc.data();
    const userDoc = await db.collection('users').doc(trans.userId).get();
    const username = userDoc.exists ? userDoc.data().username : 'Unknown';
    const date = trans.timestamp ? new Date(trans.timestamp.toDate()).toLocaleString() : 'N/A';
    
    html += `
      <tr>
        <td>${username}</td>
        <td>${trans.type}</td>
        <td>₹${trans.amount}</td>
        <td><span class="badge ${trans.status}">${trans.status}</span></td>
        <td>${date}</td>
      </tr>
    `;
  }
  tbody.innerHTML = html;
}

// Product Management
function loadProducts() {
  const content = document.getElementById('contentArea');
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Product Management</h2>
      <button class="btn btn-primary" onclick="showAddProductModal()">
        <i class="fas fa-plus"></i> Add New Product
      </button>
    </div>
    
    <div class="products-grid" id="productsGrid">
      <!-- Products will be loaded here -->
    </div>
  `;
  
  loadProductsList();
}

async function loadProductsList() {
  const db = firebase.firestore();
  const grid = document.getElementById('productsGrid');
  
  const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
  
  if (snapshot.empty) {
    grid.innerHTML = '<div style="text-align: center; padding: 50px;">No products found</div>';
    return;
  }
  
  let html = '';
  snapshot.forEach(doc => {
    const product = doc.data();
    html += `
      <div class="product-card">
        <img src="${product.image || 'https://via.placeholder.com/300x200'}" alt="${product.name}" class="product-image">
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price">₹${product.price}</div>
          <div class="product-stats">
            <span>Daily: ₹${product.dailyProfit}</span>
            <span>Total: ₹${product.totalIncome}</span>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 15px;">
            <span class="badge ${product.active ? 'active' : 'inactive'}">
              ${product.active ? 'Active' : 'Inactive'}
            </span>
            <button class="btn btn-primary" onclick="editProduct('${doc.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger" onclick="deleteProduct('${doc.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });
  grid.innerHTML = html;
}

// Add Product Modal
function showAddProductModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'productModal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Add New Product</h2>
        <button class="close-btn" onclick="closeModal('productModal')">&times;</button>
      </div>
      <div class="modal-body">
        <form id="productForm" onsubmit="event.preventDefault(); saveProduct()">
          <div class="form-group">
            <label>Product Name</label>
            <input type="text" id="productName" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label>Product Image URL</label>
            <input type="url" id="productImage" class="form-control" placeholder="https://...">
          </div>
          
          <div class="form-group">
            <label>Price (₹)</label>
            <input type="number" id="productPrice" class="form-control" min="0" required>
          </div>
          
          <div class="form-group">
            <label>Daily Profit (₹)</label>
            <input type="number" id="dailyProfit" class="form-control" min="0" required>
          </div>
          
          <div class="form-group">
            <label>Total Income (₹)</label>
            <input type="number" id="totalIncome" class="form-control" min="0" required>
          </div>
          
          <div class="form-group">
            <label>Duration (Days)</label>
            <input type="number" id="productDays" class="form-control" min="1" required>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="productActive" checked> Active
            </label>
          </div>
          
          <div style="display: flex; gap: 10px;">
            <button type="submit" class="btn btn-primary">Save Product</button>
            <button type="button" class="btn" onclick="closeModal('productModal')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeModal(modalId) {
  document.getElementById(modalId)?.remove();
}

async function saveProduct() {
  const db = firebase.firestore();
  
  const productData = {
    name: document.getElementById('productName').value,
    image: document.getElementById('productImage').value || 'https://via.placeholder.com/300x200',
    price: parseFloat(document.getElementById('productPrice').value),
    dailyProfit: parseFloat(document.getElementById('dailyProfit').value),
    totalIncome: parseFloat(document.getElementById('totalIncome').value),
    days: parseInt(document.getElementById('productDays').value),
    active: document.getElementById('productActive').checked,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  await db.collection('products').add(productData);
  closeModal('productModal');
  loadProducts();
}

async function editProduct(productId) {
  const db = firebase.firestore();
  const doc = await db.collection('products').doc(productId).get();
  const product = doc.data();
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'productModal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Edit Product</h2>
        <button class="close-btn" onclick="closeModal('productModal')">&times;</button>
      </div>
      <div class="modal-body">
        <form id="productForm" onsubmit="event.preventDefault(); updateProduct('${productId}')">
          <div class="form-group">
            <label>Product Name</label>
            <input type="text" id="productName" class="form-control" value="${product.name || ''}" required>
          </div>
          
          <div class="form-group">
            <label>Product Image URL</label>
            <input type="url" id="productImage" class="form-control" value="${product.image || ''}">
          </div>
          
          <div class="form-group">
            <label>Price (₹)</label>
            <input type="number" id="productPrice" class="form-control" value="${product.price || 0}" min="0" required>
          </div>
          
          <div class="form-group">
            <label>Daily Profit (₹)</label>
            <input type="number" id="dailyProfit" class="form-control" value="${product.dailyProfit || 0}" min="0" required>
          </div>
          
          <div class="form-group">
            <label>Total Income (₹)</label>
            <input type="number" id="totalIncome" class="form-control" value="${product.totalIncome || 0}" min="0" required>
          </div>
          
          <div class="form-group">
            <label>Duration (Days)</label>
            <input type="number" id="productDays" class="form-control" value="${product.days || 1}" min="1" required>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="productActive" ${product.active ? 'checked' : ''}> Active
            </label>
          </div>
          
          <div style="display: flex; gap: 10px;">
            <button type="submit" class="btn btn-primary">Update Product</button>
            <button type="button" class="btn" onclick="closeModal('productModal')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function updateProduct(productId) {
  const db = firebase.firestore();
  
  await db.collection('products').doc(productId).update({
    name: document.getElementById('productName').value,
    image: document.getElementById('productImage').value,
    price: parseFloat(document.getElementById('productPrice').value),
    dailyProfit: parseFloat(document.getElementById('dailyProfit').value),
    totalIncome: parseFloat(document.getElementById('totalIncome').value),
    days: parseInt(document.getElementById('productDays').value),
    active: document.getElementById('productActive').checked,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  closeModal('productModal');
  loadProducts();
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  const db = firebase.firestore();
  await db.collection('products').doc(productId).delete();
  loadProducts();
}

// Payment Methods Management
function loadPaymentMethods() {
  const content = document.getElementById('contentArea');
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Payment Methods</h2>
      <button class="btn btn-primary" onclick="showAddPaymentModal()">
        <i class="fas fa-plus"></i> Add Payment Method
      </button>
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Details</th>
            <th>QR Code</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="paymentMethodsList">
          <tr>
            <td colspan="5" style="text-align: center;">Loading...</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
  
  loadPaymentMethodsList();
}

async function loadPaymentMethodsList() {
  const db = firebase.firestore();
  const tbody = document.getElementById('paymentMethodsList');
  
  const snapshot = await db.collection('paymentMethods').orderBy('createdAt', 'desc').get();
  
  if (snapshot.empty) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No payment methods</td></tr>';
    return;
  }
  
  let html = '';
  snapshot.forEach(doc => {
    const method = doc.data();
    html += `
      <tr>
        <td>${method.name} (${method.type})</td>
        <td>
          ${method.details || ''}<br>
          <small>${method.upiId || ''}</small>
        </td>
        <td>
          ${method.qrCode ? `<img src="${method.qrCode}" style="width: 50px; height: 50px; object-fit: cover;">` : '-'}
        </td>
        <td><span class="badge ${method.active ? 'active' : 'inactive'}">${method.active ? 'Active' : 'Inactive'}</span></td>
        <td>
          <button class="btn btn-primary" onclick="editPaymentMethod('${doc.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger" onclick="deletePaymentMethod('${doc.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function showAddPaymentModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'paymentModal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Add Payment Method</h2>
        <button class="close-btn" onclick="closeModal('paymentModal')">&times;</button>
      </div>
      <div class="modal-body">
        <form id="paymentForm" onsubmit="event.preventDefault(); savePaymentMethod()">
          <div class="form-group">
            <label>Payment Type</label>
            <select id="paymentType" class="form-control" required>
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
              <option value="qr">QR Code</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Method Name</label>
            <input type="text" id="paymentName" class="form-control" placeholder="e.g., Google Pay" required>
          </div>
          
          <div id="upiFields">
            <div class="form-group">
              <label>UPI ID</label>
              <input type="text" id="upiId" class="form-control" placeholder="example@okhdfcbank">
            </div>
          </div>
          
          <div id="qrFields" style="display: none;">
            <div class="form-group">
              <label>QR Code Image URL</label>
              <input type="url" id="qrCodeUrl" class="form-control" placeholder="https://...">
            </div>
          </div>
          
          <div id="bankFields" style="display: none;">
            <div class="form-group">
              <label>Account Details</label>
              <textarea id="bankDetails" class="form-control" rows="3" placeholder="Enter bank account details"></textarea>
            </div>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="paymentActive" checked> Active
            </label>
          </div>
          
          <div style="display: flex; gap: 10px;">
            <button type="submit" class="btn btn-primary">Save Payment Method</button>
            <button type="button" class="btn" onclick="closeModal('paymentModal')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listener for payment type change
  document.getElementById('paymentType').addEventListener('change', function() {
    const type = this.value;
    document.getElementById('upiFields').style.display = type === 'upi' ? 'block' : 'none';
    document.getElementById('qrFields').style.display = type === 'qr' ? 'block' : 'none';
    document.getElementById('bankFields').style.display = type === 'bank' ? 'block' : 'none';
  });
}

async function savePaymentMethod() {
  const db = firebase.firestore();
  const type = document.getElementById('paymentType').value;
  
  const paymentData = {
    type: type,
  
