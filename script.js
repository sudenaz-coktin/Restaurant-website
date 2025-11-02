// Sepet toplam tutarını güncelle
function updateCartTotal() {
    const orderBtn = cartContainer?.querySelector('.btn');
    if (!orderBtn) return;
    
    // Mevcut toplam elementini kaldır
    const existingTotal = cartContainer.querySelector('.cart-total');
    if (existingTotal) {
        existingTotal.remove();
    }
    
    // Sepet boşsa toplam gösterme
    if (cartItems.length === 0) {
        return;
    }
    
    const totalAmount = cartItems.reduce((total, item) => total + item.totalPrice, 0);
    
    // Toplam elementi oluştur
    const totalElement = document.createElement('div');
    totalElement.className = 'cart-total';
    totalElement.innerHTML = `
        <div class="total-content">
            <span class="total-label">Toplam:</span>
            <span class="total-amount">${totalAmount.toFixed(2)}TL</span>
        </div>
    `;
    
    // Sipariş butonundan önce ekle
    cartContainer.insertBefore(totalElement, orderBtn);
}

// Sipariş butonunu güncelle
function updateOrderButton() {
    const orderBtn = cartContainer?.querySelector('.btn');
    if (!orderBtn) return;
    
    if (cartItems.length > 0) {
        orderBtn.textContent = 'Sipariş et';
        orderBtn.style.opacity = '1';
        orderBtn.style.pointerEvents = 'auto';
    } else {
        orderBtn.textContent = 'Sepet Boş';
        orderBtn.style.opacity = '0.5';
        orderBtn.style.pointerEvents = 'none';
    }
}// Sepet verilerini saklayacak array
let cartItems = [];
let cartCounter = 0;

// DOM elementleri - Güvenli seçim
const cartContainer = document.querySelector('.cart-items-container');
const cartBtn = document.querySelector('.cart-btn');
const searchBtn = document.getElementById('search-btn');
const menuBtn = document.getElementById('menü-btn');
const navbar = document.querySelector('.navbar');
const searchForm = document.querySelector('.search-form');

// Element kontrolleri
if (!cartContainer || !cartBtn) {
    console.error('Sepet elementleri bulunamadı!');
}

// Sepet açma/kapama
if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cartContainer.classList.toggle('active');
        // Diğer menüleri kapat
        if (searchForm) searchForm.classList.remove('active');
        if (navbar) navbar.classList.remove('active');
    });
}

// Arama formu açma/kapama
if (searchBtn && searchForm) {
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        searchForm.classList.toggle('active');
        // Diğer menüleri kapat
        if (cartContainer) cartContainer.classList.remove('active');
        if (navbar) navbar.classList.remove('active');
    });
}

// Mobil menü açma/kapama
if (menuBtn && navbar) {
    menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navbar.classList.toggle('active');
        // Diğer menüleri kapat
        if (cartContainer) cartContainer.classList.remove('active');
        if (searchForm) searchForm.classList.remove('active');
    });
}

// Pencere dışına tıklandığında menüleri kapat
document.addEventListener('click', (e) => {
    // Sepet içindeki butonlara tıklandığında sepeti kapatma
    if (e.target.closest('.cart-items-container')) {
        return;
    }
    
    // Header içindeki butonlara tıklandığında menüleri kapatma
    if (e.target.closest('.header .buttons') || e.target.closest('.search-form')) {
        return;
    }
    
    // Header dışına tıklandığında tüm menüleri kapat
    if (!e.target.closest('.header')) {
        if (cartContainer) cartContainer.classList.remove('active');
        if (searchForm) searchForm.classList.remove('active');
        if (navbar) navbar.classList.remove('active');
    }
});

// ESC tuşu ile menüleri kapat
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (cartContainer) cartContainer.classList.remove('active');
        if (searchForm) searchForm.classList.remove('active');
        if (navbar) navbar.classList.remove('active');
    }
});

// Ürün sepete ekleme fonksiyonu
function addToCart(productName, productPrice, productImage, productCategory) {
    // Parametreleri kontrol et
    if (!productName || !productPrice || !productImage) {
        console.error('Ürün bilgileri eksik:', { productName, productPrice, productImage });
        showErrorMessage('Ürün bilgileri eksik!');
        return;
    }

    // Fiyatı sayıya çevir
    const price = typeof productPrice === 'number' ? productPrice : parseFloat(productPrice);
    if (isNaN(price) || price <= 0) {
        console.error('Geçersiz fiyat:', productPrice);
        showErrorMessage('Geçersiz fiyat!');
        return;
    }

    // Aynı üründen var mı kontrol et
    const existingItem = cartItems.find(item => 
        item.name === productName && item.category === productCategory
    );

    if (existingItem) {
        // Aynı ürün varsa miktarı artır
        existingItem.quantity += 1;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
    } else {
        // Yeni ürün ekle
        cartItems.push({
            id: Date.now() + Math.random(), // Daha benzersiz ID
            name: productName,
            price: price,
            image: productImage,
            category: productCategory || 'Genel',
            quantity: 1,
            totalPrice: price
        });
    }

    updateCartDisplay();
    showAddToCartMessage(productName);
}

// Sepet görünümünü güncelle
function updateCartDisplay() {
    if (!cartContainer) {
        console.error('Cart container bulunamadı!');
        return;
    }

    // Mevcut sepet öğelerini temizle (btn hariç)
    const existingItems = cartContainer.querySelectorAll('.cart-item, .empty-cart-message');
    existingItems.forEach(item => item.remove());

    // Sepet boşsa
    if (cartItems.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-cart-message';
        emptyMessage.innerHTML = '<p style="padding: 2rem; text-align: center; color: #666; font-size: 1.6rem;">Sepetiniz boş</p>';
        
        const orderBtn = cartContainer.querySelector('.btn');
        if (orderBtn) {
            cartContainer.insertBefore(emptyMessage, orderBtn);
        } else {
            cartContainer.appendChild(emptyMessage);
        }
        updateCartCounter();
        return;
    }

    // Her sepet öğesi için HTML oluştur
    cartItems.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.setAttribute('data-id', item.id);
        
        cartItemElement.innerHTML = `
            <i class="fas fa-times" onclick="removeFromCart(${item.id})"></i>
            <img src="${item.image}" alt="${item.name}" onerror="this.src='images/default-product.png'"/>
            <div class="content">
                <h3>${item.name}</h3>
                <div class="item-details">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)" type="button">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)" type="button">+</button>
                    </div>
                    <div class="fiyat">${item.totalPrice.toFixed(2)}TL</div>
                </div>
            </div>
        `;
        
        // Sipariş et butonundan önce ekle
        const orderBtn = cartContainer.querySelector('.btn');
        if (orderBtn) {
            cartContainer.insertBefore(cartItemElement, orderBtn);
        } else {
            cartContainer.appendChild(cartItemElement);
        }
    });

    updateCartCounter();
    updateOrderButton();
}

// Sepetten ürün çıkar
function removeFromCart(itemId) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const itemIndex = cartItems.findIndex(item => item.id == itemId);
    if (itemIndex === -1) {
        console.error('Silinecek ürün bulunamadı:', itemId);
        return;
    }
    
    const removedItem = cartItems[itemIndex];
    cartItems.splice(itemIndex, 1);
    updateCartDisplay();
    showRemoveMessage(removedItem.name);
}

// Ürün miktarını güncelle
function updateQuantity(itemId, change) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const item = cartItems.find(item => item.id == itemId);
    if (!item) {
        console.error('Güncellenecek ürün bulunamadı:', itemId);
        return;
    }
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    
    item.totalPrice = item.price * item.quantity;
    updateCartDisplay();
}

// Sepet sayacını güncelle
function updateCartCounter() {
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    cartCounter = totalItems;
    
    // Sepet ikonuna sayı ekle
    let counterElement = document.querySelector('.cart-counter');
    if (!counterElement && cartBtn) {
        counterElement = document.createElement('span');
        counterElement.className = 'cart-counter';
        cartBtn.style.position = 'relative';
        cartBtn.appendChild(counterElement);
    }
    
    if (counterElement) {
        if (totalItems > 0) {
            counterElement.textContent = totalItems > 99 ? '99+' : totalItems;
            counterElement.style.display = 'block';
        } else {
            counterElement.style.display = 'none';
        }
    }
}

// Sepet toplam tutarını güncelle
function updateCartTotal() {
    const orderBtn = cartContainer?.querySelector('.btn');
    if (!orderBtn) return;
    
    // Mevcut toplam elementini kaldır
    const existingTotal = cartContainer.querySelector('.cart-total');
    if (existingTotal) {
        existingTotal.remove();
    }
    
    // Sepet boşsa toplam gösterme
    if (cartItems.length === 0) {
        return;
    }
    
    const totalAmount = cartItems.reduce((total, item) => total + item.totalPrice, 0);
    
    // Toplam elementi oluştur
    const totalElement = document.createElement('div');
    totalElement.className = 'cart-total';
    totalElement.innerHTML = `
        <div class="total-line"></div>
        <div class="total-content">
            <span class="total-label">Toplam:</span>
            <span class="total-amount">${totalAmount.toFixed(2)}TL</span>
        </div>
    `;
    
    // Sipariş butonundan önce ekle
    cartContainer.insertBefore(totalElement, orderBtn);
}

// Mesaj gösterme fonksiyonları
function showMessage(text, type = 'success') {
    // Mevcut mesajı kaldır
    const existingMessage = document.querySelector('.cart-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const bgColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#ff9800';
    
    const message = document.createElement('div');
    message.className = 'cart-message';
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${bgColor};
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            font-size: 1.4rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease;
        ">
            ${text}
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 3000);
}

function showAddToCartMessage(productName) {
    showMessage(`✓ ${productName} sepete eklendi!`, 'success');
}

function showRemoveMessage(productName) {
    showMessage(`✗ ${productName || 'Ürün'} sepetten çıkarıldı!`, 'error');
}

function showErrorMessage(text) {
    showMessage(`⚠ ${text}`, 'error');
}

// Sayfa yüklendiğinde sepete ekleme butonlarını dinle
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sepet sistemi başlatılıyor...');
    
    // Menü bölümündeki "Sepete ekle" butonları
    const menuAddButtons = document.querySelectorAll('.menü .btn');
    console.log('Bulunan menü butonları:', menuAddButtons.length);
    
    menuAddButtons.forEach((btn, index) => {
        if (btn.textContent.includes('Sepete ekle')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const box = btn.closest('.box');
                if (!box) {
                    console.error('Ürün kutusu bulunamadı');
                    return;
                }
                
                const productNameEl = box.querySelector('h3');
                const priceEl = box.querySelector('.fiyat');
                const imageEl = box.querySelector('img');
                const categoryEl = box.querySelector('.menü-kategori');
                
                if (!productNameEl || !priceEl || !imageEl) {
                    console.error('Ürün bilgileri eksik:', box);
                    showErrorMessage('Ürün bilgileri bulunamadı!');
                    return;
                }
                
                const productName = productNameEl.textContent.trim();
                const priceText = priceEl.textContent.trim();
                const price = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.'));
                const image = imageEl.src;
                const category = categoryEl ? categoryEl.textContent.trim() : 'Menü';
                
                addToCart(productName, price, image, category);
            });
        }
    });

    // Ürünler bölümündeki "+" butonları
    const productAddButtons = document.querySelectorAll('.ürünler .product-btn a');
    console.log('Bulunan ürün butonları:', productAddButtons.length);
    
    productAddButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const box = btn.closest('.box');
            if (!box) {
                console.error('Ürün kutusu bulunamadı');
                return;
            }
            
            const productNameEl = box.querySelector('.name');
            const priceEl = box.querySelector('.fiyat');
            const imageEl = box.querySelector('img');
            const categoryEl = box.querySelector('.title');
            
            if (!productNameEl || !priceEl || !imageEl) {
                console.error('Ürün bilgileri eksik:', box);
                showErrorMessage('Ürün bilgileri bulunamadı!');
                return;
            }
            
            const productName = productNameEl.textContent.trim();
            const priceText = priceEl.textContent.trim();
            const price = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.'));
            const image = imageEl.src;
            const category = categoryEl ? categoryEl.textContent.trim() : 'Ürün';
            
            addToCart(productName, price, image, category);
        });
    });

    // Başlangıçta sepeti güncelle
    updateCartDisplay();
    console.log('Sepet sistemi başarıyla başlatıldı!');
});

// CSS stilleri dinamik olarak ekle
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translate(-50%, -60%);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%);
    }
}

.cart-counter {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #e84242;
    color: white;
    border-radius: 50%;
    min-width: 20px;
    height: 20px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    padding: 0 4px;
}

.quantity-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0.5rem 0;
}

.quantity-btn {
    background: #e84242;
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.quantity-btn:hover {
    background: #d73838;
    transform: scale(1.1);
}

.quantity-btn:active {
    transform: scale(0.95);
}

.quantity {
    font-size: 1.6rem;
    font-weight: bold;
    min-width: 30px;
    text-align: center;
}

.item-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.cart-item .content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.cart-item .content h3 {
    margin-bottom: 0.5rem;
    font-size: 1.8rem;
}

.cart-item {
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

.cart-item:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
}

.cart-total {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-top: 2px solid #e84242;
}

.cart-total .total-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cart-total .total-label {
    font-size: 1.6rem;
    font-weight: 600;
    color: #333;
}

.cart-total .total-amount {
    font-size: 1.8rem;
    font-weight: bold;
    color: #e84242;
}

.cart-items-container .btn {
    margin-top: 0;
    transition: all 0.3s ease;
}

.empty-cart-message {
    text-align: center;
    padding: 2rem;
    color: #666;
}
`;
document.head.appendChild(style);

// Global hata yakalama
window.addEventListener('error', (e) => {
    console.error('JavaScript hatası:', e.error);
});

// Console'da sepet durumunu kontrol etmek için
window.checkCart = () => {
    console.log('Sepet durumu:', cartItems);
    console.log('Toplam ürün:', cartCounter);
};