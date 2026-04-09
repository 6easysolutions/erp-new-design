/**
 * Mock Inventory Service
 * Simulates a RESTful API interaction with network latency.
 */

const initialProducts = [
    { id: 1, name: "Fresh Tomato", sku: "VEG-001", cat: "Vegetables", stock: 15, maxStock: 50, unit: "kg", price: "$2.50", status: "In Stock", img: "/assets/img/products/stock-img-01.png" },
    { id: 2, name: "Red Onion", sku: "VEG-002", cat: "Vegetables", stock: 8, maxStock: 60, unit: "kg", price: "$1.80", status: "Low Stock", img: "/assets/img/products/stock-img-02.png" },
    { id: 3, name: "Organic Milk", sku: "DAIRY-005", cat: "Dairy", stock: 0, maxStock: 40, unit: "L", price: "$3.00", status: "Out of Stock", img: "/assets/img/products/stock-img-03.png" },
    { id: 4, name: "Chicken Breast", sku: "MEAT-012", cat: "Meat", stock: 45, maxStock: 50, unit: "kg", price: "$12.00", status: "In Stock", img: "/assets/img/products/stock-img-04.png" },
    { id: 5, name: "Basmati Rice", sku: "GRAIN-003", cat: "Dry Goods", stock: 200, maxStock: 300, unit: "kg", price: "$5.50", status: "In Stock", img: "/assets/img/products/stock-img-05.png" },
    { id: 6, name: "Green Apple", sku: "FRUIT-088", cat: "Fruits", stock: 12, maxStock: 100, unit: "kg", price: "$4.00", status: "Low Stock", img: "/assets/img/products/stock-img-06.png" },
];

const LATENCY_MS = 800; // Simulate realistic network delay

export const inventoryService = {
    getAllProducts: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...initialProducts]);
            }, LATENCY_MS);
        });
    },

    getProductsByStatus: async (status) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (status === 'All') {
                    resolve([...initialProducts]);
                } else {
                    const filtered = initialProducts.filter(p => p.status === status);
                    resolve(filtered);
                }
            }, LATENCY_MS);
        });
    },

    // Simulate an update action (e.g., Delete)
    deleteProduct: async (id) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Determine if we should mock a success or fail? Let's assume success.
                resolve({ success: true, message: `Product ${id} deleted successfully.` });
            }, LATENCY_MS);
        });
    }
};
