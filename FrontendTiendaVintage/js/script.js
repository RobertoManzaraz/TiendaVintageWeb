// --- CONFIGURACIÓN DE LA API (¡AJUSTAR ESTA URL A TU BACKEND ASP.NET CORE!) ---
// Es CRÍTICO que esta URL coincida EXACTAMENTE con la dirección donde tu API de ASP.NET Core está corriendo.
// Por ejemplo, si tu API corre en el puerto 7000, debería ser 'https://localhost:7000' o 'http://localhost:7000'.
// Si usas 'dotnet run' desde la carpeta de tu proyecto API, la consola te mostrará las URLs.
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
let closeLoginBtn;
let loginForm;
let registerForm;
let showRegisterLink;
let showLoginLink;
let loginBtn; // El botón de "Login" en la navbar

// --- Elementos para mostrar estado de autenticación (los creamos dinámicamente si no existen) ---
// Estas variables se asignan en DOMContentLoaded
let userProfileSectionElement;
let userNameDisplayElement;
let logoutBtnElement;
let adminLinkElement;

// Variables para elementos del DOM relacionadas con el panel de administración (admin.html)
// Estas variables se asignan dentro de loadAdminElements()
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
let cancelProductEditBtn;
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

let allCategories = []; // Para almacenar las categorías obtenidas de la API (usado globalmente en el admin)

// --- Variables para almacenar el estado de autenticación ---
let currentUser = null; // Almacena el objeto { username, token, role }
const TOKEN_STORAGE_KEY = 'userToken';
const USER_ROLE_STORAGE_KEY = 'userRole';
const USERNAME_STORAGE_KEY = 'username'; // Clave para guardar el username

// --- Función para obtener el token JWT de localStorage ---
function getAuthToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

// --- Función para obtener el rol del usuario de localStorage ---
function getUserRole() {
    return localStorage.getItem(USER_ROLE_STORAGE_KEY);
}

// --- Función para guardar el token, rol y username en localStorage ---
function saveAuthData(token, role, username) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_ROLE_STORAGE_KEY, role);
    localStorage.setItem(USERNAME_STORAGE_KEY, username);
    currentUser = { token, role, username };
    console.log("Datos de autenticación guardados. Actualizando UI...");
    updateAuthUI();
}

// --- Función para limpiar datos de autenticación ---
function clearAuthData() {
    console.log("Limpiando datos de autenticación...");
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_ROLE_STORAGE_KEY);
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    currentUser = null;
    updateAuthUI(); // Actualiza la UI para mostrar "Login"

    // --- Limpiar el carrito al cerrar sesión ---
    console.log("Limpiando datos del carrito...");
    cart = []; // Vaciar el array del carrito en memoria
    localStorage.removeItem('cart'); // Asegurarse de que el localStorage del carrito también se limpie
    updateCartItemCount(); // Actualizar el contador
    renderCartItems(); // Actualizar la visualización del carrito (si estamos en carrito.html)
    // --- FIN Limpiar carrito ---

    // Si estábamos en admin.html, redirige al cerrar sesión
    if (window.location.pathname.includes('admin.html')) {
        console.log("Redirigiendo de admin.html a index.html después de cerrar sesión.");
        window.location.href = 'index.html';
    }
}

// --- Función para actualizar la interfaz de usuario de autenticación (navbar) ---
function updateAuthUI() {
    console.log("Ejecutando updateAuthUI...");
    const token = getAuthToken();
    const role = getUserRole();
    const username = localStorage.getItem(USERNAME_STORAGE_KEY); // Obtener username

    // Asegurarse de que los elementos existan antes de intentar manipularlos
    const loginLinkElement = document.getElementById('login-btn');
    userProfileSectionElement = document.getElementById('user-profile-section');
    userNameDisplayElement = document.getElementById('user-name-display');
    logoutBtnElement = document.getElementById('logout-btn');
    adminLinkElement = document.getElementById('admin-link');

    if (token && role) {
        console.log(`Usuario autenticado: ${username}, Rol: ${role}.`);
        // Usuario autenticado
        if (loginLinkElement) {
            loginLinkElement.style.display = 'none'; // Oculta el botón de login
            console.log("Login link hidden.");
        }
        if (userProfileSectionElement) {
            userProfileSectionElement.style.display = 'flex'; // Muestra la sección de perfil
            if (userNameDisplayElement) {
                userNameDisplayElement.textContent = `Hola, ${username || 'Usuario'}!`; // Muestra username o un default
                console.log(`Nombre de usuario mostrado: ${userNameDisplayElement.textContent}`);
            }
            console.log("Sección de perfil de usuario mostrada.");
        }
        // Si es admin, muestra el enlace al panel de administración
        if (adminLinkElement && role === 'Admin') {
            adminLinkElement.style.display = 'block';
            console.log("Enlace a Panel Admin mostrado.");
             // Cambiar color del enlace admin si es la página actual
            if (window.location.pathname.includes('admin.html')) {
                adminLinkElement.style.backgroundColor = '#007bff'; // Azul para indicar que está activo
                console.log("Enlace a Panel Admin resaltado (página actual).");
            } else {
                adminLinkElement.style.backgroundColor = '#27ae60'; // Verde normal
            }
        } else if (adminLinkElement) {
            adminLinkElement.style.display = 'none';
            console.log("Enlace a Panel Admin oculto (no es admin o elemento no encontrado).");
        }
    } else {
        console.log("Usuario no autenticado.");
        // Usuario no autenticado
        if (loginLinkElement) {
            loginLinkElement.style.display = 'block';
            // Reemplazar el texto "Login" con el icono de persona y aplicar estilos
            loginLinkElement.innerHTML = '<i class="bi bi-person-circle"></i>'; // Usamos Bootstrap Icons
            loginLinkElement.style.fontSize = '1.8rem'; // Ajusta el tamaño del icono
            loginLinkElement.style.marginLeft = '0'; // Quita el margen si se aplicaba a texto
            console.log("Login link (icon) shown.");
        }
        if (userProfileSectionElement) {
            userProfileSectionElement.style.display = 'none';
            console.log("Sección de perfil de usuario oculta.");
        }
        if (adminLinkElement) {
            adminLinkElement.style.display = 'none';
            console.log("Enlace a Panel Admin oculto.");
        }
    }
}


// --- LÓGICA DEL CARRITO DE COMPRAS (Funciones) ---
function updateCartItemCount() {
    console.log("Actualizando contador de carrito...");
    if (cartItemCountSpan) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCountSpan.textContent = totalItems;
        if (totalItems > 0) {
            cartItemCountSpan.style.display = 'inline-block';
            console.log(`Contador de carrito: ${totalItems} (mostrado)`);
        } else {
            cartItemCountSpan.style.display = 'none';
            console.log("Contador de carrito: 0 (oculto)");
        }
    } else {
        console.warn("cartItemCountSpan no encontrado. No se puede actualizar el contador.");
    }
}

function saveCart() {
    console.log("Guardando carrito en localStorage...");
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartItemCount();
}

function renderCartItems() {
    console.log("Renderizando elementos del carrito...");
    if (!cartItemsContainer) {
        console.warn("cartItemsContainer no encontrado. No se pueden renderizar los ítems del carrito.");
        return;
    }

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
            console.log("Mensaje de carrito vacío mostrado.");
        }
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
    console.log(`Renderizados ${cart.length} ítems en el carrito.`);
    updateCartSummary();
}

function updateCartSummary() {
    console.log("Actualizando resumen del carrito...");
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const shipping = 0; // Si el envío es gratuito
    const total = subtotal + shipping;

    if (cartSubtotalSpan) cartSubtotalSpan.textContent = subtotal.toLocaleString('es-AR');
    if (cartShippingSpan) cartShippingSpan.textContent = shipping.toLocaleString('es-AR');
    if (cartTotalSpan) cartTotalSpan.textContent = total.toLocaleString('es-AR');
    console.log(`Subtotal: $${subtotal}, Total: $${total}`);
}

// --- FUNCIONES DE NOTIFICACIÓN PERSONALIZADA ---
function showNotification(message, type = 'info', title = 'Información') {
    console.log(`Mostrando notificación: [${type.toUpperCase()}] ${title}: ${message}`);
    if (!notificationModal || !notificationTitle || !notificationMessage) {
        console.error('Elementos del modal de notificación no encontrados. Asegúrate de que los IDs sean correctos.');
        console.log(`Mensaje NO mostrado en modal (DEBUG): ${title} - ${message}`);
        return;
    }

    notificationTitle.className = ''; // Limpiar clases anteriores
    notificationTitle.innerHTML = ''; // Limpiar HTML anterior
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
    notificationModal.style.display = 'flex'; // Usar flex para centrar
}

// --- LÓGICA ESPECÍFICA PARA LA PÁGINA DE ADMINISTRACIÓN (admin.html) ---

// Function to get all DOM elements specific to admin.html
function loadAdminElements() {
    console.log("Cargando referencias a elementos DOM del panel de administración...");
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
    productListTableBody = document.getElementById('product-list'); // tbody element

    // Category Management Elements
    categoryForm = document.getElementById('category-form');
    categoryIdInput = document.getElementById('category-id');
    categoryNameInput = document.getElementById('category-name');
    categoryParentSelect = document.getElementById('category-parent'); // For parent category assignment
    categoryFormTitle = document.getElementById('category-form-title');
    submitCategoryBtn = document.getElementById('submit-category-btn');
    cancelCategoryEditBtn = document.getElementById('cancel-category-edit-btn');
    categoryListTableBody = document.getElementById('category-list'); // tbody element

    // Tab navigation buttons
    showProductsBtn = document.getElementById('show-products-btn');
    showCategoriesBtn = document.getElementById('show-categories-btn');
    productManagementSection = document.getElementById('product-management-section');
    categoryManagementSection = document.getElementById('category-management-section');

    // Logging para verificar si los elementos se encontraron
    console.log("Elementos de Admin cargados:");
    console.log("productForm:", productForm ? "OK" : "NO ENCONTRADO");
    console.log("productListTableBody:", productListTableBody ? "OK" : "NO ENCONTRADO");
    console.log("categoryForm:", categoryForm ? "OK" : "NO ENCONTRADO");
    console.log("categoryListTableBody:", categoryListTableBody ? "OK" : "NO ENCONTRADO");
    console.log("showProductsBtn:", showProductsBtn ? "OK" : "NO ENCONTRADO");
    console.log("showCategoriesBtn:", showCategoriesBtn ? "OK" : "NO ENCONTRADO");
    console.log("productManagementSection:", productManagementSection ? "OK" : "NO ENCONTRADO");
    console.log("categoryManagementSection:", categoryManagementSection ? "OK" : "NO ENCONTRADO");
}

// Reusable function to fetch all categories
async function fetchAllCategories() {
    console.log("Iniciando fetchAllCategories: Obteniendo todas las categorías de la API...");
    try {
        const response = await fetch(`${BASE_API_URL}/api/Categorias`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        allCategories = await response.json(); // Almacenar categorías globalmente
        console.log("Categorías obtenidas con éxito:", allCategories);
        return allCategories;
    } catch (error) {
        console.error("Error al obtener categorías en fetchAllCategories:", error);
        showNotification('Error al cargar categorías: ' + error.message, 'error', 'Error de API');
        return [];
    }
}

// Function to populate a given select element with categories
function populateCategoryDropdown(selectElement, defaultOptionText, currentSelectedId = null) {
    if (!selectElement) {
        console.warn("populateCategoryDropdown llamado con selectElement nulo. Saltando.");
        return;
    }
    console.log(`Poblando dropdown '${selectElement.id}' con ${allCategories.length} categorías. ID Seleccionado actual: ${currentSelectedId}`);

    selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
    
    // Filtra la categoría que se está editando de sus propias opciones de padre (para evitar referencias circulares)
    const currentCategoryId = categoryIdInput ? parseInt(categoryIdInput.value) : null;

    allCategories.forEach(category => {
        // Accediendo a las propiedades con camelCase del backend (asumiendo que la API devuelve camelCase)
        // Esta comprobación evita que una categoría sea su propio padre en el formulario de categoría
        if (selectElement.id === 'category-parent' && currentCategoryId && category.id === currentCategoryId) {
            return;
        }

        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.nombre;
        if (currentSelectedId !== null && category.id === currentSelectedId) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    console.log(`Dropdown '${selectElement.id}' poblado con ${selectElement.options.length} opciones.`);
}

// --- Función auxiliar para obtener los headers con el token JWT ---
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
    console.log("Iniciando loadAdminProducts: Intentando cargar productos para el panel de administración...");
    if (!productListTableBody) {
        console.error("ERROR: productListTableBody (elemento HTML) no encontrado. No se pueden cargar productos en la tabla. Verifica el ID 'product-list'.");
        return;
    }

    productListTableBody.innerHTML = '<tr><td colspan="9" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">Cargando productos...</td></tr>';
    try {
        console.log("Obteniendo productos de la API para la tabla de administración...");
        const response = await fetch(`${BASE_API_URL}/api/Productos`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const products = await response.json();
        console.log("Productos obtenidos para el panel de administración:", products);
        
        productListTableBody.innerHTML = '';
        if (products.length === 0) {
            productListTableBody.innerHTML = '<tr><td colspan="9" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">No hay productos registrados.</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
            // Buscar el nombre de la categoría del array global allCategories
            // Accediendo a las propiedades con camelCase del backend
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
        console.log("Productos renderizados con éxito en el panel de administración.");
    } catch (error) {
        console.error("Error al cargar productos para el panel de admin:", error);
        showNotification('Error al cargar productos: ' + error.message, 'error', 'Error de API');
        productListTableBody.innerHTML = '<tr><td colspan="9" class="px-6 py-4 whitespace-nowrap text-center text-red-500">Error al cargar productos. Por favor, verifica tu API.</td></tr>';
    }
}

async function addProduct(productData) {
    console.log("Iniciando addProduct: Intentando añadir producto con datos:", productData);
    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        showNotification('Producto añadido con éxito.', 'success');
        resetProductForm();
        loadAdminProducts(); // Recarga la tabla para mostrar el nuevo producto
        console.log("Producto añadido y tabla de productos recargada.");
    } catch (error) {
        console.error("Error al añadir producto:", error);
        if (error.message.includes('401') || error.message.includes('403')) {
            showNotification('No autorizado. Por favor, inicia sesión como administrador.', 'error', 'Acceso Denegado');
            clearAuthData();
        } else {
            showNotification('Error al añadir producto: ' + error.message, 'error', 'Error de API');
        }
    }
}

async function updateProduct(id, productData) {
    console.log("Iniciando updateProduct: Actualizando producto ID:", id, "con datos:", productData);
    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        showNotification('Producto actualizado con éxito.', 'success');
        resetProductForm();
        loadAdminProducts(); // Recarga la tabla para mostrar los cambios
        console.log("Producto actualizado y tabla de productos recargada.");
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
    console.log("Iniciando deleteProduct: Eliminando producto ID:", id);
    // Verificar si el usuario es administrador antes de la confirmación
    if (getUserRole() !== 'Admin') {
        showNotification('No tienes permisos de administrador para eliminar productos.', 'error', 'Acceso Denegado');
        console.warn('Intento de eliminación bloqueado: El usuario no es Admin.');
        return;
    }

    // Mantener window.confirm por simplicidad por ahora.
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.')) {
        console.log("Eliminación de producto cancelada por el usuario.");
        return;
    }

    console.log("Usuario confirmó la eliminación para el producto ID:", id);
    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        showNotification('Producto eliminado con éxito.', 'success');
        console.log("Producto eliminado. Recargando lista de productos...");
        loadAdminProducts(); // Recarga la tabla para mostrar los cambios
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
    console.log("Iniciando getProductById: Obteniendo producto por ID:", id);
    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos/${id}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const product = await response.json();
        console.log("Producto obtenido para edición:", product);
        return product;
    } catch (error) {
        console.error(`Error al obtener producto ${id}:`, error);
        showNotification(`Error al obtener producto: ${error.message}`, 'error', 'Error de API');
        return null;
    }
}

function populateProductFormForEdit(product) {
    console.log("Poblando formulario de producto para edición con producto:", product);
    productIdInput.value = product.id;
    productNameInput.value = product.nombre;
    productDescriptionInput.value = product.descripcion;
    productPriceInput.value = product.precio;
    productStockInput.value = product.stock;
    productImageUrlInput.value = product.imagenUrl;
    // Asegurarse de que productCategorySelect esté disponible antes de poblarlo
    if (productCategorySelect) {
        populateCategoryDropdown(productCategorySelect, 'Selecciona una categoría', product.categoriaId);
    } else {
        console.warn("productCategorySelect es nulo, no se puede poblar el dropdown de categorías de producto.");
    }
    productIsOfferCheckbox.checked = product.estaEnOferta;

    productFormTitle.textContent = 'Editar Producto';
    submitProductBtn.textContent = 'Actualizar Producto';
    cancelProductEditBtn.style.display = 'inline-block';
    console.log("Formulario de producto configurado para edición.");
}

function resetProductForm() {
    console.log("Reiniciando formulario de producto.");
    if (productForm) productForm.reset();
    if (productIdInput) productIdInput.value = '';
    if (productFormTitle) productFormTitle.textContent = 'Añadir Nuevo Producto';
    if (submitProductBtn) submitProductBtn.textContent = 'Añadir Producto';
    if (cancelProductEditBtn) cancelProductEditBtn.style.display = 'none';
    // Asegurarse de que productCategorySelect esté disponible antes de poblarlo
    if (productCategorySelect) {
        populateCategoryDropdown(productCategorySelect, 'Selecciona una categoría'); // Reinicia el dropdown
    } else {
        console.warn("productCategorySelect es nulo, no se puede resetear el dropdown de categorías de producto.");
    }
    console.log("Formulario de producto reiniciado.");
}

// --- Category CRUD Functions (modificadas para incluir token y corregir nombres de propiedades) ---
async function loadAdminCategories() {
    console.log("Iniciando loadAdminCategories: Intentando cargar categorías para el panel de administración...");
    if (!categoryListTableBody) {
        console.error("ERROR: categoryListTableBody (elemento HTML) no encontrado. No se pueden cargar categorías en la tabla. Verifica el ID 'category-list'.");
        return;
    }

    categoryListTableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">Cargando categorías...</td></tr>';
    try {
        // Asegurarse de tener las últimas categorías. Esto también poblará 'allCategories'
        console.log("Llamando a fetchAllCategories para asegurar que allCategories esté actualizado para la tabla de administración...");
        await fetchAllCategories(); // Esto pobla el array global `allCategories`

        if (allCategories.length === 0) {
            categoryListTableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">No hay categorías registradas.</td></tr>';
            console.log("No hay categorías para mostrar.");
            return;
        }

        categoryListTableBody.innerHTML = '';
        allCategories.forEach(category => {
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
        console.log("Categorías renderizadas con éxito en el panel de administración.");
    } catch (error) {
        console.error("Error al cargar categorías en tabla del admin:", error);
        showNotification('Error al cargar categorías en tabla: ' + error.message, 'error', 'Error de API');
        categoryListTableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 whitespace-nowrap text-center text-red-500">Error al cargar categorías. Por favor, verifica tu API.</td></tr>';
    }
}

async function addCategory(categoryData) {
    console.log("Iniciando addCategory: Intentando añadir categoría con datos:", categoryData);
    try {
        const response = await fetch(`${BASE_API_URL}/api/Categorias`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        showNotification('Categoría añadida con éxito.', 'success');
        resetCategoryForm();
        await fetchAllCategories(); // Volver a obtener todas las categorías para actualizar dropdowns y tabla
        loadAdminCategories(); // Recarga la tabla de categorías
        // Asegurarse de que productCategorySelect esté disponible antes de poblarlo
        if (productCategorySelect) {
            populateCategoryDropdown(productCategorySelect, 'Selecciona una categoría'); // Actualiza también el dropdown del formulario de productos
        } else {
            console.warn("productCategorySelect es nulo, no se puede actualizar el dropdown de categorías de producto después de añadir categoría.");
        }
        console.log("Categoría añadida y elementos relacionados actualizados.");
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
    console.log("Iniciando updateCategory: Actualizando categoría ID:", id, "con datos:", categoryData);
    try {
        const response = await fetch(`${BASE_API_URL}/api/Categorias/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        showNotification('Categoría actualizada con éxito.', 'success');
        resetCategoryForm();
        await fetchAllCategories(); // Volver a obtener todas las categorías
        loadAdminCategories(); // Recarga la tabla de categorías
        // Asegurarse de que productCategorySelect esté disponible antes de poblarlo
        if (productCategorySelect) {
            populateCategoryDropdown(productCategorySelect, 'Selecciona una categoría'); // Actualiza también el dropdown del formulario de productos
        } else {
            console.warn("productCategorySelect es nulo, no se puede actualizar el dropdown de categorías de producto después de actualizar categoría.");
        }
        console.log("Categoría actualizada y elementos relacionados actualizados.");
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
    console.log("Iniciando deleteCategory: Eliminando categoría ID:", id);
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Si hay productos asignados a ella o subcategorías, podrían quedar sin categoría o causar errores.')) {
        console.log("Eliminación de categoría cancelada por el usuario.");
        return;
    }

    try {
        const response = await fetch(`${BASE_API_URL}/api/Categorias/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        showNotification('Categoría eliminada con éxito.', 'success');
        await fetchAllCategories(); // Volver a obtener todas las categorías
        loadAdminCategories(); // Recarga la tabla de categorías
        // Asegurarse de que productCategorySelect esté disponible antes de poblarlo
        if (productCategorySelect) {
            populateCategoryDropdown(productCategorySelect, 'Selecciona una categoría'); // Actualiza también el dropdown del formulario de productos
        } else {
            console.warn("productCategorySelect es nulo, no se puede actualizar el dropdown de categorías de producto después de eliminar categoría.");
        }
        console.log("Categoría eliminada y elementos relacionados actualizados.");
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
    console.log("Iniciando getCategoryById: Obteniendo categoría por ID:", id);
    try {
        const response = await fetch(`${BASE_API_URL}/api/Categorias/${id}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const category = await response.json();
        console.log("Categoría obtenida para edición:", category);
        return category;
    } catch (error) {
        console.error(`Error al obtener categoría ${id}:`, error);
        showNotification(`Error al obtener categoría: ${error.message}`, 'error', 'Error de API');
        return null;
    }
}

function populateCategoryFormForEdit(category) {
    console.log("Poblando formulario de categoría para edición con categoría:", category);
    categoryIdInput.value = category.id;
    categoryNameInput.value = category.nombre;
    // Asegurarse de que categoryParentSelect esté disponible antes de poblarlo
    if (categoryParentSelect) {
        populateCategoryDropdown(categoryParentSelect, 'Ninguna (Categoría Principal)', category.parentCategoryId || '');
    } else {
        console.warn("categoryParentSelect es nulo, no se puede poblar el dropdown de categorías padre.");
    }

    categoryFormTitle.textContent = 'Editar Categoría';
    submitCategoryBtn.textContent = 'Actualizar Categoría';
    cancelCategoryEditBtn.style.display = 'inline-block';
    console.log("Formulario de categoría configurado para edición.");
}

function resetCategoryForm() {
    console.log("Reiniciando formulario de categoría.");
    if (categoryForm) categoryForm.reset();
    if (categoryIdInput) categoryIdInput.value = '';
    if (categoryFormTitle) categoryFormTitle.textContent = 'Añadir Nueva Categoría';
    if (submitCategoryBtn) submitCategoryBtn.textContent = 'Añadir Categoría';
    if (cancelCategoryEditBtn) cancelCategoryEditBtn.style.display = 'none';
    // Asegurarse de que categoryParentSelect esté disponible antes de poblarlo
    if (categoryParentSelect) {
        populateCategoryDropdown(categoryParentSelect, 'Ninguna (Categoría Principal)'); // Reinicia el dropdown padre
    } else {
        console.warn("categoryParentSelect es nulo, no se puede resetear el dropdown de categorías padre.");
    }
    console.log("Formulario de categoría reiniciado.");
}

// --- Admin Tab Switching Logic ---
function showSection(sectionId) {
    console.log("showSection: Intentando cambiar a la sección:", sectionId);
    // Ocultar todas las secciones
    if (productManagementSection) {
        productManagementSection.classList.remove('active-section');
        console.log("productManagementSection: removida clase 'active-section'.");
    } else { console.warn("productManagementSection no encontrado."); }

    if (categoryManagementSection) {
        categoryManagementSection.classList.remove('active-section');
        console.log("categoryManagementSection: removida clase 'active-section'.");
    } else { console.warn("categoryManagementSection no encontrado."); }

    // Quitar la clase activa de todos los botones
    if (showProductsBtn) {
        showProductsBtn.classList.remove('active');
        console.log("showProductsBtn: removida clase 'active'.");
    } else { console.warn("showProductsBtn no encontrado."); }

    if (showCategoriesBtn) {
        showCategoriesBtn.classList.remove('active');
        console.log("showCategoriesBtn: removida clase 'active'.");
    } else { console.warn("showCategoriesBtn no encontrado."); }

    // Mostrar la sección seleccionada y activar su botón
    if (sectionId === 'product-management-section' && productManagementSection) {
        productManagementSection.classList.add('active-section');
        console.log("productManagementSection: añadida clase 'active-section'.");
        if (showProductsBtn) {
            showProductsBtn.classList.add('active');
            console.log("showProductsBtn: añadida clase 'active'.");
        }
        // Recargar productos y categorías de productos cuando se muestra la sección de productos
        // Asegúrate de que productCategorySelect esté disponible antes de poblarlo
        if (productCategorySelect) {
             populateCategoryDropdown(productCategorySelect, 'Selecciona una categoría'); // poblar antes de cargar productos
             console.log("populateCategoryDropdown (productCategorySelect) llamado.");
        } else {
            console.warn("productCategorySelect es nulo, no se puede poblar el dropdown de productos.");
        }
        loadAdminProducts(); // Carga los productos
        console.log("loadAdminProducts llamado.");
    } else if (sectionId === 'category-management-section' && categoryManagementSection) {
        categoryManagementSection.classList.add('active-section');
        console.log("categoryManagementSection: añadida clase 'active-section'.");
        if (showCategoriesBtn) {
            showCategoriesBtn.classList.add('active');
            console.log("showCategoriesBtn: añadida clase 'active'.");
        }
        // Recargar categorías cuando se muestra la sección de categorías
        // Asegúrate de que categoryParentSelect esté disponible antes de poblarlo
        if (categoryParentSelect) {
            populateCategoryDropdown(categoryParentSelect, 'Ninguna (Categoría Principal)'); // poblar antes de cargar categorías
            console.log("populateCategoryDropdown (categoryParentSelect) llamado.");
        } else {
            console.warn("categoryParentSelect es nulo, no se puede poblar el dropdown de categorías.");
        }
        loadAdminCategories(); // Carga las categorías
        console.log("loadAdminCategories llamado.");
    } else {
        console.error("showSection: Sección o botón de destino no encontrado para el ID:", sectionId);
    }
}

// --- Event Listeners Globales (delegación de eventos para todas las páginas) ---
document.addEventListener('click', (event) => {
    // Lógica para añadir al carrito (restaurada para que funcione al hacer click en la card)
    const targetElement = event.target.closest('.add-to-cart-btn'); // Busca el elemento más cercano con esta clase
    if (targetElement) { // Si se encontró cualquier elemento con esta clase (botón o div.image-wrapper)
        const productId = targetElement.dataset.productId;
        const productName = targetElement.dataset.productName;
        const productPrice = parseFloat(targetElement.dataset.productPrice);
        const productImage = targetElement.dataset.productImage;

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
        console.log(`Producto ${productName} añadido al carrito.`);
    }


    // Lógica para el botón "Proceder al Pago"
    if (event.target.classList.contains('checkout-btn')) {
        console.log("Botón 'Proceder al Pago' clickeado.");
        if (cart.length === 0) {
            showNotification('Tu carrito está vacío. ¡Añade algunos productos antes de proceder al pago!', 'info');
            return;
        }

        showNotification('¡Gracias por tu compra! Tu pedido ha sido procesado con éxito.', 'success', 'Compra Exitosa');

        cart = []; // Vaciar carrito después de la compra
        localStorage.removeItem('cart'); // Limpiar del localStorage
        updateCartItemCount(); // Actualizar el contador del carrito
        renderCartItems(); // Actualizar la vista del carrito (si estamos en carrito.html)

        setTimeout(() => {
            console.log("Redirigiendo a gracias.html...");
            window.location.href = 'gracias.html'; // Asegúrate de que 'gracias.html' exista
        }, 500);
    }

    // Lógica para el carrito de compras (remover, aumentar, disminuir cantidad)
    if (event.target.classList.contains('remove-item-btn')) {
        const productIdToRemove = event.target.dataset.productId;
        console.log(`Eliminando producto del carrito con ID: ${productIdToRemove}`);
        cart = cart.filter(item => item.id != productIdToRemove);
        saveCart();
        renderCartItems();
    } else if (event.target.classList.contains('increase-quantity-btn')) {
        const productIdToUpdate = event.target.dataset.productId;
        console.log(`Aumentando cantidad para producto con ID: ${productIdToUpdate}`);
        const itemToUpdate = cart.find(item => item.id == productIdToUpdate);
        if (itemToUpdate) {
            itemToUpdate.quantity++;
            saveCart();
            renderCartItems();
        }
    } else if (event.target.classList.contains('decrease-quantity-btn')) {
        const productIdToUpdate = event.target.dataset.productId;
        console.log(`Disminuyendo cantidad para producto con ID: ${productIdToUpdate}`);
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
    if (event.target.id === 'login-btn' || event.target.closest('#login-btn')) { // Agregado .closest para el ícono
        event.preventDefault();
        console.log("Botón de Login clickeado. Abriendo modal...");
        if (loginModal && loginForm && registerForm) {
            loginModal.style.display = 'flex';
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            if (loginModal.querySelector('h2')) {
                loginModal.querySelector('h2').textContent = 'Iniciar Sesión';
            }
            console.log("Modal de Login mostrado.");
        } else {
            console.warn("Elementos del modal de login no encontrados. Asegúrate de que existan y tengan los IDs correctos.");
        }
    }
    // Lógica para el botón de Cerrar Sesión (Delegación global)
    if (event.target.id === 'logout-btn') {
        event.preventDefault();
        console.log("Botón de Cerrar Sesión clickeado.");
        clearAuthData(); // Limpia el token y el rol del almacenamiento local Y el carrito
        showNotification('Has cerrado sesión.', 'info', 'Sesión Terminada');
        // Si estabas en el panel de admin, te redirige al index
        if (window.location.pathname.includes('admin.html')) {
            console.log("Redirigiendo de admin.html a index.html después de cerrar sesión.");
            window.location.href = 'index.html';
        }
    }

    // Lógica para cerrar el modal de Login por la 'X'
    if (event.target.classList.contains('close-btn') && event.target.closest('#login-modal')) {
        console.log("Botón de cierre de modal de Login clickeado.");
        if (loginModal) {
            loginModal.style.display = 'none';
            console.log("Modal de Login oculto.");
        }
    }

    // Lógica para cerrar el modal de Notificación por la 'X'
    if (event.target.classList.contains('close-notification-btn') && event.target.closest('#custom-notification-modal')) {
        console.log("Botón de cierre de modal de Notificación clickeado.");
        if (notificationModal) {
            notificationModal.style.display = 'none';
            console.log("Modal de Notificación oculto.");
        }
    }

    // Lógica para Editar Producto (desde admin.html)
    if (event.target.classList.contains('edit-product-btn') && window.location.pathname.includes('admin.html')) {
        console.log("Botón 'Editar Producto' clickeado.");
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
        console.log("Botón 'Eliminar Producto' clickeado.");
        if (getUserRole() !== 'Admin') {
            showNotification('No tienes permisos de administrador para eliminar productos.', 'error', 'Acceso Denegado');
            console.warn('Intento de eliminación bloqueado: El usuario no es Admin.');
            return;
        }
        const productId = event.target.dataset.productId;
        if (productId) { // Asegurarse de que el ID exista
            deleteProduct(productId);
        } else {
            console.error("ID de producto no encontrado para el botón de eliminación.");
        }
    }

    // Lógica para Editar Categoría (desde admin.html)
    if (event.target.classList.contains('edit-category-btn') && window.location.pathname.includes('admin.html')) {
        console.log("Botón 'Editar Categoría' clickeado.");
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
        console.log("Botón 'Eliminar Categoría' clickeado.");
        if (getUserRole() !== 'Admin') {
            showNotification('No tienes permisos de administrador para eliminar categorías.', 'error', 'Acceso Denegado');
            return;
        }
        const categoryId = event.target.dataset.categoryId;
        deleteCategory(categoryId);
    }

    // Tab switching for admin page
    if (event.target.id === 'show-products-btn' && window.location.pathname.includes('admin.html')) {
        console.log("Pestaña 'Productos' clickeada en admin.html.");
        showSection('product-management-section');
    } else if (event.target.id === 'show-categories-btn' && window.location.pathname.includes('admin.html')) {
        console.log("Pestaña 'Categorías' clickeada en admin.html.");
        showSection('category-management-section');
    }
});

// Event Listener para cambios directos en el input de cantidad del carrito
document.addEventListener('change', (event) => {
    if (event.target.classList.contains('quantity-input')) {
        const productIdToUpdate = event.target.dataset.productId;
        const newQuantity = parseInt(event.target.value);
        const itemToUpdate = cart.find(item => item.id == productIdToUpdate);
        console.log(`Cantidad modificada para producto ID: ${productIdToUpdate}, Nueva Cantidad: ${newQuantity}`);

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
    console.log("DOMContentLoaded: DOM completamente cargado. Inicializando script.js...");
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
    loginBtn = document.getElementById('login-btn'); // Referencia al botón de login original

    // Logging de inicialización de elementos principales
    console.log("Elementos principales inicializados:");
    console.log("cartItemCountSpan:", cartItemCountSpan ? "OK" : "NO ENCONTRADO");
    console.log("loginModal:", loginModal ? "OK" : "NO ENCONTRADO");
    console.log("loginForm:", loginForm ? "OK" : "NO ENCONTRADO");
    console.log("registerForm:", registerForm ? "OK" : "NO ENCONTRADO");
    console.log("loginBtn (navbar):", loginBtn ? "OK" : "NO ENCONTRADO");
    console.log("notificationModal:", notificationModal ? "OK" : "NO ENCONTRADO");

    // Inicializar el contador del carrito y renderizar items si estamos en carrito.html
    updateCartItemCount();
    renderCartItems();
    updateAuthUI(); // ¡CRÍTICO! Actualizar la UI de autenticación al cargar la página

    // Event listeners específicos para el modal de Login/Registro que no usan delegación
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
                console.log("Modal de Login cerrado al clickear fuera.");
            }
        });
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Link 'Registrarse' clickeado.");
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
            console.log("Link 'Iniciar Sesión' clickeado.");
            if (registerForm) registerForm.style.display = 'none';
            if (loginForm) loginForm.style.display = 'block';
            if (loginModal && loginModal.querySelector('h2')) {
                loginModal.querySelector('h2').textContent = 'Iniciar Sesión';
            }
        });
    }

    // --- Lógica de submit para el formulario de LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = loginForm.querySelector('#username').value;
            const passwordInput = loginForm.querySelector('#password').value;
            
            console.log("Formulario de LOGIN enviado para:", usernameInput);
            try {
                const response = await fetch(`${BASE_API_URL}/api/Auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: usernameInput, password: passwordInput })
                });
                
                if (!response.ok) {
                    const errorData = await response.json(); // Intentar parsear el JSON de error
                    throw new Error(errorData.message || `Error del servidor: ${response.status}`);
                }

                const data = await response.json();
                console.log("Login exitoso. Datos recibidos:", data);
                
                saveAuthData(data.token, data.role, data.username);

                showNotification(`¡Bienvenido, ${data.username || usernameInput}!`, 'success', 'Login Exitoso');
                if (loginModal) loginModal.style.display = 'none';
                loginForm.reset();

                if (data.role === 'Admin') {
                    console.log("Usuario es Admin. Redirigiendo a admin.html...");
                    window.location.href = 'admin.html';
                } else {
                    if (window.location.pathname.includes('admin.html')) {
                        console.log("Usuario NO Admin inició sesión en admin.html. Redirigiendo a index.html...");
                        window.location.href = 'index.html';
                    } else {
                        console.log("Usuario NO Admin inició sesión en página regular. Actualizando UI...");
                        updateAuthUI(); // Para otras páginas, solo actualiza la UI (navbar)
                    }
                }

            } catch (error) {
                console.error('Error durante el login:', error);
                showNotification(`Error al iniciar sesión: ${error.message}`, 'error', 'Login Fallido');
            }
        });
    } else {
        console.warn("Formulario de login (id='login-form') no encontrado.");
    }

    // --- Lógica de submit para el formulario de REGISTRO ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const regUsername = registerForm.querySelector('#reg-username').value;
            const regPassword = registerForm.querySelector('#reg-password').value;
            const confirmPassword = registerForm.querySelector('#confirm-password').value;

            console.log("Formulario de REGISTRO enviado para:", regUsername);

            if (regPassword !== confirmPassword) {
                showNotification('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.', 'error', 'Error de Registro');
                return;
            }

            try {
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
                    throw new Error(errorData.message || `Error del servidor: ${response.status}`);
                }

                const data = await response.json();
                console.log("Registro exitoso. Datos recibidos:", data);
                showNotification(`¡Usuario ${data.username} registrado con éxito! Ahora puedes iniciar sesión.`, 'success', 'Registro Exitoso');
                if (loginModal) loginModal.style.display = 'none';
                registerForm.reset();
                if (loginForm) loginForm.style.display = 'block';
                if (registerForm) registerForm.style.display = 'none';
                if (loginModal && loginModal.querySelector('h2')) {
                    loginModal.querySelector('h2').textContent = 'Iniciar Sesión';
                }
                console.log("Registro completado. Modal de login configurado para iniciar sesión.");

            } catch (error) {
                console.error('Error durante el registro:', error);
                showNotification(`Error al registrarse: ${error.message}`, 'error', 'Registro Fallido');
            }
        });
    } else {
        console.warn("Formulario de registro (id='register-form') no encontrado.");
    }

    // Lógica específica para la página admin.html
    if (window.location.pathname.includes('admin.html')) {
        console.log('Estamos en admin.html. Iniciando carga del panel de administración...');
        
        const userRole = getUserRole();
        console.log('Rol de usuario detectado al cargar admin.html:', userRole);

        if (userRole !== 'Admin') {
            showNotification('Acceso denegado. Solo los administradores pueden acceder a esta página.', 'error', 'Acceso Restringido');
            console.log('Redirigiendo a index.html porque el usuario no es Admin.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return; // Detener la ejecución si no es admin
        }
        
        console.log('Usuario es Admin. Cargando elementos DOM y datos del admin...');
        loadAdminElements(); // ¡IMPORTANTE! Asigna las referencias a los elementos DOM aquí

        // --- Event Listener para el formulario de PRODUCTOS ---
        if (productForm) {
            productForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log("Formulario de Producto enviado.");
                const productId = productIdInput.value ? parseInt(productIdInput.value) : 0;
                
                // Construye el objeto de datos del producto en PascalCase para que coincida con el backend C#
                const productData = {
                    Id: productId, // 0 si es nuevo, ID si es edición
                    Nombre: productNameInput.value,
                    Descripcion: productDescriptionInput.value,
                    Precio: parseFloat(productPriceInput.value),
                    Stock: parseInt(productStockInput.value),
                    ImagenUrl: productImageUrlInput.value,
                    CategoriaId: parseInt(productCategorySelect.value),
                    EstaEnOferta: productIsOfferCheckbox.checked
                };
                console.log("Datos de producto a enviar:", productData);

                if (productId === 0) {
                    await addProduct(productData);
                } else {
                    await updateProduct(productId, productData);
                }
            });
            // Listener para el botón Cancelar Edición
            if (cancelProductEditBtn) {
                cancelProductEditBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    resetProductForm();
                    console.log("Edición de producto cancelada.");
                });
            }
        } else {
            console.warn("Formulario de producto (id='product-form') no encontrado. La gestión de productos no funcionará.");
        }

        // --- Event Listener para el formulario de CATEGORÍAS ---
        if (categoryForm) {
            categoryForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log("Formulario de Categoría enviado.");
                const categoryId = categoryIdInput.value ? parseInt(categoryIdInput.value) : 0;
                
                // Construye el objeto de datos de la categoría en PascalCase
                const categoryData = {
                    Id: categoryId, // 0 si es nuevo, ID si es edición
                    Nombre: categoryNameInput.value,
                    // Si el select es vacío (ninguna seleccionada), enviar null para ParentCategoryId
                    ParentCategoryId: categoryParentSelect.value ? parseInt(categoryParentSelect.value) : null
                };
                console.log("Datos de categoría a enviar:", categoryData);

                if (categoryId === 0) {
                    await addCategory(categoryData);
                } else {
                    await updateCategory(categoryId, categoryData);
                }
            });
            // Listener para el botón Cancelar Edición
            if (cancelCategoryEditBtn) {
                cancelCategoryEditBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    resetCategoryForm();
                    console.log("Edición de categoría cancelada.");
                });
            }
        } else {
            console.warn("Formulario de categoría (id='category-form') no encontrado. La gestión de categorías no funcionará.");
        }

        // Carga inicial de todas las categorías para poblar dropdowns y tablas.
        // Es importante hacer esto *antes* de intentar cargar productos, ya que los productos necesitan las categorías.
        fetchAllCategories().then(() => {
            console.log('Categorías cargadas inicialmente en admin.html.');
            // Cargar contenido para la pestaña activa por defecto (Gestión de Productos)
            // Esto debería cargar los productos y poblar el dropdown de categorías del formulario de productos.
            showSection('product-management-section');
            console.log('showSection("product-management-section") llamado después de cargar categorías.');
        }).catch(error => {
            console.error("Error CRÍTICO en la carga inicial de categorías para admin.html:", error);
            showNotification("Error crítico al cargar datos iniciales del admin. Por favor, verifica la consola para más detalles y asegúrate de que la API esté corriendo.", 'error', 'Error de Carga');
        });
    }

    // --- Funciones de carga de productos para el Front-end de la tienda ---
    // Estas funciones se ejecutan según el título de la página
    const currentPageTitle = document.title;
    console.log("Título de la página actual:", currentPageTitle);

    // Ajustes para que la detección de la página sea más robusta
    if (currentPageTitle.includes('Tienda Vintage - Catálogo Dinámico') || window.location.pathname.includes('index.html')) {
        console.log("Cargando productos y slider para la página principal.");
        loadProductos();
        setupHeroSlider();
    } else if (currentPageTitle.includes('Ofertas')) {
        console.log("Cargando productos en oferta.");
        loadProductsInOffer();
    } else if (currentPageTitle.includes('Hombre')) {
        console.log("Cargando productos para la página de Hombre.");
        // Para Hombre y Mujer, aseguramos que las categorías estén cargadas antes de intentar filtrar productos
        fetchAllCategories().then(() => {
            loadProductsForHombre();
        }).catch(error => {
            console.error("Error al precargar categorías para la página Hombre:", error);
            showNotification("Error al cargar datos necesarios para la página de hombre.", 'error');
        });
    } else if (currentPageTitle.includes('Mujer')) {
        console.log("Cargando productos para la página de Mujer.");
        fetchAllCategories().then(() => {
            loadProductsForMujer();
        }).catch(error => {
            console.error("Error al precargar categorías para la página Mujer:", error);
            showNotification("Error al cargar datos necesarios para la página de mujer.", 'error');
        });
    }
});

// Function to create a product card HTML string (Reusable for all product loading functions)
function createProductCardHtml(producto) {
    const isOffer = producto.estaEnOferta;
    const originalPrice = producto.precio.toFixed(2);
    // Si necesitas un descuento específico para la oferta, ajusta el 0.8
    const offerPrice = isOffer ? (producto.precio * 0.8).toFixed(2) : originalPrice;

    // Aquí ajustamos la visualización del precio según si es oferta
    let priceDisplayHtml = '';
    if (isOffer) {
        priceDisplayHtml = `
            <p class="price old-price">$${originalPrice}</p>
            <p class="price current-price">$${offerPrice}</p>
        `;
    } else {
        priceDisplayHtml = `<p class="price">$${originalPrice}</p>`;
    }

    // La etiqueta de oferta, solo si el producto está en oferta
    const offerTagHtml = isOffer ? `<span class="offer-tag">¡En Oferta!</span>` : '';

    return `
        <div class="product-card">
            <div
                class="image-wrapper add-to-cart-btn"
                data-product-id="${producto.id}"
                data-product-name="${producto.nombre}"
                data-product-price="${isOffer ? offerPrice : originalPrice}"
                data-product-image="${producto.imagenUrl}"
            >
                <img src="${producto.imagenUrl}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='https://placehold.co/500x500/ECEFF1/607D8B?text=Sin%20Imagen';">
                ${offerTagHtml}
                <div class="add-to-cart-overlay">
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
            </div>
            <h3 class="product-name">${producto.nombre}</h3>
            <p class="description">${producto.descripcion}</p>
            ${priceDisplayHtml}
            <!-- El stock no se muestra según la última instrucción -->
            <!-- <p class="stock">Stock: ${producto.stock}</p> -->
        </div>
    `;
}

// Example: Function to load all products (for index.html)
async function loadProductos() {
    console.log("Iniciando loadProductos: Cargando todos los productos para el catálogo principal.");
    const productsGrid = document.getElementById('api-product-grid');
    if (!productsGrid) {
        console.warn("api-product-grid no encontrado en esta página (loadProductos).");
        return;
    }

    productsGrid.innerHTML = '<p>Cargando productos...</p>';
    
    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        let productos = await response.json();
        console.log("Productos cargados de la API (loadProductos):", productos);

        if (productos.length === 0) {
            productsGrid.innerHTML = '<p>No hay productos disponibles.</p>';
            return;
        }

        productsGrid.innerHTML = '';
        productos.forEach(producto => {
            productsGrid.innerHTML += createProductCardHtml(producto);
        });
        console.log("Productos renderizados en el catálogo principal.");
    } catch (error) {
        console.error("Error al cargar productos para la tienda:", error);
        showNotification("Error al cargar productos para la tienda. Asegúrate de que la API está corriendo.", 'error', 'Error de Carga');
        productsGrid.innerHTML = '<p style="color: red;">Error al cargar productos.</p>';
    }
}

// Example: Function to load products in offer (for ofertas.html)
async function loadProductsInOffer() {
    console.log("Iniciando loadProductsInOffer: Cargando productos en oferta.");
    const productsGrid = document.getElementById('api-product-grid');
    if (!productsGrid) {
        console.warn("api-product-grid no encontrado en esta página (loadProductsInOffer).");
        return;
    }
    productsGrid.innerHTML = '<p>Cargando productos en oferta...</p>';
    
    try {
        const response = await fetch(`${BASE_API_URL}/api/Productos`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const allProducts = await response.json();
        console.log("Productos cargados de la API (loadProductsInOffer):", allProducts);

        const productosEnOferta = allProducts.filter(p => p.estaEnOferta);

        if (productosEnOferta.length === 0) {
            productsGrid.innerHTML = '<p>No hay productos en oferta disponibles.</p>';
            return;
        }

        productsGrid.innerHTML = '';
        productosEnOferta.forEach(producto => {
            productsGrid.innerHTML += createProductCardHtml(producto);
        });
        console.log("Productos en oferta renderizados.");
    } catch (error) {
        console.error("Error al cargar productos en oferta:", error);
        showNotification("Error al cargar productos en oferta. Asegúrate de que la API está corriendo.", 'error', 'Error de Carga');
        productsGrid.innerHTML = '<p style="color: red;">Error al cargar productos.</p>';
    }
}

// Example: Function to load products for men (for hombre.html)
async function loadProductsForHombre() {
    console.log("Iniciando loadProductsForHombre: Cargando productos para la categoría Hombre.");
    const productsGrid = document.getElementById('api-product-grid');
    if (!productsGrid) {
        console.warn("api-product-grid no encontrado en esta página (loadProductsForHombre).");
        return;
    }
    productsGrid.innerHTML = '<p>Cargando productos para hombre...</p>';
    
    try {
        // allCategories debería haber sido poblada por la llamada a fetchAllCategories de DOMContentLoaded para la página "Hombre".
        if (allCategories.length === 0) {
            console.warn("allCategories está inesperadamente vacío al intentar cargar productos para Hombre. Intentando obtener de nuevo.");
            await fetchAllCategories(); // Fallback si por alguna razón no se cargó
        }

        const response = await fetch(`${BASE_API_URL}/api/Productos`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const allProducts = await response.json();
        console.log("Productos cargados de la API (loadProductsForHombre):", allProducts);

        // Obtener IDs de categorías dinámicamente. Estos nombres DEBEN coincidir con tu DB.
        const HOMBRE_CATEGORY = allCategories.find(cat => cat.nombre && cat.nombre.toLowerCase() === "hombre");
        const JEANS_CATEGORY = allCategories.find(cat => cat.nombre && cat.nombre.toLowerCase() === "jeans");
        const REMERAS_CATEGORY = allCategories.find(cat => cat.nombre && cat.nombre.toLowerCase() === "remeras");

        const HOMBRE_CATEGORY_ID = HOMBRE_CATEGORY ? HOMBRE_CATEGORY.id : null;
        const JEANS_CATEGORY_ID = JEANS_CATEGORY ? JEANS_CATEGORY.id : null;
        const REMERAS_CATEGORY_ID = REMERAS_CATEGORY ? REMERAS_CATEGORY.id : null;

        console.log("IDs de Categoría para Hombre (buscados):", { HOMBRE_CATEGORY_ID, JEANS_CATEGORY_ID, REMERAS_CATEGORY_ID });


        const productosHombre = allProducts.filter(p =>
            p.categoriaId == HOMBRE_CATEGORY_ID ||
            p.categoriaId == JEANS_CATEGORY_ID ||
            p.categoriaId == REMERAS_CATEGORY_ID
        );
        console.log("Productos filtrados para Hombre:", productosHombre);

        if (productosHombre.length === 0) {
            productsGrid.innerHTML = '<p>No hay productos disponibles para hombre.</p>';
            return;
        }

        productsGrid.innerHTML = '';
        productosHombre.forEach(producto => {
            productsGrid.innerHTML += createProductCardHtml(producto);
        });
        console.log("Productos para Hombre renderizados.");
    } catch (error) {
        console.error("Error al cargar productos para hombre:", error);
        showNotification("Error al cargar productos para hombre. Asegúrate de que la API está corriendo.", 'error', 'Error de Carga');
        productsGrid.innerHTML = '<p style="color: red;">Error al cargar productos.</p>';
    }
}

// Example: Function to load products for women (for mujer.html)
async function loadProductsForMujer() {
    console.log("Iniciando loadProductsForMujer: Cargando productos para la categoría Mujer.");
    const productsGrid = document.getElementById('api-product-grid');
    if (!productsGrid) {
        console.warn("api-product-grid no encontrado en esta página (loadProductsForMujer).");
        return;
    }
    productsGrid.innerHTML = '<p>Cargando productos para mujer...</p>';
    
    try {
        // allCategories debería haber sido poblada por la llamada a fetchAllCategories de DOMContentLoaded para la página "Mujer".
        if (allCategories.length === 0) {
            console.warn("allCategories está inesperadamente vacío al intentar cargar productos para Mujer. Intentando obtener de nuevo.");
            await fetchAllCategories(); // Fallback si por alguna razón no se cargó
        }

        const response = await fetch(`${BASE_API_URL}/api/Productos`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const allProducts = await response.json();
        console.log("Productos cargados de la API (loadProductsForMujer):", allProducts);

        // Obtener IDs de categorías dinámicamente. Estos nombres DEBEN coincidir con tu DB.
        const MUJER_CATEGORY = allCategories.find(cat => cat.nombre && cat.nombre.toLowerCase() === "mujer");
        const BLUSAS_CATEGORY = allCategories.find(cat => cat.nombre && cat.nombre.toLowerCase() === "blusas");
        const SANDALIAS_CATEGORY = allCategories.find(cat => cat.nombre && cat.nombre.toLowerCase() === "sandalias");

        const MUJER_CATEGORY_ID = MUJER_CATEGORY ? MUJER_CATEGORY.id : null;
        const BLUSAS_CATEGORY_ID = BLUSAS_CATEGORY ? BLUSAS_CATEGORY.id : null;
        const SANDALIAS_CATEGORY_ID = SANDALIAS_CATEGORY ? SANDALIAS_CATEGORY.id : null;

        console.log("IDs de Categoría para Mujer (buscados):", { MUJER_CATEGORY_ID, BLUSAS_CATEGORY_ID, SANDALIAS_CATEGORY_ID });

        const productosMujer = allProducts.filter(p =>
            p.categoriaId == MUJER_CATEGORY_ID ||
            p.categoriaId == BLUSAS_CATEGORY_ID ||
            p.categoriaId == SANDALIAS_CATEGORY_ID
        );
        console.log("Productos filtrados para Mujer:", productosMujer);

        if (productosMujer.length === 0) {
            productsGrid.innerHTML = '<p>No hay productos disponibles para mujer.</p>';
            return;
        }

        productsGrid.innerHTML = '';
        productosMujer.forEach(producto => {
            productsGrid.innerHTML += createProductCardHtml(producto);
        });
        console.log("Productos para Mujer renderizados.");
    } catch (error) {
        console.error("Error al cargar productos para mujer:", error);
        showNotification("Error al cargar productos para mujer. Asegúrate de que la API está corriendo.", 'error', 'Error de Carga');
        productsGrid.innerHTML = '<p style="color: red;">Error al cargar productos.</p>';
    }
}

// Function for the hero slider (specific to index.html)
function setupHeroSlider() {
    console.log("Configurando Hero Slider...");
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
            console.log(`Slider: Mostrando slide ${currentIndex}`);
        }

        function nextSlide() {
            showSlide(currentIndex + 1);
        }

        function prevSlide() {
            showSlide(currentIndex - 1);
        }

        function startSlider() {
            stopSlider(); // Asegura que solo haya un intervalo corriendo
            slideInterval = setInterval(nextSlide, 3000);
            console.log("Slider automático iniciado.");
        }

        function stopSlider() {
            clearInterval(slideInterval);
            console.log("Slider automático detenido.");
        }

        // Listener para los botones de navegación
        nextBtn.addEventListener('click', () => { stopSlider(); nextSlide(); startSlider(); });
        prevBtn.addEventListener('click', () => { stopSlider(); prevSlide(); startSlider(); });

        showSlide(currentIndex); // Mostrar la primera imagen al inicio
        startSlider(); // Iniciar el carrusel automático
    } else {
        console.warn("Elementos del Hero Slider no encontrados. El slider no funcionará.");
    }
}
