import { useState, useCallback } from 'react';
import {
  useSendOrderVerificationEmailMutation,
  useVerifyOrderEmailMutation,
} from '@/lib/service/modules/orderService';

export interface SendVerificationEmailRequest {
  email: string;
  customerName: string;
}

export interface VerifyEmailRequest {
  token: string;
  email: string;
}

export interface VerificationResult {
  success: boolean;
  error?: string;
}

export function useEmailVerification() {
  const [error, setError] = useState<string | null>(null);
  const [sendVerificationEmailMutation, { isLoading: isSending }] =
    useSendOrderVerificationEmailMutation();
  const [verifyEmailMutation, { isLoading: isVerifying }] = useVerifyOrderEmailMutation();

  const sendVerificationEmail = useCallback(
    async (data: SendVerificationEmailRequest): Promise<void> => {
      setError(null);
      try {
        await sendVerificationEmailMutation(data).unwrap();
      } catch (err: any) {
        const errorMessage =
          err?.data?.error || err?.data?.message || 'Có lỗi xảy ra khi gửi email xác thực';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [sendVerificationEmailMutation]
  );

  const verifyEmail = useCallback(
    async (data: VerifyEmailRequest): Promise<VerificationResult> => {
      setError(null);
      try {
        const result = await verifyEmailMutation(data).unwrap();
        if (!result.success) {
          setError(result.error || 'Mã xác thực không đúng hoặc đã hết hạn');
        }
        return result;
      } catch (err: any) {
        const errorMessage =
          err?.data?.error || err?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [verifyEmailMutation]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    sendVerificationEmail,
    verifyEmail,
    isLoading: isSending || isVerifying,
    error,
    clearError,
  };
}

