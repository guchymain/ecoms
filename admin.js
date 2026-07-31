
const API_URL = "https://dummyjson.com/products";

let products = [];
let activityLog = [];
let editingId = null;

const table = document.getElementById("productTable");

const totalProducts = document.getElementById("totalProducts");
const inventoryValue = document.getElementById("inventoryValue");
const averageRating = document.getElementById("averageRating");
const lowStock = document.getElementById("lowStock");

const activityContainer = document.getElementById("activityLog");

const modal = document.getElementById("productModal");
const form = document.getElementById("productForm");

const modalTitle = document.getElementById("modalTitle");

const addBtn = document.getElementById("addProductBtn");
const cancelBtn = document.getElementById("cancelBtn");

// form inputs

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const stockInput = document.getElementById("stock");
const categoryInput = document.getElementById("category");


async function loadProducts() {

    try {

        const response = await fetch(API_URL);
        const data = await response.json();

        products = data.products;

        renderDashboard();

    } catch (err) {

        console.error(err);

        table.innerHTML = `
        <tr>
            <td colspan="6" class="text-center p-8 text-red-500">
                Failed to load products.
            </td>
        </tr>
        `;
    }

}

// Dashboard

function renderDashboard() {

    renderStats();
    renderTable();
    renderActivity();

}

// Stats

function renderStats() {

    totalProducts.textContent = products.length;

    const value = products.reduce((sum, p) => {

        return sum + (p.price * p.stock);

    }, 0);

    

}

// Product Table

function renderTable() {

    if (!products.length) {

        table.innerHTML = `
        <tr>
            <td colspan="6"
                class="text-center p-10">

                No products

            </td>
        </tr>
        `;

        return;
    }

    table.innerHTML = "";

    products.forEach(product => {

        table.innerHTML += `

        <tr class="border-b hover:bg-zinc-300">

            <td class="p-4">

                <div class="flex items-center gap-3">

                    <img
                        src="${product.thumbnail}"
                        class="w-12 h-12 rounded object-cover">

                    <div>

                        <div class="font-semibold text-amber-50">

                            ${product.title}

                        </div>

                        <div class="text-sm text-gray-400">

                            ${product.description.substring(0,45)}...

                        </div>

                    </div>

                </div>

            </td>

            <td class="p-4 text-amber-50">

                ${product.category}

            </td>

            <td class="p-4 text-amber-50 text-right">

                $${product.price}

            </td>

            <td class="p-4 text-amber-50 text-right">

                ${product.stock}

            </td>

            <td class="p-4 text-amber-50 text-center">

                ⭐ ${product.rating}

            </td>

            <td class="p-4">

                <div class="flex justify-center gap-2">

                    <button
                        onclick="editProduct(${product.id})"
                        class="px-3 py-1 rounded bg-blue-400 hover:bg-blue-500 text-black">

                        Edit

                    </button>

                    <button
                        onclick="deleteProduct(${product.id})"
                        class="px-3 py-1 rounded bg-red-600 text-black">

                        Delete

                    </button>

                </div>

            </td>

        </tr>

        `;

    });

}

// Activity

function addActivity(action, product) {

    activityLog.unshift({

        action,
        product: product.title,
        time: new Date().toLocaleString()

    });

    renderActivity();

}

function renderActivity() {

    if (!activityLog.length) {

        activityContainer.innerHTML = `

        <p class="text-gray-500">

            No activity yet.

        </p>

        `;

        return;

    }

    activityContainer.innerHTML = "";

    activityLog.forEach(log => {

        activityContainer.innerHTML += `

        <div class="border-b pb-3">

            <div class="font-medium text-amber-50">

                ${log.action}

            </div>

            <div class="font-medium text-zinc-400">

                ${log.product}

            </div>

            <div class="text-xs text-gray-500">

                ${log.time}

            </div>

        </div>

        `;

    });

}

// Modal

addBtn.onclick = () => {

    editingId = null;

    modalTitle.textContent = "Add Product";

    form.reset();

    modal.classList.remove("hidden");

};

cancelBtn.onclick = () => {

    modal.classList.add("hidden");

};

// Edit

window.editProduct = function(id) {

    const product = products.find(p => p.id === id);

    editingId = id;

    modalTitle.textContent = "Edit Product";

    titleInput.value = product.title;
    descriptionInput.value = product.description;
    categoryInput.value = product.category;
    stockInput.value = product.stock;
    priceInput.value = product.price;

    modal.classList.remove("hidden");

}

// Save

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const product = {

        title: titleInput.value,
        description: descriptionInput.value,
        category: categoryInput.value,
        price: Number(priceInput.value),
        stock: Number(stockInput.value)

    };

    if(editingId){

        await fetch(API_URL + "/" + editingId,{

            method:"PUT",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(product)

        });

        const index = products.findIndex(p=>p.id===editingId);

        products[index]={...products[index],...product};

        addActivity("Updated",product);

    }

    else{

        const response=await fetch(API_URL+"/add",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(product)

        });

        const newProduct=await response.json();

        products.unshift(newProduct);

        addActivity("Created",newProduct);

    }

    modal.classList.add("hidden");

    renderDashboard();

});

// Delete

window.deleteProduct = async function(id){

    if(!confirm("Delete this product?")) return;

    await fetch(API_URL+"/"+id,{

        method:"DELETE"

    });

    const product=products.find(p=>p.id===id);

    products=products.filter(p=>p.id!==id);

    addActivity("Deleted",product);

    renderDashboard();

}

loadProducts();