import { toast } from "sonner";
import { retryVnpayPayment as retryVnpayPaymentApi } from "@/lib/service/modules/paymentService";

export function useRetryVnpayPayment() {
    const retryVnpayPayment = async (trackingNumber: string) => {
        try {
            const paymentUrl = await retryVnpayPaymentApi(trackingNumber);
            
            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                toast.error("không lấy được link thanh toán hợp lệ");
            }
        } catch (err) {
            toast.error("có lỗi khi lấy link thanh toán");
        }
    };
    
    return { retryVnpayPayment };
}

