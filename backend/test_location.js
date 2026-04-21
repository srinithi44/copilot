const fetch = require('node-fetch'); // Needs node-fetch installed globally or use http
// Actually, since I removed node-fetch from package.json, I should use built-in fetch if node version is > 18.
// The user has node installed.

async function test() {
    try {
        const url = 'http://localhost:5000/api/location/nearby?lat=12.9716&lng=77.5946';
        console.log('Fetching:', url);
        const res = await fetch(url);
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text.substring(0, 200));
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
