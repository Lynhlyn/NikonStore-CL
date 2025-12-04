'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/src/components/ui/dialog';
import { Button } from '@/core/shadcn/components/ui/button';
import { Loader2, Mail, AlertCircle } from 'lucide-react';
import { useEmailVerification } from '../../hooks/useEmailVerification';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  customerName: string;
  onClose: () => void;
  onVerificationSuccess: () => void;
}

const COUNTDOWN_DURATION = 60;
const VERIFICATION_CODE_LENGTH = 6;

export default function EmailVerificationModal({
  isOpen,
  email,
  customerName,
  onClose,
  onVerificationSuccess,
}: EmailVerificationModalProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { verifyEmail, sendVerificationEmail, isLoading, error, clearError } =
    useEmailVerification();

  const canResend = countdown === 0;
  const isCodeValid = verificationCode.length === VERIFICATION_CODE_LENGTH;

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (isOpen) {
      setVerificationCode('');
      setCountdown(COUNTDOWN_DURATION);
      clearError();
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setAttribute('readonly', 'readonly');
          setTimeout(() => {
            inputRef.current?.removeAttribute('readonly');
          }, 100);
        }
      }, 150);
    }
  }, [isOpen, clearError]);

  const handleVerifyCode = useCallback(async () => {
    if (!isCodeValid) return;

    try {
      const result = await verifyEmail({
        token: verificationCode.trim(),
        email,
      });

      if (result?.success) {
        onVerificationSuccess();
        onClose();
      }
    } catch (err) {
      // Error handled by hook
    }
  }, [verificationCode, email, verifyEmail, onVerificationSuccess, onClose, isCodeValid]);

  const handleResendCode = useCallback(async () => {
    try {
      await sendVerificationEmail({
        email,
        customerName,
      });

      setCountdown(COUNTDOWN_DURATION);
      setVerificationCode('');
      clearError();
    } catch (err) {
      console.error('Resend failed:', err);
    }
  }, [email, customerName, sendVerificationEmail, clearError]);

  const handleInputChange = useCallback(
    (value: string) => {
      const numericValue = value.replace(/\D/g, '').slice(0, VERIFICATION_CODE_LENGTH);
      setVerificationCode(numericValue);
      if (error) clearError();
    },
    [error, clearError]
  );

  const handleInputFocus = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && isCodeValid && !isLoading) {
        handleVerifyCode();
      }
    },
    [isCodeValid, isLoading, handleVerifyCode]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-4 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-center px-2 sm:px-4">
          <div className="mx-auto mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Xác thực email
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm leading-relaxed px-2">
            Mã xác thực đã được gửi đến email
            <br />
            <span className="font-medium text-gray-900 break-all text-xs sm:text-sm">
              {email}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 px-4 sm:px-6">
          <div className="space-y-3">
            <label
              htmlFor="verification-code"
              className="block text-sm sm:text-base font-medium text-gray-700 text-center"
            >
              Nhập mã xác thực (6 số)
            </label>
            <input
              ref={inputRef}
              id="verification-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyPress}
              className="w-full text-center text-xl sm:text-2xl font-mono tracking-[0.3em] sm:tracking-widest h-14 sm:h-16 border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg font-bold px-4"
              maxLength={6}
              disabled={isLoading}
              autoComplete="one-time-code"
              style={{ fontSize: '20px' }}
            />
            <div className="text-center">
              <span className="text-xs sm:text-sm text-gray-500 font-medium">
                {verificationCode.length}/{VERIFICATION_CODE_LENGTH} số đã nhập
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm sm:text-base text-red-700 leading-relaxed">{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:gap-6">
            <Button
              onClick={handleVerifyCode}
              disabled={isLoading || !isCodeValid}
              className="w-full h-14 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 text-white font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl disabled:shadow-none active:scale-[0.98] sm:hover:scale-[1.02] disabled:scale-100 transition-all duration-200 ease-in-out rounded-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin mr-3" />
                  <span className="text-lg sm:text-xl font-bold">Đang xác thực...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-lg sm:text-xl tracking-wide font-bold">XÁC THỰC</span>
                </div>
              )}
            </Button>

            <div className="text-center space-y-3 pb-4 sm:pb-2">
              <div className="text-sm sm:text-base text-gray-600 font-medium">
                Không nhận được mã?
              </div>
              {canResend ? (
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="h-10 sm:h-12 px-6 sm:px-8 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold text-sm sm:text-base rounded-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Gửi lại mã
                    </>
                  )}
                </Button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm sm:text-base font-medium">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  Gửi lại sau {countdown}s
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="h-4 sm:h-2 flex-shrink-0"></div>
      </DialogContent>
    </Dialog>
  );
}

