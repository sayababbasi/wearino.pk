
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseURL = 'http://localhost:5001/api';
const baseUrlOrigin = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL;
const origin = baseUrlOrigin.endsWith('/') ? baseUrlOrigin : `${baseUrlOrigin}/`;

function getImageUrl(p) {
    if (!p) return 'placeholder';
    const cleanPath = p.startsWith('/') ? p.slice(1) : p;
    return `${origin}${cleanPath.replace(/\\/g, '/')}`;
}

console.log('Database Path:', 'uploads/image-123.jpg');
console.log('Resulting URL:', getImageUrl('uploads/image-123.jpg'));
console.log('Expected URL for Express:', 'http://localhost:5001/uploads/image-123.jpg');
