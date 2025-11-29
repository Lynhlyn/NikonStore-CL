import { toast } from "sonner";

export function useRetryVnpayPayment() {
    const retryVnpayPayment = async (trackingNumber: string) => {
        try{
            const origin = window.location.origin;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/retry?trackingNumber=${trackingNumber}&frontendOrigin=${encodeURIComponent(origin)}`, {
                method: "POST",
              });
              if(!res.ok){
                const errorText = await res.text();
                toast.error(errorText || "không thể lấy link thanh toán")
                return;
        }
        const paymentUrl = await res.text();
        if(paymentUrl && paymentUrl.startsWith("http")){
            window.location.href = paymentUrl;
        }else{
            toast.error("không lấy được link thanh toán hợp lệ")
        }
    }catch(err){
        toast.error("có lỗi khi lấy link thanh toán")
    }
};
return {retryVnpayPayment};
}

