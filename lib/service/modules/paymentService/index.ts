export async function handlePaymentFailed(trackingNumber: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payment/failed?trackingNumber=${trackingNumber}`,
      {
        method: 'POST',
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error handling payment failed:', error);
    return null;
  }
}

export async function retryVnpayPayment(
  trackingNumber: string,
  frontendOrigin?: string
): Promise<string | null> {
  try {
    const origin = frontendOrigin || (typeof window !== 'undefined' ? window.location.origin : '');
    const url = `${process.env.NEXT_PUBLIC_API_URL}/payment/retry?trackingNumber=${trackingNumber}${origin ? `&frontendOrigin=${encodeURIComponent(origin)}` : ''}`;
    
    const response = await fetch(url, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }
    
    const paymentUrl = await response.text();
    if (paymentUrl && paymentUrl.startsWith('http')) {
      return paymentUrl;
    }
    
    throw new Error('Invalid payment URL received');
  } catch (error) {
    console.error('Error retrying VNPay payment:', error);
    return null;
  }
}

