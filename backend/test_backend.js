
import fetch from 'node-fetch';

const testBackend = async () => {
    try {
        const response = await fetch('http://localhost:5001/api/analytics/counts');
        if (response.ok) {
            const data = await response.json();
            console.log('Backend is reachable. Response:', data);
        } else {
            console.log('Backend reachable but returned error:', response.status);
        }
    } catch (error) {
        console.error('Failed to connect to backend:', error.message);
    }
};

testBackend();
