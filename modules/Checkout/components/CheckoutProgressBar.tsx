'use client';

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface CheckoutProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const steps = [
  { id: 1, label: 'Xác nhận giỏ hàng', description: 'Kiểm tra sản phẩm' },
  { id: 2, label: 'Thông tin giao hàng', description: 'Địa chỉ & liên hệ' },
  { id: 3, label: 'Xác nhận đặt hàng', description: 'Hoàn tất thanh toán' },
];

export default function CheckoutProgressBar({ 
  currentStep,
  totalSteps = steps.length 
}: CheckoutProgressBarProps) {
  return (
    <div className="w-full py-12">
      <div className="relative">
        {/* <CHANGE> Improved progress bar design with better visual hierarchy */}
        {/* Background line connector */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps container */}
        <div className="flex items-start justify-between gap-2">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isUpcoming = currentStep < step.id;

            return (
              <div
                key={step.id}
                className="flex-1 flex flex-col items-center group"
              >
                {/* Step circle */}
                <div className="relative z-10 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/30 scale-100'
                        : isCurrent
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-4 ring-blue-100 scale-110'
                          : 'bg-white text-gray-400 border-2 border-gray-300 group-hover:border-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <span className="text-base font-bold">{step.id}</span>
                    )}
                  </div>

                  {/* Current step indicator pulse */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-blue-600 animate-pulse opacity-25"></div>
                  )}
                </div>

                {/* Step label and description */}
                <div className="text-center">
                  <h3
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      isCompleted || isCurrent
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p
                    className={`text-xs mt-1 transition-colors duration-300 ${
                      isCompleted || isCurrent
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Step number indicator below */}
                {isCurrent && (
                  <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                    <span className="text-xs font-semibold text-blue-700">
                      Bước {step.id}/{totalSteps}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress percentage info */}
      <div className="mt-8 flex items-center justify-between px-2">
        <div className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">
            {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}%
          </span>
          {' hoàn tất'}
        </div>
        <div className="text-xs text-gray-400">
          {totalSteps - currentStep} {totalSteps - currentStep === 1 ? 'bước' : 'bước'} còn lại
        </div>
      </div>
    </div>
  );
}
