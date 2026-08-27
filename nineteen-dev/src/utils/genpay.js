// ponytail: mock genpay API since no real public API docs found on the site
export const createPayment = async (payload) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const orderId = `GEN-${Date.now()}`;
            resolve({
                order_id: orderId,
                payment_url: `https://genpayapp.com/pay/${orderId}`,
                amount: payload.amount,
                payment_method: payload.payment_method
            });
        }, 1000);
    });
};
