import * as yup from 'yup';

export const checkoutSchema = yup.object().shape({
  recipientName: yup
    .string()
    .required('Tên người nhận không được để trống')
    .min(2, 'Tên người nhận phải có từ 2-100 ký tự')
    .max(100, 'Tên người nhận phải có từ 2-100 ký tự')
    .trim(),
  recipientPhone: yup
    .string()
    .required('Số điện thoại người nhận không được để trống')
    .matches(/^0[0-9]{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0')
    .trim(),
  recipientEmail: yup
    .string()
    .required('Email người nhận không được để trống')
    .email('Email không hợp lệ')
    .trim(),
  provinceId: yup
    .number()
    .required('Vui lòng chọn tỉnh/thành phố')
    .nullable(),
  districtId: yup
    .number()
    .required('Vui lòng chọn quận/huyện')
    .nullable(),
  wardCode: yup
    .string()
    .required('Vui lòng chọn phường/xã')
    .nullable(),
  detailedAddress: yup
    .string()
    .required('Địa chỉ chi tiết không được để trống')
    .min(5, 'Địa chỉ chi tiết phải có từ 5-255 ký tự')
    .max(255, 'Địa chỉ chi tiết phải có từ 5-255 ký tự')
    .trim(),
  notes: yup
    .string()
    .nullable()
    .max(500, 'Ghi chú không được vượt quá 500 ký tự')
    .notRequired(),
  paymentMethod: yup
    .string()
    .required('Phương thức thanh toán không được để trống')
    .oneOf(['cod', 'vnpay'], 'Phương thức thanh toán không hợp lệ'),
});

export interface CheckoutFormData {
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  provinceId: number | null;
  districtId: number | null;
  wardCode: string | null;
  detailedAddress: string;
  notes?: string | null;
  paymentMethod: string;
}

