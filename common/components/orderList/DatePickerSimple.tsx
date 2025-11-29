import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale";

interface DatePickerSimpleProps {
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
}

export default function DatePickerSimple({ value, onChange }: DatePickerSimpleProps) {
  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      placeholderText="Chọn ngày"
      className="w-full sm:w-[220px] h-12 rounded-lg border border-gray-300 px-4 font-medium text-base shadow-sm"
      popperPlacement="bottom"
      isClearable
      showPopperArrow={false}
      locale={vi as any}
    />
  );
}

