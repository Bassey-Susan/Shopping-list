const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const quantityInput = document.getElementById('quantity-input');
const itemList = document.getElementById('item-list');
const clearBtn = document.getElementById('clear');
const itemFilter = document.getElementById('filter');
const formBtn = itemForm.querySelector('button');
const themeToggle = document.getElementById('theme-toggle');
const categoryInput = document.getElementById('category-input');
let isEditMode = false;

// Theme handling
function initTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  icon.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

function displayItems() {
  const itemsFromStorage = getItemsFromStorage();
  itemsFromStorage.forEach((item) => addItemToDOM(item));
  checkUI();
}

function onAddItemSubmit(e) {
  e.preventDefault();

  const newItem = itemInput.value.trim();
  const quantity = parseInt(quantityInput.value) || 0;
  const category = categoryInput.value;

  // Validate Input
  if (newItem === '') {
    alert('Please add an item');
    return;
  }

  if (category === '') {
    alert('Please select a category');
    return;
  }

  // Check for edit mode
  if (isEditMode) {
    const itemToEdit = itemList.querySelector('.edit-mode');
    const itemData = JSON.parse(itemToEdit.dataset.item);
    removeItemFromStorage(itemData);
    itemToEdit.classList.remove('edit-mode');
    itemToEdit.remove();
    isEditMode = false;
  } else {
    if (checkIfItemExists(newItem)) {
      alert(`The item "${newItem}" already exists!`);
      return;
    }
  }

  // Create item DOM element
  addItemToDOM(newItem, quantity, category);

  // Add item to storage
  addItemToStorage(newItem, quantity, category);

  checkUI();

  itemInput.value = '';
  quantityInput.value = '0';
  categoryInput.value = '';
}

function addItemToDOM(item, quantity, category) {
  // Create list item
  const li = document.createElement('li');
  const itemData = { 
    name: item, 
    quantity: quantity, 
    category: category,
    completed: false 
  };
  li.dataset.item = JSON.stringify(itemData);
  
  // Add category badge
  if (category) {
    const categoryBadge = document.createElement('span');
    categoryBadge.className = `category-badge category-${category}`;
    categoryBadge.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    li.appendChild(categoryBadge);
  }

  const itemText = document.createElement('span');
  itemText.textContent = item;
  li.appendChild(itemText);

  // Add quantity badge only if quantity is greater than 1
  if (quantity > 1) {
    const quantityBadge = document.createElement('span');
    quantityBadge.className = 'quantity-badge';
    quantityBadge.textContent = quantity;
    li.appendChild(quantityBadge);
  }

  const button = createButton('remove-item btn-link text-red');
  li.appendChild(button);

  // Add li to the DOM
  itemList.appendChild(li);
}

function createButton(classes) {
  const button = document.createElement('button');
  button.className = classes;
  const icon = createIcon('fa-solid fa-xmark');
  button.appendChild(icon);
  return button;
}

function createIcon(classes) {
  const icon = document.createElement('i');
  icon.className = classes;
  return icon;
}

function addItemToStorage(item, quantity, category) {
  const itemsFromStorage = getItemsFromStorage();

  // Add new item to array
  itemsFromStorage.push({ 
    name: item, 
    quantity: quantity, 
    category: category,
    completed: false 
  });

  // Convert to JSON string and set to local storage
  localStorage.setItem('items', JSON.stringify(itemsFromStorage));
}

function getItemsFromStorage() {
  let itemsFromStorage;

  if (localStorage.getItem('items') === null) {
    itemsFromStorage = [];
  } else {
    itemsFromStorage = JSON.parse(localStorage.getItem('items'));
  }

  return itemsFromStorage;
}

function onClickItem(e) {
  if (e.target.parentElement.classList.contains('remove-item')) {
    removeItem(e.target.parentElement.parentElement);
  } else if (e.target.closest('li')) {
    const li = e.target.closest('li');
    if (e.target.classList.contains('quantity-badge')) {
      return; // Don't toggle completion when clicking quantity badge
    }
    toggleItemCompletion(li);
  }
}

function checkIfItemExists(item) {
  const itemsFromStorage = getItemsFromStorage();
  return itemsFromStorage.some(i => i.name === item);
}

function setItemToEdit(item) {
  isEditMode = true;

  itemList
    .querySelectorAll('li')
    .forEach((i) => i.classList.remove('edit-mode'));

  item.classList.add('edit-mode');
  formBtn.innerHTML = '<i class="fa-solid fa-pen"></i>   Update Item';
  formBtn.style.backgroundColor = '#228B22';
  itemInput.value = item.querySelector('span').textContent;
}

function toggleItemCompletion(li) {
  const itemData = JSON.parse(li.dataset.item);
  itemData.completed = !itemData.completed;
  li.dataset.item = JSON.stringify(itemData);
  li.classList.toggle('completed', itemData.completed);
  updateItemInStorage(itemData);
}

function updateItemInStorage(itemData) {
  let itemsFromStorage = getItemsFromStorage();
  const index = itemsFromStorage.findIndex(item => item.name === itemData.name);
  if (index !== -1) {
    itemsFromStorage[index] = itemData;
    localStorage.setItem('items', JSON.stringify(itemsFromStorage));
  }
}

function removeItem(item) {
  if (confirm(`Are you sure you want to remove the item "${item.querySelector('span').textContent}"?`)) {
    // Add slide out animation
    item.style.animation = 'slideOut 0.3s ease forwards';
    
    // Wait for animation to complete before removing
    setTimeout(() => {
      item.remove();
      const itemData = JSON.parse(item.dataset.item);
      removeItemFromStorage(itemData);
      checkUI();
    }, 300);
  }
}

function removeItemFromStorage(item) {
  let itemsFromStorage = getItemsFromStorage();

  // Filter out item to be removed
  itemsFromStorage = itemsFromStorage.filter((i) => i.name !== item.name);

  // Re-set to localstorage
  localStorage.setItem('items', JSON.stringify(itemsFromStorage));
}

function clearItems() {
  while (itemList.firstChild) {
    itemList.removeChild(itemList.firstChild);
  }

  // Clear from localStorage
  localStorage.removeItem('items');

  // Add empty state
  const emptyState = document.createElement('li');
  emptyState.className = 'empty-state';
  emptyState.innerHTML = `
    <i class="fa-solid fa-cart-shopping"></i>
    <p>Your shopping list is empty</p>
    <p class="sub-text">Add items to get started!</p>
  `;
  itemList.appendChild(emptyState);

  checkUI();
}

function filterItems(e) {
  const items = itemList.querySelectorAll('li');
  const text = e.target.value.toLowerCase();

  items.forEach((item) => {
    const itemName = item.querySelector('span').textContent.toLowerCase();

    if (itemName.indexOf(text) != -1) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

function checkUI() {
  itemInput.value = '';

  const items = itemList.querySelectorAll('li:not(.empty-state)');

  if (items.length === 0) {
    clearBtn.style.display = 'none';
    itemFilter.style.display = 'none';
    if (!itemList.querySelector('.empty-state')) {
      const emptyState = document.createElement('li');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Your shopping list is empty</p>
        <p class="sub-text">Add items to get started!</p>
      `;
      itemList.appendChild(emptyState);
    }
  } else {
    clearBtn.style.display = 'block';
    itemFilter.style.display = 'block';
    const emptyState = itemList.querySelector('.empty-state');
    if (emptyState) {
      emptyState.remove();
    }
  }

  formBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Item';
  formBtn.style.backgroundColor = '#333';

  isEditMode = false;
}

// Initialize app
function init() {
  // Event Listeners
  itemForm.addEventListener('submit', onAddItemSubmit);
  itemList.addEventListener('click', onClickItem);
  clearBtn.addEventListener('click', clearItems);
  itemFilter.addEventListener('input', filterItems);
  themeToggle.addEventListener('click', toggleTheme);
  
  // Initialize theme
  initTheme();
  
  // Display items
  displayItems();
  checkUI();
}

init();