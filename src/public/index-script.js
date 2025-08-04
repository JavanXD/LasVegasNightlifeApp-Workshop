        // Guest submission (Persistent XSS)
        document.getElementById('orderForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const order = document.getElementById('order').value;

            try {
                const response = await fetch('/api/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, order }),
                });

                const data = await response.json();
                alert(data.message);
                fetchOrders(); // Update guest list
            } catch (err) {
                alert('Reservation failed: ' + err.message);
            }
        });

        // Fetch and display guest list
        async function fetchOrders() {
            const ordersList = document.getElementById('ordersList');
            ordersList.innerHTML = '';
            const response = await fetch('/api/orders');
            const orders = await response.json();

            orders.forEach(order => {
                // Persistent XSS vulnerability: unsanitised data rendered with innerHTML
                ordersList.innerHTML += `<li class="list-group-item">${order.name} reserved for ${order.order}</li>`;
            });
        }

        // Search guests (DOM-based XSS)
        document.getElementById('searchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const searchQuery = document.getElementById('search').value;
            const searchResults = document.getElementById('searchResults');

            // DOM-based XSS: unsanitised input rendered with innerHTML
            searchResults.innerHTML = `<p>Search results for: <b>${searchQuery}</b></p>`;
        });

        // Clear all guests
        document.getElementById('clearOrdersButton').addEventListener('click', async () => {
            try {
                const response = await fetch('/api/clear-orders');
                const data = await response.json();
                alert(data.message); // Show success message
                fetchOrders(); // Refresh the guest list
            } catch (err) {
                alert('Failed to clear guest list: ' + err.message);
            }
        });

        // Fetch guest list on page load
        fetchOrders();
