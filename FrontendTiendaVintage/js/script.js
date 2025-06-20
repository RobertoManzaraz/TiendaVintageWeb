// --- CONFIGURACIÓN DE LA API (¡AJUSTAR ESTA URL A TU BACKEND ASP.NET CORE!) ---
const BASE_API_URL = 'http://localhost:5165'; // <-- ¡IMPORTANTE! Ajusta esto a la URL de tu API

// --- LÓGICA DEL CARRITO DE COMPRAS (Variables y funciones globales para su fácil acceso) ---
// Inicializar el carrito desde localStorage o como un array vacío
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Variables para elementos del DOM relacionadas con el carrito y modales.
// Se declaran aquí globalmente, pero se asignarán sus referencias DOM dentro de DOMContentLoaded
let cartItemCountSpan;
let cartItemsContainer;
let emptyCartMessage;
let cartSubtotalSpan;
let cartShippingSpan;
let cartTotalSpan;

let notificationModal;
let notificationTitle;
let notificationMessage;
let closeNotificationBtn;

let loginModal;
let closeLoginBtn; // Renombrado para evitar conflicto con closeNotificationBtn
let loginForm;
let registerForm;
let showRegisterLink;
let showLoginLink;
let loginBtn; // El botón de "Login" en la navbar

// --- NUEVO: Elementos para mostrar estado de autenticación ---
let userProfileBtn; // Botón para ver perfil o cerrar sesión
let userNameDisplay; // Elemento para mostrar el nombre de usuario
let logoutBtn; // Botón de cerrar sesión

// Variables para elementos del DOM relacionadas con el panel de administración (admin.html)
// Product Management Elements
let productForm;
let productIdInput;
let productNameInput;
let productDescriptionInput;
let productPriceInput;
let productStockInput;
let productImageUrlInput;
let productCategorySelect; // For product assignment
let productIsOfferCheckbox;
let productFormTitle;
let submitProductBtn;
let cancelProductEditBtn; // Renamed for clarity
let productListTableBody;

// Category Management Elements
let categoryForm;
let categoryIdInput;
let categoryNameInput;
let categoryParentSelect; // For parent category assignment
let categoryFormTitle;
let submitCategoryBtn;
let cancelCategoryEditBtn;
let categoryListTableBody;

// Tab navigation buttons
let showProductsBtn;
let showCategoriesBtn;
let productManagementSection;
let categoryManagementSection;

let allCategories = []; // To store fetched categories globally for admin panel use

// --- NUEVO: Variables para almacenar el estado de autenticación ---
let currentUser = null; // Almacena el objeto { username, token, role }
const TOKEN_STORAGE_KEY = 'userToken';
const USER_ROLE_STORAGE_KEY = 'userRole';

// --- NUEVO: Función para obtener el token JWT de localStorage ---
function getAuthToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

// --- NUEVO: Función para obtener el rol del usuario de localStorage ---
function getUserRole() {
    return localStorage.getItem(USER_ROLE_STORAGE_KEY);
}

// --- NUEVO: Función para guardar el token y rol en localStorage ---
function saveAuthData(token, role) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_ROLE_STORAGE_KEY, role);
    currentUser = { token, role }; // Actualiza la variable global
    updateAuthUI(); // Actualiza la interfaz de usuario de autenticación
}

// --- NUEVO: Función para limpiar datos de autenticación ---
function clearAuthData() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_ROLE_STORAGE_KEY);
    currentUser = null; // Limpia la variable global
    updateAuthUI(); // Actualiza la interfaz de usuario de autenticación
    if (window.location.pathname.includes('admin.html')) {
        // Si estábamos en admin.html, redirige al cerrar sesión
        window.location.href = 'index.html'; 
    }
}

// --- NUEVO: Función para actualizar la interfaz de usuario de autenticación (navbar) ---
function updateAuthUI() {
    const token = getAuthToken();
    const role = getUserRole();
    const loginLink = document.getElementById('login-btn'); // Asumo que el botón de login en la navbar tiene este ID
    const userProfileSection = document.getElementById('user-profile-section'); // Un div o sección en tu navbar para el perfil
    const adminLink = document.getElementById('admin-link'); // Asumo que tienes un enlace a admin.html en la navbar

    if (token && role) {
        // Usuario autenticado
        if (loginLink) loginLink.style.display = 'none'; // Oculta el botón de login
        if (userProfileSection) {
            userProfileSection.style.display = 'flex'; // Muestra la sección de perfil
            if (userNameDisplay) userNameDisplay.textContent = `Hola, ${role}!`; // Puedes obtener el nombre de usuario del token si lo parseas
        }
        // Si es admin, muestra el enlace al panel de administración
        if (adminLink && role === 'Admin') {
            adminLink.style.display = 'block'; // O 'inline-block' según tu CSS
        } else if (adminLink) {
            adminLink.style.display = 'none';
        }
    } else {
        // Usuario no autenticado
        if (loginLink) loginLink.style.display = 'block';
        if (userProfileSection) userProfileSection.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}


// --- LÓGICA DEL CARRITO DE COMPRAS (Funciones) ---
function updateCartItemCount() {
    if (cartItemCountSpan) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCountSpan.textContent = totalItems;
        if (totalItems > 0) {
            cartItemCountSpan.style.display = 'inline-block';
        } else {
            cartItemCountSpan.style.display = 'none';
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartItemCount();
}

function renderCartItems() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartSubtotalSpan) cartSubtotalSpan.textContent = '0';
        if (cartTotalSpan) cartTotalSpan.textContent = '0';
        return;
    } else {
        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    }

    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.dataset.productId = item.id;

        cartItemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='https://placehold.co/80x80/ECEFF1/607D8B?text=Sin%20Imagen';">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>Precio Unitario: $${item.price.toLocaleString('es-AR')}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="decrease-quantity-btn" data-product-id="${item.id}">-</button>
                <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-product-id="${item.id}">
                <button class="increase-quantity-btn" data-product-id="${item.id}">+</button>
            </div>
            <p class="cart-item-price">$${(item.price * item.quantity).toLocaleString('es-AR')}</p>
            <button class="remove-item-btn" data-product-id="${item.id}">X</button>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
    });

    updateCartSummary();
}

function updateCartSummary() {
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const shipping = 0;
    const total = subtotal + shipping;

    if (cartSubtotalSpan) cartSubtotalSpan.textContent = subtotal.toLocaleString('es-AR');
    if (cartShippingSpan) cartShippingSpan.textContent = shipping.toLocaleString('es-AR');
    if (cartTotalSpan) cartTotalSpan.textContent = total.toLocaleString('es-AR');
}

// --- FUNCIONES DE NOTIFICACIÓN PERSONALIZADA ---
function showNotification(message, type = 'info', title = 'Información') {
    if (!notificationModal || !notificationTitle || !notificationMessage) {
        console.warn('Elementos del modal de notificación no encontrados. Mensaje:', message);
        console.log(`Notification: ${title} - ${message}`);
        return;
    }

    notificationTitle.className = '';
    notificationTitle.innerHTML = '';
    notificationMessage.textContent = message;

    let iconClass = '';
    switch (type) {
        case 'success':
            notificationTitle.classList.add('notification-success');
            iconClass = 'bi bi-check-circle-fill';
            title = title === 'Información' ? 'Éxito' : title;
            break;
        case 'error':
            notificationTitle.classList.add('notification-error');
            iconClass = 'bi bi-x-circle-fill';
            title = title === 'Información' ? 'Error' : title;
            break;
        case 'info':
        default:
            notificationTitle.classList.add('notification-info');
            iconClass = 'bi bi-info-circle-fill';
            title = title === 'Información' ? 'Información' : title;
            break;
    }

    notificationTitle.innerHTML = `<i class="${iconClass}"></i> ${title}`;
    notificationModal.style.display = 'flex';
}

// --- LÓGICA ESPECÍFICA PARA LA PÁGINA DE ADMINISTRACIÓN (admin.html) ---

// Function to get all DOM elements specific to admin.html
function loadAdminElements() {
    // Product Management Elements
    productForm = document.getElementById('product-form');
    productIdInput = document.getElementById('product-id');
    productNameInput = document.getElementById('product-name');
    productDescriptionInput = document.getElementById('product-description');
    productPriceInput = document.getElementById('product-price');
    productStockInput = document.getElementById('product-stock');
    productImageUrlInput = document.getElementById('product-image-url');
    productCategorySelect = document.getElementById('product-category'); // For product assignment
    productIsOfferCheckbox = document.getElementById('product-is-offer');
    productFormTitle = document.getElementById('product-form-title');
    submitProductBtn = document.getElementById('submit-product-btn');
    cancelProductEditBtn = document.getElementById('cancel-product-edit-btn');
    productListTableBody = document.getElementById('product-list');

    // Category Management Elements
    categoryForm = document.getElementById('category-form');
    categoryIdInput = document.getElementById('category-id');
    categoryNameInput = document.getElementById('category-name');
    categoryParentSelect = document.getElementById('category-parent');
    categoryFormTitle = document.getElementById('category-form-title');
    submitCategoryBtn = document.getElementById('submit-category-btn');
    cancelCategoryEditBtn = document.getElementById('cancel-category-edit-btn');
    categoryListTableBody = document.getElementById('category-list');

    // Tab navigation buttons
    showProductsBtn = document.getElementById('show-products-btn');
    showCategoriesBtn = document.getElementById('show-categories-btn');
    productManagementSection = document.getElementById('product-management-section');
    categoryManagementSection = document.getElementById('category-management-section');
}

// Reusable function to fetch all categories
async function fetchAllCategories() {
    try {
        const response = await fetch(`${BASE_API_URL}/api/Categorias`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allCategories = await response.json(); // Store categories globally
        return allCategories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        showNotification('Error al cargar categorías: ' + error.message, 'error', 'Error de API');
        return [];
    }
}

// Function to populate a given select element with categories
function populateCategoryDropdown(selectElement, defaultOptionText, currentSelectedId = null) {
    if (!selectElement) return;

    selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
    // Filter out the category being edited from its own parent options (to prevent circular references)
    const currentCategoryId = categoryIdInput ? parseInt(categoryIdInput.value) : null;

    allCategories.forEach(category => {
        // Accessing properties with camelCase from backend
        if (currentSelectedId !== null && category.id === currentSelectedId && selectElement === categoryParentSelect) {
            // If editing a category, do not allow it to be its own parent
            return; 
        }
        if (currentCategoryId && category.id === currentCategoryId && selectElement === categoryParentSelect) {
            return; // Skip the category itself when populating parent dropdown
        }

        const option = document.createElement('option');
        option.value = category.id; // Accessing with camelCase
        option.textContent = category.nombre; // Accessing with camelCase
        if (currentSelectedId !== null && category.id === currentSelectedId) { // Accessing with camelCase
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}

// --- NUEVO: Función auxiliar para obtener los headers con el token JWT ---
function getAuthHeaders() {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// --- Product CRUD Functions (modificadas para incluir token y corregir nombres de propiedades) ---
async function loadAdminProducts() {
    if (!productListTableBody) return;

    productListTableBody.innerHTML = '<tr><td colspan="9" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">Cargando productos...</td></tr>';
    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        
        productListTableBody.innerHTML = '';
        if (products.length === 0) {
            productListTableBody.innerHTML = '<tr><td colspan="9" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">No hay productos registrados.</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
            // Find category name from the global allCategories array
            // Accessing properties with camelCase from backend
            const categoryName = allCategories.find(cat => cat.id === product.categoriaId)?.nombre || 'N/A'; 
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${product.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <img src="${product.imagenUrl}" alt="${product.nombre}" class="h-10 w-10 rounded-full" onerror="this.onerror=null; this.src='https://placehold.co/40x40/ECEFF1/607D8B?text=No%20Img';">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${product.nombre}</td>
                <td class="px-6 py-4 whitespace-nowrap overflow-hidden max-w-xs truncate" title="${product.descripcion}">${product.descripcion}</td>
                <td class="px-6 py-4 whitespace-nowrap">$${product.precio.toLocaleString('es-AR')}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.stock}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.estaEnOferta ? 'Sí' : 'No'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${categoryName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="edit-product-btn text-indigo-600 hover:text-indigo-900 mr-4" data-product-id="${product.id}">
                        <i class="bi bi-pencil-square"></i> Editar
                    </button>
                    <button class="delete-product-btn text-red-600 hover:text-red-900" data-product-id="${product.id}">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            `;
            productListTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
        showNotification('Error al cargar productos: ' + error.message, 'error', 'Error de API');
        productListTableBody.innerHTML = '<tr><td colspan="9" class="px-6 py-4 whitespace-nowrap text-center text-red-500">Error al cargar productos.</td></tr>';
    }
}

async function addProduct(productData) {
    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos`, {
            method: 'POST',
            headers: getAuthHeaders(), // Envía el token JWT
            body: JSON.stringify(productData) // productData ya debería estar en PascalCase aquí
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        showNotification('Producto añadido con éxito.', 'success');
        resetProductForm();
        loadAdminProducts();
    } catch (error) {
        console.error("Error al añadir producto:", error);
        // Manejo específico para 401 Unauthorized o 403 Forbidden
        if (error.message.includes('401') || error.message.includes('403')) {
            showNotification('No autorizado. Por favor, inicia sesión como administrador.', 'error', 'Acceso Denegado');
            clearAuthData(); // Limpia el token inválido o expirado
        } else {
            showNotification('Error al añadir producto: ' + error.message, 'error', 'Error de API');
        }
    }
}

async function updateProduct(id, productData) {
    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(), // Envía el token JWT
            body: JSON.stringify(productData) // productData ya debería estar en PascalCase aquí
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        showNotification('Producto actualizado con éxito.', 'success');
        resetProductForm();
        loadAdminProducts();
    } catch (error) {
        console.error(`Error al actualizar producto ${id}:`, error);
        if (error.message.includes('401') || error.message.includes('403')) {
            showNotification('No autorizado. Por favor, inicia sesión como administrador.', 'error', 'Acceso Denegado');
            clearAuthData();
        } else {
            showNotification(`Error al actualizar producto: ${error.message}`, 'error', 'Error de API');
        }
    }
}

async function deleteProduct(id) {
    // Reemplazando confirm() con showNotification para modal
    // Idealmente, esto debería ser un modal personalizado con botones "Sí"/"No" que maneje la promesa.
    // Por simplicidad, se mantiene window.confirm() como un hack temporal para la confirmación.
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        return;
    }

    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos/${id}`, { 
            method: 'DELETE',
            headers: getAuthHeaders() // Envía el token JWT
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        showNotification('Producto eliminado con éxito.', 'success');
        loadAdminProducts();
    } catch (error) {
        console.error(`Error al eliminar producto ${id}:`, error);
        if (error.message.includes('401') || error.message.includes('403')) {
            showNotification('No autorizado. Por favor, inicia sesión como administrador.', 'error', 'Acceso Denegado');
            clearAuthData();
        } else {
            showNotification(`Error al eliminar producto: ${error.message}`, 'error', 'Error de API');
        }
    }
}

async function getProductById(id) {
    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al obtener producto ${id}:`, error);
        showNotification(`Error al obtener producto: ${error.message}`, 'error', 'Error de API');
        return null;
    }
}

function populateProductFormForEdit(product) {
    // Accessing properties with camelCase from backend
    productIdInput.value = product.id; 
    productNameInput.value = product.nombre; 
    productDescriptionInput.value = product.descripcion; 
    productPriceInput.value = product.precio; 
    productStockInput.value = product.stock; 
    productImageUrlInput.value = product.imagenUrl; 
    populateCategoryDropdown(productCategorySelect, 'Selecciona una categoría', product.categoriaId); 
    productIsOfferCheckbox.checked = product.estaEnOferta;

    productFormTitle.textContent = 'Editar Producto';
    submitProductBtn.textContent = 'Actualizar Producto';
    cancelProductEditBtn.style.display = 'inline-block';
}

function resetProductForm() {
    productForm.reset();
    productIdInput.value = '';
    productFormTitle.textContent = 'Añadir Nuevo Producto';
    submitProductBtn.textContent = 'Añadir Producto';
    cancelProductEditBtn.style.display = 'none';
    populateCategoryDropdown(productCategorySelect, 'Selecciona una categoría'); // Reset dropdown
}

// --- Category CRUD Functions (modificadas para incluir token y corregir nombres de propiedades) ---
async function loadAdminCategories() {
    if (!categoryListTableBody) return;

    categoryListTableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">Cargando categorías...</td></tr>';
    try {
        const response = await fetch(`${BASE_API_URL}/api/Categorias`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allCategories = await response.json(); // Update global allCategories
        
        if (allCategories.length === 0) {
            categoryListTableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">No hay categorías registradas.</td></tr>';
            return;
        }

        categoryListTableBody.innerHTML = '';
        allCategories.forEach(category => {
            // Accessing properties with camelCase from backend
            const parentCategory = allCategories.find(c => c.id === category.parentCategoryId);
            const parentName = parentCategory ? parentCategory.nombre : 'N/A (Principal)';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${category.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${category.nombre}</td>
                <td class="px-6 py-4 whitespace-nowrap">${parentName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="edit-category-btn text-indigo-600 hover:text-indigo-900 mr-4" data-category-id="${category.id}">
                        <i class="bi bi-pencil-square"></i> Editar
                    </button>
                    <button class="delete-category-btn text-red-600 hover:text-red-900" data-category-id="${category.id}">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            `;
            categoryListTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar categorías en tabla:", error);
        showNotification('Error al cargar categorías en tabla: ' + error.message, 'error', 'Error de API');
        categoryListTableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 whitespace-nowrap text-center text-red-500">Error al cargar categorías.</td></tr>';
    }
}

async function addCategory(categoryData) {
    try {
        const response = await fetch(`${BASE_API_URL}/api/Categorias`, {
            method: 'POST',
            headers: getAuthHeaders(), // Envía el token JWT
            body: JSON.stringify(categoryData) // categoryData ya debería estar en PascalCase aquí
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        showNotification('Categoría añadida con éxito.', 'success');
        resetCategoryForm();
        await fetchAllCategories(); // Re-fetch all categories to update dropdowns and table
        loadAdminCategories();
        // Update product form's category dropdown as well
        populateCategoryDropdown(productCategorySelect, 'Selecciona una categoría');
    } catch (error) {
        console.error("Error al añadir categoría:", error);
        if (error.message.includes('401') || error.message.includes('403')) {
            showNotification('No autorizado. Por favor, inicia sesión como administrador.', 'error', 'Acceso Denegado');
            clearAuthData();
        } else {
            showNotification('Error al añadir categoría: ' + error.message, 'error', 'Error de API');
        }
    }
}

async function updateCategory(id, categoryData) {
    try {
        const response = await fetch(`${BASE_API_URL}/api/Categorias/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(), // Envía el token JWT
            body: JSON.stringify(categoryData) // categoryData ya debería estar en PascalCase aquí
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        showNotification('Categoría actualizada con éxito.', 'success');
        resetCategoryForm();
        await fetchAllCategories(); // Re-fetch all categories
        loadAdminCategories();
        // Update product form's category dropdown as well
        populateCategoryDropdown(productCategorySelect, 'Selecciona una categoría');
    } catch (error) {
        console.error(`Error al actualizar categoría ${id}:`, error);
        if (error.message.includes('401') || error.message.includes('403')) {
            showNotification('No autorizado. Por favor, inicia sesión como administrador.', 'error', 'Acceso Denegado');
            clearAuthData();
        } else {
            showNotification(`Error al actualizar categoría: ${error.message}`, 'error', 'Error de API');
        }
    }
}

async function deleteCategory(id) {
    // Reemplazando confirm() con showNotification para modal
    // Idealmente, esto debería ser un modal personalizado con botones "Sí"/"No" que maneje la promesa.
    // Por simplicidad, se mantiene window.confirm() como un hack temporal para la confirmación.
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Si hay productos asignados a ella o subcategorías, podrían quedar sin categoría o causar errores.')) {
        return;
    }

    try {
        const response = await fetch(`${BASE_API_URL}/api/Categorias/${id}`, { 
            method: 'DELETE',
            headers: getAuthHeaders() // Envía el token JWT
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        showNotification('Categoría eliminada con éxito.', 'success');
        await fetchAllCategories(); // Re-fetch all categories
        loadAdminCategories();
        // Update product form's category dropdown as well
        populateCategoryDropdown(productCategorySelect, 'Selecciona una categoría');
    } catch (error) {
        console.error(`Error al eliminar categoría ${id}:`, error);
        if (error.message.includes('401') || error.message.includes('403')) {
            showNotification('No autorizado. Por favor, inicia sesión como administrador.', 'error', 'Acceso Denegado');
            clearAuthData();
        } else {
            showNotification(`Error al eliminar categoría: ${error.message}`, 'error', 'Error de API');
        }
    }
}

async function getCategoryById(id) {
    try {
        const response = await fetch(`${BASE_API_URL}/api/Categorias/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al obtener categoría ${id}:`, error);
        showNotification(`Error al obtener categoría: ${error.message}`, 'error', 'Error de API');
        return null;
    }
}

function populateCategoryFormForEdit(category) {
    // Accessing properties with camelCase from backend
    categoryIdInput.value = category.id;
    categoryNameInput.value = category.nombre;
    // For parent category dropdown, filter out the category itself and its descendants
    populateCategoryDropdown(categoryParentSelect, 'Ninguna (Categoría Principal)', category.parentCategoryId || '');
    
    categoryFormTitle.textContent = 'Editar Categoría';
    submitCategoryBtn.textContent = 'Actualizar Categoría';
    cancelCategoryEditBtn.style.display = 'inline-block';
}

function resetCategoryForm() {
    categoryForm.reset();
    categoryIdInput.value = '';
    categoryFormTitle.textContent = 'Añadir Nueva Categoría';
    submitCategoryBtn.textContent = 'Añadir Categoría';
    cancelCategoryEditBtn.style.display = 'none';
    populateCategoryDropdown(categoryParentSelect, 'Ninguna (Categoría Principal)'); // Reset parent dropdown
}

// --- Admin Tab Switching Logic ---
function showSection(sectionId) {
    // Hide all sections
    if (productManagementSection) productManagementSection.classList.remove('active-section');
    if (categoryManagementSection) categoryManagementSection.classList.remove('active-section');

    // Remove active class from all buttons
    if (showProductsBtn) showProductsBtn.classList.remove('active');
    if (showCategoriesBtn) showCategoriesBtn.classList.remove('active');

    // Show the selected section and activate its button
    if (sectionId === 'product-management-section' && productManagementSection) {
        productManagementSection.classList.add('active-section');
        if (showProductsBtn) showProductsBtn.classList.add('active');
        // Reload products and product categories when showing product section
        loadAdminProducts();
        populateCategoryDropdown(productCategorySelect, 'Selecciona una categoría');
    } else if (sectionId === 'category-management-section' && categoryManagementSection) {
        categoryManagementSection.classList.add('active-section');
        if (showCategoriesBtn) showCategoriesBtn.classList.add('active');
        // Reload categories when showing category section
        loadAdminCategories();
        populateCategoryDropdown(categoryParentSelect, 'Ninguna (Categoría Principal)');
    }
}

// --- Event Listeners Globales (delegación de eventos para todas las páginas) ---
document.addEventListener('click', (event) => {
    // Lógica para añadir al carrito
    if (event.target.classList.contains('add-to-cart-btn')) {
        const productId = event.target.dataset.productId;
        const productName = event.target.dataset.productName;
        const productPrice = parseFloat(event.target.dataset.productPrice);
        const productImage = event.target.dataset.productImage;

        const existingItem = cart.find(item => item.id == productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }
        saveCart();
        showNotification(`${productName} añadido al carrito!`, 'success');
    }

    // Lógica para el botón "Proceder al Pago"
    if (event.target.classList.contains('checkout-btn')) {
        if (cart.length === 0) {
            showNotification('Tu carrito está vacío. ¡Añade algunos productos antes de proceder al pago!', 'info');
            return;
        }

        showNotification('¡Gracias por tu compra! Tu pedido ha sido procesado con éxito.', 'success', 'Compra Exitosa');

        cart = []; // Vaciar carrito después de la compra
        saveCart(); // Guardar carrito vacío
        renderCartItems(); // Actualizar la vista del carrito (si estamos en carrito.html)

        setTimeout(() => {
            window.location.href = 'gracias.html'; // Asegúrate de que 'gracias.html' exista
        }, 500);
    }

    // Lógica para el carrito de compras (remover, aumentar, disminuir cantidad)
    if (event.target.classList.contains('remove-item-btn')) {
        const productIdToRemove = event.target.dataset.productId;
        cart = cart.filter(item => item.id != productIdToRemove);
        saveCart();
        renderCartItems();
    } else if (event.target.classList.contains('increase-quantity-btn')) {
        const productIdToUpdate = event.target.dataset.productId;
        const itemToUpdate = cart.find(item => item.id == productIdToUpdate);
        if (itemToUpdate) {
            itemToUpdate.quantity++;
            saveCart();
            renderCartItems();
        }
    } else if (event.target.classList.contains('decrease-quantity-btn')) {
        const productIdToUpdate = event.target.dataset.productId;
        const itemToUpdate = cart.find(item => item.id == productIdToUpdate);
        if (itemToUpdate && itemToUpdate.quantity > 1) {
            itemToUpdate.quantity--;
            saveCart();
            renderCartItems();
        } else if (itemToUpdate && itemToUpdate.quantity === 1) {
            cart = cart.filter(item => item.id != productIdToUpdate);
            saveCart();
            renderCartItems();
        }
    }

    // Lógica para abrir el modal de Login
    if (event.target.id === 'login-btn') {
        event.preventDefault();
        if (loginModal && loginForm && registerForm) {
            loginModal.style.display = 'flex';
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            if (loginModal.querySelector('h2')) {
                loginModal.querySelector('h2').textContent = 'Iniciar Sesión';
            }
        }
    }
    // --- NUEVO: Lógica para el botón de Cerrar Sesión ---
    if (event.target.id === 'logout-btn') {
        event.preventDefault();
        clearAuthData(); // Limpia el token y el rol del almacenamiento local
        showNotification('Has cerrado sesión.', 'info', 'Sesión Terminada');
        // Si estabas en el panel de admin, te redirige al index
        if (window.location.pathname.includes('admin.html')) {
            window.location.href = 'index.html';
        }
    }

    // Lógica para cerrar el modal de Login por la 'X'
    if (event.target.classList.contains('close-btn') && event.target.closest('#login-modal')) {
        if (loginModal) {
            loginModal.style.display = 'none';
        }
    }

    // Lógica para cerrar el modal de Notificación por la 'X'
    if (event.target.classList.contains('close-notification-btn') && event.target.closest('#custom-notification-modal')) {
        if (notificationModal) {
            notificationModal.style.display = 'none';
        }
    }

    // Lógica para Editar Producto (desde admin.html)
    if (event.target.classList.contains('edit-product-btn') && window.location.pathname.includes('admin.html')) {
        // --- NUEVO: Verificar si el usuario tiene rol de Admin antes de editar ---
        if (getUserRole() !== 'Admin') {
            showNotification('No tienes permisos de administrador para editar productos.', 'error', 'Acceso Denegado');
            return;
        }
        const productId = event.target.dataset.productId;
        getProductById(productId).then(product => {
            if (product) {
                populateProductFormForEdit(product);
            }
        });
    }

    // Lógica para Eliminar Producto (desde admin.html)
    if (event.target.classList.contains('delete-product-btn') && window.location.pathname.includes('admin.html')) {
        // --- NUEVO: Verificar si el usuario tiene rol de Admin antes de eliminar ---
        if (getUserRole() !== 'Admin') {
            showNotification('No tienes permisos de administrador para eliminar productos.', 'error', 'Acceso Denegado');
            return;
        }
        const productId = event.target.dataset.productId;
        deleteProduct(productId);
    }

    // Lógica para Editar Categoría (desde admin.html)
    if (event.target.classList.contains('edit-category-btn') && window.location.pathname.includes('admin.html')) {
        // --- NUEVO: Verificar si el usuario tiene rol de Admin antes de editar ---
        if (getUserRole() !== 'Admin') {
            showNotification('No tienes permisos de administrador para editar categorías.', 'error', 'Acceso Denegado');
            return;
        }
        const categoryId = event.target.dataset.categoryId;
        getCategoryById(categoryId).then(category => {
            if (category) {
                populateCategoryFormForEdit(category);
            }
        });
    }

    // Lógica para Eliminar Categoría (desde admin.html)
    if (event.target.classList.contains('delete-category-btn') && window.location.pathname.includes('admin.html')) {
        // --- NUEVO: Verificar si el usuario tiene rol de Admin antes de eliminar ---
        if (getUserRole() !== 'Admin') {
            showNotification('No tienes permisos de administrador para eliminar categorías.', 'error', 'Acceso Denegado');
            return;
        }
        const categoryId = event.target.dataset.categoryId;
        deleteCategory(categoryId);
    }

    // Tab switching for admin page
    if (event.target.id === 'show-products-btn' && window.location.pathname.includes('admin.html')) {
        showSection('product-management-section');
    } else if (event.target.id === 'show-categories-btn' && window.location.pathname.includes('admin.html')) {
        showSection('category-management-section');
    }
});

// Event Listener para cambios directos en el input de cantidad del carrito
document.addEventListener('change', (event) => {
    if (event.target.classList.contains('quantity-input')) {
        const productIdToUpdate = event.target.dataset.productId;
        const newQuantity = parseInt(event.target.value);
        const itemToUpdate = cart.find(item => item.id == productIdToUpdate);

        if (itemToUpdate && !isNaN(newQuantity) && newQuantity >= 1) {
            itemToUpdate.quantity = newQuantity;
            saveCart();
            renderCartItems();
        } else if (itemToUpdate && newQuantity < 1) {
            cart = cart.filter(item => item.id != productIdToUpdate);
            saveCart();
            renderCartItems();
        }
    }
});


// --- DOMContentLoaded ÚNICO (para inicialización de elementos DOM y listeners) ---
document.addEventListener('DOMContentLoaded', () => {
    // Asignar referencias a elementos del DOM de forma segura una vez que el DOM esté completamente cargado
    cartItemCountSpan = document.getElementById('cart-item-count');
    cartItemsContainer = document.getElementById('cart-items-container');
    emptyCartMessage = document.getElementById('empty-cart-message');
    cartSubtotalSpan = document.getElementById('cart-subtotal');
    cartShippingSpan = document.getElementById('cart-shipping');
    cartTotalSpan = document.getElementById('cart-total');

    notificationModal = document.getElementById('custom-notification-modal');
    notificationTitle = document.getElementById('notification-title');
    notificationMessage = document.getElementById('notification-message');
    closeNotificationBtn = notificationModal ? notificationModal.querySelector('.close-notification-btn') : null;

    loginModal = document.getElementById('login-modal');
    closeLoginBtn = loginModal ? loginModal.querySelector('.modal-content .close-btn') : null;
    loginForm = document.getElementById('login-form');
    registerForm = document.getElementById('register-form');
    showRegisterLink = document.getElementById('show-register');
    showLoginLink = document.getElementById('show-login');
    loginBtn = document.getElementById('login-btn');

    // --- NUEVO: Asignar referencias a los nuevos elementos de UI de autenticación ---
    userProfileBtn = document.getElementById('user-profile-btn'); 
    userNameDisplay = document.getElementById('user-name-display'); 
    logoutBtn = document.getElementById('logout-btn'); 
    const adminLink = document.getElementById('admin-link'); // Asegúrate de que este elemento exista en tu HTML de la navbar

    // Inicializar el contador del carrito y renderizar items si estamos en carrito.html
    updateCartItemCount();
    renderCartItems();
    updateAuthUI(); // Actualizar la UI de autenticación al cargar la página

    // Event listeners específicos para el modal de Login/Registro que no usan delegación
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
            if (loginModal && loginModal.querySelector('h2')) {
                loginModal.querySelector('h2').textContent = 'Registrarse';
            }
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerForm) registerForm.style.display = 'none';
            if (loginForm) loginForm.style.display = 'block';
            if (loginModal && loginModal.querySelector('h2')) {
                loginModal.querySelector('h2').textContent = 'Iniciar Sesión';
            }
        });
    }

    // --- MODIFICADO: Lógica de submit para el formulario de LOGIN (ahora real) ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => { // 'async' porque usaremos await
            e.preventDefault();
            const username = loginForm.querySelector('#username').value;
            const password = loginForm.querySelector('#password').value;
            
            try {
                const response = await fetch(`${BASE_API_URL}/api/Auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }) // Se envía camelCase, ASP.NET Core lo mapea a PascalCase por defecto
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error desconocido al iniciar sesión.');
                }

                const data = await response.json();
                saveAuthData(data.token, data.role); // Guarda el token y el rol
                showNotification(`¡Bienvenido, ${data.username}!`, 'success', 'Login Exitoso');
                if (loginModal) loginModal.style.display = 'none';
                loginForm.reset();

                // Si el usuario es admin y está en admin.html, recargar la página para aplicar permisos
                if (data.role === 'Admin' && window.location.pathname.includes('admin.html')) {
                    window.location.reload(); 
                } else if (data.role === 'Admin' && adminLink) { // Si es admin y no está en admin.html, puede ir al panel
                    adminLink.style.display = 'block'; // Muestra el enlace al panel admin
                    showNotification('Ahora puedes acceder al panel de administración.', 'info', 'Acceso Admin');
                }

            } catch (error) {
                console.error('Error durante el login:', error);
                showNotification(`Error al iniciar sesión: ${error.message}`, 'error', 'Login Fallido');
            }
        });
    }

    // --- MODIFICADO: Lógica de submit para el formulario de REGISTRO (ahora real) ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => { // 'async'
            e.preventDefault();
            const regUsername = registerForm.querySelector('#reg-username').value;
            const regEmail = registerForm.querySelector('#reg-email').value; // email no se usa en el backend, es solo de frontend
            const regPassword = registerForm.querySelector('#reg-password').value;
            const confirmPassword = registerForm.querySelector('#confirm-password').value;

            if (regPassword !== confirmPassword) {
                showNotification('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.', 'error', 'Error de Registro');
                return;
            }

            try {
                // Se envía PascalCase para que el backend de ASP.NET Core lo deserialice correctamente
                const response = await fetch(`${BASE_API_URL}/api/Auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        Username: regUsername, 
                        Password: regPassword, 
                        Role: "User" // O el rol que desees que los registros normales tengan
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error desconocido al registrarse.');
                }

                const data = await response.json(); // La respuesta del backend de registro puede ser camelCase
                showNotification(`¡Usuario ${data.username} registrado con éxito! Ahora puedes iniciar sesión.`, 'success', 'Registro Exitoso');
                if (loginModal) loginModal.style.display = 'none';
                registerForm.reset();
                // Opcional: Mostrar directamente el formulario de login después del registro exitoso
                if (loginForm) loginForm.style.display = 'block';
                if (registerForm) registerForm.style.display = 'none';
                if (loginModal && loginModal.querySelector('h2')) {
                    loginModal.querySelector('h2').textContent = 'Iniciar Sesión';
                }

            } catch (error) {
                console.error('Error durante el registro:', error);
                showNotification(`Error al registrarse: ${error.message}`, 'error', 'Registro Fallido');
            }
        });
    }

    // Lógica específica para la página admin.html
    if (window.location.pathname.includes('admin.html')) {
        // --- NUEVO: Verificar rol de administrador al cargar admin.html ---
        const userRole = getUserRole();
        if (userRole !== 'Admin') {
            showNotification('Acceso denegado. Solo los administradores pueden acceder a esta página.', 'error', 'Acceso Restringido');
            setTimeout(() => {
                window.location.href = 'index.html'; // Redirige a la página principal
            }, 2000);
            return; // Detiene la ejecución del script para admin.html si no es admin
        }
        // --- FIN VERIFICACIÓN ADMIN ---

        loadAdminElements(); // Initialize all admin DOM elements

        // Initial fetch of all categories to populate dropdowns and tables
        fetchAllCategories().then(() => {
            // Load content for the default active tab (Product Management)
            showSection('product-management-section');
        });

        // Event listener for the product form submission
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const productId = productIdInput.value;
                const productData = {
                    // Envío a backend en PascalCase
                    Id: productId ? parseInt(productId) : 0,
                    Name: productNameInput.value,
                    Description: productDescriptionInput.value,
                    Price: parseFloat(productPriceInput.value),
                    Stock: parseInt(productStockInput.value),
                    ImageUrl: productImageUrlInput.value,
                    CategoriaId: parseInt(productCategorySelect.value),
                    EstaEnOferta: productIsOfferCheckbox.checked
                };

                if (isNaN(productData.CategoriaId) || productData.CategoriaId === 0 || productCategorySelect.value === "") {
                    showNotification('Por favor, selecciona una categoría válida para el producto.', 'error', 'Error de Formulario');
                    return;
                }

                if (productId) {
                    updateProduct(productData.Id, productData);
                } else {
                    addProduct(productData);
                }
            });
        }

        // Event listener for the product form cancel button
        if (cancelProductEditBtn) {
            cancelProductEditBtn.addEventListener('click', resetProductForm);
        }

        // Event listener for the category form submission
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const categoryId = categoryIdInput.value;
                const categoryData = {
                    // Envío a backend en PascalCase
                    Id: categoryId ? parseInt(categoryId) : 0,
                    Nombre: categoryNameInput.value,
                    ParentCategoryId: categoryParentSelect.value ? parseInt(categoryParentSelect.value) : null // Use null for main category
                };

                if (!categoryData.Nombre.trim()) {
                    showNotification('El nombre de la categoría no puede estar vacío.', 'error', 'Error de Formulario');
                    return;
                }

                if (categoryId) {
                    updateCategory(categoryData.Id, categoryData);
                } else {
                    addCategory(categoryData);
                }
            });
        }

        // Event listener for the category form cancel button
        if (cancelCategoryEditBtn) {
            cancelCategoryEditBtn.addEventListener('click', resetCategoryForm);
        }

        // Set up tab switching buttons
        if (showProductsBtn) {
            showProductsBtn.addEventListener('click', () => showSection('product-management-section'));
        }
        if (showCategoriesBtn) {
            showCategoriesBtn.addEventListener('click', () => showSection('category-management-section'));
        }
    }

    // --- Funciones de carga de productos para el Front-end de la tienda ---
    const currentPageTitle = document.title;

    if (currentPageTitle.includes('Tienda Vintage - Catálogo Dinámico')) { // index.html
        loadProductos();
        setupHeroSlider();
    } else if (currentPageTitle.includes('Ofertas')) { // ofertas.html
        loadProductsInOffer();
    } else if (currentPageTitle.includes('Hombre')) { // hombre.html
        loadProductsForHombre();
    } else if (currentPageTitle.includes('Mujer')) { // mujer.html
        loadProductsForMujer();
    }
});

// Example: Function to load all products (for index.html)
async function loadProductos() {
    const productsGrid = document.getElementById('api-product-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '<p>Cargando productos...</p>';

    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        let productos = await response.json();
        console.log("Productos cargados de la API (loadProductos):", productos); 

        if (productos.length === 0) {
            productsGrid.innerHTML = '<p>No hay productos disponibles.</p>';
            return;
        }

        productsGrid.innerHTML = '';
        productos.forEach(producto => {
            // Acceso con camelCase desde el backend
            const isOffer = producto.estaEnOferta; 
            const originalPrice = producto.precio.toFixed(2); 
            const offerPrice = isOffer ? (producto.precio * 0.8).toFixed(2) : originalPrice; 
            const priceDisplay = isOffer ?
                `<p class="price old-price">Precio: $${originalPrice}</p><p class="price current-price">¡Oferta! $${offerPrice}</p>` :
                `<p class="price">Precio: $${originalPrice}</p>`;

            const offerTagHtml = isOffer ? `<span class="offer-tag">¡En Oferta!</span>` : '';

            const productCard = `
                <div class="product-card">
                    <img src="${producto.imagenUrl}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='https://placehold.co/400x400/ECEFF1/607D8B?text=Sin%20Imagen';">
                    <h3>${producto.nombre}</h3>
                    <p class="description">${producto.descripcion}</p>
                    ${priceDisplay}
                    <p class="stock">Stock: ${producto.stock}</p>
                    ${offerTagHtml}
                    <button
                        class="add-to-cart-btn"
                        data-product-id="${producto.id}"
                        data-product-name="${producto.nombre}"
                        data-product-price="${isOffer ? offerPrice : originalPrice}"
                        data-product-image="${producto.imagenUrl}"
                    >
                        Añadir al Carrito
                    </button>
                </div>
            `;
            productsGrid.innerHTML += productCard;
        });
    } catch (error) {
        console.error("Error al cargar productos para la tienda:", error);
        showNotification("Error al cargar productos para la tienda. Asegúrate de que la API está corriendo.", 'error', 'Error de Carga');
        productsGrid.innerHTML = '<p style="color: red;">Error al cargar productos.</p>';
    }
}

// Example: Function to load products in offer (for ofertas.html)
async function loadProductsInOffer() {
    const productsGrid = document.getElementById('api-product-grid');
    if (!productsGrid) return;
    productsGrid.innerHTML = '<p>Cargando productos en oferta...</p>';

    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const allProducts = await response.json();
        console.log("Productos cargados de la API (loadProductsInOffer):", allProducts); 

        const productosEnOferta = allProducts.filter(p => p.estaEnOferta); // Accessing with camelCase

        if (productosEnOferta.length === 0) {
            productsGrid.innerHTML = '<p>No hay productos en oferta disponibles.</p>';
            return;
        }

        productsGrid.innerHTML = '';
        productosEnOferta.forEach(producto => {
            const precioOferta = (producto.precio * 0.8).toFixed(2); // Accessing with camelCase
            const productCard = `
                <div class="product-card">
                    <img src="${producto.imagenUrl}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='https://placehold.co/400x400/ECEFF1/607D8B?text=Sin%20Imagen';">
                    <h3>${producto.nombre}</h3>
                    <p class="description">${producto.descripcion}</p>
                    <p class="price old-price">Precio: $${producto.precio.toFixed(2)}</p>
                    <p class="price current-price">¡Oferta! $${precioOferta}</p>
                    <p class="stock">Stock: ${producto.stock}</p>
                    <span class="offer-tag">¡En Oferta!</span>
                    <button
                        class="add-to-cart-btn"
                        data-product-id="${producto.id}"
                        data-product-name="${producto.nombre}"
                        data-product-price="${precioOferta}"
                        data-product-image="${producto.imagenUrl}"
                    >
                        Añadir al Carrito
                    </button>
                </div>
            `;
            productsGrid.innerHTML += productCard;
        });
    } catch (error) {
        console.error("Error al cargar productos en oferta:", error);
        showNotification("Error al cargar productos en oferta. Asegúrate de que la API está corriendo.", 'error', 'Error de Carga');
        productsGrid.innerHTML = '<p style="color: red;">Error al cargar productos.</p>';
    }
}

// Example: Function to load products for men (for hombre.html)
async function loadProductsForHombre() {
    const productsGrid = document.getElementById('api-product-grid');
    if (!productsGrid) return;
    productsGrid.innerHTML = '<p>Cargando productos para hombre...</p>';

    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const allProducts = await response.json();
        console.log("Productos cargados de la API (loadProductsForHombre):", allProducts); 

        // *** IMPORTANTE: CAMBIA ESTOS VALORES AL ID REAL DE TUS CATEGORÍAS EN TU BASE DE DATOS ***
        // Puedes obtener estos IDs de tu base de datos o de Swagger UI
        const HOMBRE_CATEGORY_ID = 1;
        const JEANS_CATEGORY_ID = 6;
        const REMERAS_CATEGORY_ID = 8;

        const productosHombre = allProducts.filter(p =>
            p.categoriaId == HOMBRE_CATEGORY_ID || // Accessing with camelCase
            p.categoriaId == JEANS_CATEGORY_ID ||  // Accessing with camelCase
            p.categoriaId == REMERAS_CATEGORY_ID   // Accessing with camelCase
        );

        if (productosHombre.length === 0) {
            productsGrid.innerHTML = '<p>No hay productos disponibles para hombre.</p>';
            return;
        }

        productsGrid.innerHTML = '';
        productosHombre.forEach(producto => {
            // Acceso con camelCase
            const isOffer = producto.estaEnOferta; 
            const originalPrice = producto.precio.toFixed(2); 
            const offerPrice = isOffer ? (producto.precio * 0.8).toFixed(2) : originalPrice; 
            const priceDisplay = isOffer ?
                `<p class="price old-price">Precio: $${originalPrice}</p><p class="price current-price">¡Oferta! $${offerPrice}</p>` :
                `<p class="price">Precio: $${originalPrice}</p>`;

            const offerTagHtml = isOffer ? `<span class="offer-tag">¡En Oferta!</span>` : '';

            const productCard = `
                <div class="product-card">
                    <img src="${producto.imagenUrl}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='https://placehold.co/400x400/ECEFF1/607D8B?text=Sin%20Imagen';">
                    <h3>${producto.nombre}</h3>
                    <p class="description">${producto.descripcion}</p>
                    ${priceDisplay}
                    <p class="stock">Stock: ${producto.stock}</p>
                    ${offerTagHtml}
                    <button
                        class="add-to-cart-btn"
                        data-product-id="${producto.id}"
                        data-product-name="${producto.nombre}"
                        data-product-price="${isOffer ? offerPrice : originalPrice}"
                        data-product-image="${producto.imagenUrl}"
                    >
                        Añadir al Carrito
                    </button>
                </div>
            `;
            productsGrid.innerHTML += productCard;
        });
    } catch (error) {
        console.error("Error al cargar productos para hombre:", error);
        showNotification("Error al cargar productos para hombre. Asegúrate de que la API está corriendo.", 'error', 'Error de Carga');
        productsGrid.innerHTML = '<p style="color: red;">Error al cargar productos.</p>';
    }
}

// Example: Function to load products for women (for mujer.html)
async function loadProductsForMujer() {
    const productsGrid = document.getElementById('api-product-grid');
    if (!productsGrid) return;
    productsGrid.innerHTML = '<p>Cargando productos para mujer...</p>';

    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const allProducts = await response.json();
        console.log("Productos cargados de la API (loadProductsForMujer):", allProducts); 

        // *** IMPORTANTE: CAMBIA ESTOS VALORES AL ID REAL DE TUS CATEGORÍAS EN TU BASE DE DATOS ***
        // Puedes obtener estos IDs de tu base de datos o de Swagger UI
        const MUJER_CATEGORY_ID = 5;
        const BLUSAS_CATEGORY_ID = 7;
        const SANDALIAS_CATEGORY_ID = 10;

        const productosMujer = allProducts.filter(p =>
            p.categoriaId == MUJER_CATEGORY_ID || // Accessing with camelCase
            p.categoriaId == BLUSAS_CATEGORY_ID || // Accessing with camelCase
            p.categoriaId == SANDALIAS_CATEGORY_ID // Accessing with camelCase
        );

        if (productosMujer.length === 0) {
            productsGrid.innerHTML = '<p>No hay productos disponibles para mujer.</p>';
            return;
        }

        productsGrid.innerHTML = '';
        productosMujer.forEach(producto => {
            // Acceso con camelCase
            const isOffer = producto.estaEnOferta; 
            const originalPrice = producto.precio.toFixed(2); 
            const offerPrice = isOffer ? (producto.precio * 0.8).toFixed(2) : originalPrice; 
            const priceDisplay = isOffer ?
                `<p class="price old-price">Precio: $${originalPrice}</p><p class="price current-price">¡Oferta! $${offerPrice}</p>` :
                `<p class="price">Precio: $${originalPrice}</p>`;

            const offerTagHtml = isOffer ? `<span class="offer-tag">¡En Oferta!</span>` : '';

            const productCard = `
                <div class="product-card">
                    <img src="${producto.imagenUrl}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='https://placehold.co/400x400/ECEFF1/607D8B?text=Sin%20Imagen';">
                    <h3>${producto.nombre}</h3>
                    <p class="description">${producto.descripcion}</p>
                    ${priceDisplay}
                    <p class="stock">Stock: ${producto.stock}</p>
                    ${offerTagHtml}
                    <button
                        class="add-to-cart-btn"
                        data-product-id="${producto.id}"
                        data-product-name="${producto.nombre}"
                        data-product-price="${isOffer ? offerPrice : originalPrice}"
                        data-product-image="${producto.imagenUrl}"
                    >
                        Añadir al Carrito
                    </button>
                </div>
            `;
            productsGrid.innerHTML += productCard;
        });
    } catch (error) {
        console.error("Error al cargar productos para mujer:", error);
        showNotification("Error al cargar productos para mujer. Asegúrate de que la API está corriendo.", 'error', 'Error de Carga');
        productsGrid.innerHTML = '<p style="color: red;">Error al cargar productos.</p>';
    }
}

// Function for the hero slider (specific to index.html)
function setupHeroSlider() {
    const sliderContainer = document.querySelector('.slider-container');
    const sliderImages = document.querySelectorAll('.slider-image');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentIndex = 0;
    let slideInterval;

    if (sliderImages.length > 0 && sliderContainer && prevBtn && nextBtn) {
        function showSlide(index) {
            if (index >= sliderImages.length) {
                currentIndex = 0;
            } else if (index < 0) {
                currentIndex = sliderImages.length - 1;
            } else {
                currentIndex = index;
            }
            const offset = -currentIndex * 100;
            sliderContainer.style.transform = `translateX(${offset}%)`;
        }

        function nextSlide() {
            showSlide(currentIndex + 1);
        }

        function prevSlide() {
            showSlide(currentIndex - 1);
        }

        function startSlider() {
            stopSlider();
            slideInterval = setInterval(nextSlide, 3000);
        }

        function stopSlider() {
            clearInterval(slideInterval);
        }

        nextBtn.addEventListener('click', () => { stopSlider(); nextSlide(); startSlider(); });
        prevBtn.addEventListener('click', () => { stopSlider(); prevSlide(); startSlider(); });

        showSlide(currentIndex);
        startSlider();
    }
}
