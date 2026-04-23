// Proxy path: Vite proxy (dev) & Vercel rewrite (prod) → https://app.pakasir.com/api
const BASE_URL = '/pakasir';

// You will need to set these in your .env
const PAKASIR_API_KEY = import.meta.env.VITE_PAKASIR_API_KEY || '';
const PAKASIR_PROJECT = import.meta.env.VITE_PAKASIR_PROJECT_SLUG || '';

const getHeaders = () => ({
    'Content-Type': 'application/json',
});

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) {
        console.error('[pakasir] API error:', res.status, data);
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
    }
    return data;
};

/**
 * Membuat transaksi baru
 * docs: POST /api/transactioncreate/{method}
 */
export const createTransaction = (method, payload) => {
    const finalPayload = {
        project: PAKASIR_PROJECT,
        api_key: PAKASIR_API_KEY,
        ...payload
    };
    return fetch(`${BASE_URL}/transactioncreate/${encodeURIComponent(method)}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(finalPayload),
    }).then(handleResponse);
};

/**
 * Simulasi pembayaran
 * docs: POST /api/paymentsimulation
 */
export const paymentSimulation = (payload) => {
    const finalPayload = {
        project: PAKASIR_PROJECT,
        api_key: PAKASIR_API_KEY,
        ...payload
    };
    return fetch(`${BASE_URL}/paymentsimulation`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(finalPayload),
    }).then(handleResponse);
};

/**
 * Membatalkan transaksi
 * docs: POST /api/transactioncancel
 */
export const cancelTransaction = (payload) => {
    const finalPayload = {
        project: PAKASIR_PROJECT,
        api_key: PAKASIR_API_KEY,
        ...payload
    };
    return fetch(`${BASE_URL}/transactioncancel`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(finalPayload),
    }).then(handleResponse);
};

/**
 * Cek status transaksi
 * docs: GET /api/transactiondetail?project={slug}&amount={amount}&order_id={order_id}&api_key={api_key}
 */
export const checkTransaction = (orderId, amount) => {
    const qs = new URLSearchParams({
        project: PAKASIR_PROJECT,
        amount: amount,
        order_id: orderId,
        api_key: PAKASIR_API_KEY
    }).toString();

    return fetch(`${BASE_URL}/transactiondetail?${qs}`, {
        method: 'GET',
        headers: getHeaders(),
    }).then(handleResponse);
};
