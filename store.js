let products = [];

const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");
const productGrid = document.getElementById("productGrid");
const resultsText = document.getElementById("resultsText");
const emptyState = document.getElementById("emptyState");
const productCount = document.getElementById("productCount");

// Fetch products from API
async function loadProducts() {
    try {
        const response = await fetch("https://dummyjson.com/products");

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        products = data.products.map(product => ({
            ...product
        }));

        productCount.textContent =
            `Discover our curated collection of ${products.length} products`;

        populateCategories();
        renderProducts();

    } catch (error) {
        console.error(error);

        productGrid.innerHTML = `
            <div class="col-span-full text-center text-red-600">
                Failed to load products.
            </div>
        `;
    }
}

function populateCategories() {

    const categories = [...new Set(products.map(p => p.category))];

    categorySelect.innerHTML =
        `<option value="">All Categories</option>`;

    categories.forEach(category => {

        const option = document.createElement("option");
        option.value = category;
        option.textContent =
            category.charAt(0).toUpperCase() + category.slice(1);

        categorySelect.appendChild(option);
    });

}

function renderProducts() {

    let filtered = [...products];

    const search = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const sort = sortSelect.value;

    // Search
    if (search) {
        filtered = filtered.filter(product =>
            product.title.toLowerCase().includes(search) ||
            product.description.toLowerCase().includes(search)
        );
    }

    // Category
    if (category) {
        filtered = filtered.filter(product =>
            product.category === category
        );
    }

    // Sort
    switch (sort) {

        case "price-asc":
            filtered.sort((a, b) => a.price - b.price);
            break;

        case "price-desc":
            filtered.sort((a, b) => b.price - a.price);
            break;

        case "rating":
            filtered.sort((a, b) => b.rating - a.rating);
            break;

        default:
            // Default order from API
            break;
    }

    resultsText.textContent =
        `Showing ${filtered.length} product${filtered.length !== 1 ? "s" : ""}`;

    productGrid.innerHTML = "";

    if (!filtered.length) {

        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    filtered.forEach(product => {

        productGrid.innerHTML += `
            <div class="bg-zinc-900 relative rounded-xl shadow hover:shadow-lg transition p-4">

                <img
                    src="${product.thumbnail}"
                    alt="${product.title}"
                    class="w-full h-70 object-cover rounded-lg"
                >

                <div class=" mt-4">

                    <span class="text-xs bg-gray-500 px-2 py-1 rounded">
                        ${product.category}
                    </span>

                     <span class="absolute top-4 right-6 text-xs bg-orange-500 px-2 py-1 rounded">
                        ${product.stock} in stock
                    </span>

                    <h3 class="font-bold text-amber-50 text-lg mt-2">
                        ${product.title}
                    </h3>

                    <p class="text-gray-400 text-sm mt-1 line-clamp-3">
                        ${product.description}
                    </p>

                    <div class="flex justify-between items-center mt-4">

                        <span class="text-xl font-bold text-blue-600">
                            $${product.price}
                        </span>

                        <span class="text-yellow-500">
                            ⭐ ${product.rating}
                        </span>

                    </div>

                </div>

            </div>
        `;
    });

}

searchInput.addEventListener("input", renderProducts);
categorySelect.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);

loadProducts();