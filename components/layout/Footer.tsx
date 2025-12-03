"use client";

import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import { useGetAllPagesQuery } from "@/lib/service/modules/pageService";

export function Footer() {
  const { data: pages = [], isError } = useGetAllPagesQuery();

  const pageSlugs = new Set((pages || []).map((page) => page.slug));

  const hasPage = (slug: string) => !isError && pageSlugs.has(slug);

  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-12">
        <div className="bg-gradient-to-r from-[#CC0000] to-[#FF3333] rounded-xl p-6 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Đăng ký nhận thông tin khuyến mãi
          </h2>
          <p className="text-sm md:text-base mb-6 opacity-90">
            Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg bg-white/95 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-3 bg-white text-[#CC0000] font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Đăng ký
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-2xl font-bold text-[#FF6B00] mb-4">
              NIKON STORE
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Đại lý chính thức của Nikon tại Việt Nam - Chúng tôi cam kết cung
              cấp máy ảnh, ống kính và phụ kiện chính hãng với chất lượng cao
              nhất và dịch vụ bảo hành uy tín.
            </p>
            <div className="flex flex-col space-y-3 mt-6">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Phone className="h-5 w-5 text-[#FF6B00]" />
                <span>Hotline: 1900 1234</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Mail className="h-5 w-5 text-[#FF6B00]" />
                <span>info@nikonstore.vn</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <MapPin className="h-5 w-5 text-[#FF6B00]" />
                <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#FF6B00] transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#FF6B00] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#FF6B00] transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-base font-bold uppercase text-[#FF6B00]">
              HỖ TRỢ
            </h3>
            <div className="space-y-2">
              <Link
                href="/order/track"
                className="block text-sm text-gray-400 hover:text-[#FF6B00] transition-colors"
              >
                Tra cứu đơn hàng
              </Link>
              <Link
                href="/faqs"
                className="block text-sm text-gray-400 hover:text-[#FF6B00] transition-colors"
              >
                Câu hỏi thường gặp
              </Link>
              {hasPage("privacy-policy") && (
                <Link
                  href="/pages/privacy-policy"
                  className="block text-sm text-gray-400 hover:text-[#FF6B00] transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              )}
              {hasPage("terms-of-service") && (
                <Link
                  href="/pages/terms-of-service"
                  className="block text-sm text-gray-400 hover:text-[#FF6B00] transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
              )}
            </div>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-base font-bold uppercase text-[#FF6B00]">
              VỀ CHÚNG TÔI
            </h3>
            <div className="space-y-2">
              {hasPage("about-us") && (
                <Link
                  href="/pages/about-us"
                  className="block text-sm text-gray-400 hover:text-[#FF6B00] transition-colors"
                >
                  Giới thiệu
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-6 justify-center md:justify-start">
            {hasPage("privacy-policy") && (
              <Link
                href="/pages/privacy-policy"
                className="text-xs text-gray-500 hover:text-[#FF6B00] transition-colors"
              >
                Chính sách bảo mật
              </Link>
            )}
            {hasPage("terms-of-service") && (
              <Link
                href="/pages/terms-of-service"
                className="text-xs text-gray-500 hover:text-[#FF6B00] transition-colors"
              >
                Điều khoản sử dụng
              </Link>
            )}
            {hasPage("about-us") && (
              <Link
                href="/pages/about-us"
                className="text-xs text-gray-500 hover:text-[#FF6B00] transition-colors"
              >
                Giới thiệu
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
