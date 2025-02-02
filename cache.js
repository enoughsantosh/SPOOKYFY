const cacheList = document.getElementById("cacheList");
const clearAllButton = document.getElementById("clearAll");

// Function to list all cached items
async function loadCachedData() {
    cacheList.innerHTML = ""; // Clear previous list

    const cacheNames = await caches.keys(); // Get all cache storage names

    if (cacheNames.length === 0) {
        cacheList.innerHTML = "<p>No cached data available.</p>";
        return;
    }

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const cachedRequests = await cache.keys();

        if (cachedRequests.length === 0) continue; // Skip empty caches

        // Show cache name as a heading
        const cacheTitle = document.createElement("h3");
        cacheTitle.textContent = `Cache: ${cacheName}`;
        cacheList.appendChild(cacheTitle);

        cachedRequests.forEach(async (request) => {
            const listItem = document.createElement("li");

            // Extract filename from URL (remove query params)
            let fileName = request.url.split("/").pop().split("?")[0] || request.url;

            listItem.textContent = decodeURIComponent(fileName); // Show file name

            // Create "Remove" button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Remove";
            deleteButton.onclick = async () => {
                await cache.delete(request);
                loadCachedData(); // Refresh list
            };

            listItem.appendChild(deleteButton);
            cacheList.appendChild(listItem);
        });
    }
}

// Function to clear all cached data
async function clearAllCachedData() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    loadCachedData(); // Refresh list
}

// Load cached data on page load
loadCachedData();

// Attach event listener to "Clear All" button
clearAllButton.addEventListener("click", clearAllCachedData);
