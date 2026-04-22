// Proxy path: Vite proxy (dev) & Vercel rewrite (prod) → https://www.bayar.gg/api
const BASE_URL = '/bayargg';
const API_KEY = import.meta.env.VITE_BAYARGG_API_KEY;


const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
});

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok || data.success === false) {
        console.error('[bayargg] API error:', res.status, data);
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
    }
    return data;
};

/** Membuat pembayaran baru */
export const createPayment = (payload) =>
    fetch(`${BASE_URL}/create-payment.php`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    }).then(handleResponse);

/** Cek status pembayaran by invoice ID */
export const checkPayment = (invoiceId) =>
    fetch(`${BASE_URL}/check-payment.php?invoice=${encodeURIComponent(invoiceId)}`, {
        headers: getHeaders(),
    }).then(handleResponse);

/** Daftar pembayaran dengan filter & pagination */
export const listPayments = (params = {}) => {
    const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))
    ).toString();
    return fetch(`${BASE_URL}/list-payments.php${qs ? `?${qs}` : ''}`, {
        headers: getHeaders(),
    }).then(handleResponse);
};

/** Daftar metode pembayaran & status subscription */
export const getPaymentMethods = () =>
    fetch(`${BASE_URL}/get-payment-methods.php`, {
        headers: getHeaders(),
    }).then(handleResponse);
