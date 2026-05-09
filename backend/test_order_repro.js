
// using native fetch

const testOrder = async () => {
    try {
        const response = await fetch('http://127.0.0.1:5001/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: [
                    { productId: 14, quantity: 1, price: 10 } // Assuming product 14 exists from previous logs
                ],
                shippingAddress: {
                    name: "Test User",
                    street: "123 Test St",
                    city: "Test City",
                    state: "TS",
                    zipCode: "12345",
                    country: "Test Country",
                    email: "test@example.com",
                    phone: "1234567890"
                },
                paymentMethod: "cod"
            }),
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
};

testOrder();
