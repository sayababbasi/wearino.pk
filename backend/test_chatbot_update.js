const fetch = require('node-fetch');

async function testChat(message, userId = "test_user") {
    try {
        const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, user_id: userId })
        });
        const data = await response.json();
        console.log(`User: "${message}"`);
        console.log(`Bot: "${data.text}"`);
        console.log(`Navigation: ${data.navigate_to}`);
        console.log('---');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function runTests() {
    console.log("=== Testing FASHION Chatbot Logic ===\n");

    // Test 1: Place Order
    await testChat("I want to buy this shirt");

    // Test 2: Order Status (No ID)
    await testChat("Where is my order?", "user_status_check");

    // Test 3: Order Status (Provide ID in follow-up)
    // Note: The memory logic in chatbot_logic.py should handle this if implemented, 
    // but our current implementation mostly checks single turns or simple memory.
    // Let's test the direct query first.
    await testChat("Status of #ORD-12345");

    // Test 4: Invalid ID
    await testChat("Status of 12");
}

runTests();
