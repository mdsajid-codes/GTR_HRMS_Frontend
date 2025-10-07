const API_URL = import.meta.env.VITE_API_BASE_URL;

export const formatPrice = (cents) => `AED ${(cents / 100).toFixed(2)}`;

export const constructImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('data:') || relativeUrl.startsWith('http')) {
        return relativeUrl;
    }
    // Assuming URL is like /uploads/{tenantId}/{subfolder}/{filename}
    // And we need to convert it to /api/files/view/{tenantId}/{subfolder}/{filename}
    const pathParts = relativeUrl.split('/').filter(p => p);
    if (pathParts[0] === 'uploads' && pathParts.length >= 4) {
        return `${API_URL}/pos/uploads/view/${pathParts.slice(1).join('/')}`;
    }
    return `${API_URL}${relativeUrl}`;
};

export const formatVariantAttributes = (attributes) => {
    if (!attributes || Object.keys(attributes).length === 0) return null;
    return Object.entries(attributes).map(([key, value]) => value).join(', ');
};