"use client"

import { ChevronDown, LogOut, Menu, ShoppingCart as ShoppingCartIcon, User, X, Search } from 'lucide-react'
import Loader from "@/components/common/Loader"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useFetchCurrentCustomerQuery } from "@/lib/service/modules/customerService"
import { useFetchAllCategoriesQuery } from "@/lib/service/modules/categoryService"
import { useFetchProductsQuery } from "@/lib/service/modules/productService"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/service/store"
import CartDropdown from "@/common/components/cart/CartDropdown"
import { useAppDispatch } from "@/lib/hooks/redux"
import { setCustomerId } from "@/lib/features/appSlice"
import { persistor } from "@/lib/service/store"

function SearchBar() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const { data: searchResults, isLoading: isSearching } = useFetchProductsQuery(
        {
            keyword: debouncedSearchTerm.trim() || undefined,
            page: 0,
            size: 6,
        },
        {
            skip: !debouncedSearchTerm.trim() || debouncedSearchTerm.trim().length < 2,
        }
    )

    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 300)

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [searchTerm])

    useEffect(() => {
        if (searchResults?.data && searchResults.data.length > 0 && debouncedSearchTerm.trim().length >= 2) {
            setIsDropdownOpen(true)
        } else {
            setIsDropdownOpen(false)
        }
    }, [searchResults, debouncedSearchTerm])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setIsDropdownOpen(false)
        if (searchTerm.trim()) {
            router.push(`/products?keyword=${encodeURIComponent(searchTerm.trim())}`)
        }
    }

    const handleProductClick = (productId: number) => {
        setIsDropdownOpen(false)
        setSearchTerm("")
        router.push(`/products/${productId}`)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "₫"
    }

    const showDropdown = isDropdownOpen && debouncedSearchTerm.trim().length >= 2 && searchResults?.data && searchResults.data.length > 0

    return (
        <div ref={searchRef} className="relative w-full">
            <form onSubmit={handleSearch} className="relative w-full">
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        if (e.target.value.trim().length >= 2) {
                            setIsDropdownOpen(true)
                        }
                    }}
                    onFocus={() => {
                        if (debouncedSearchTerm.trim().length >= 2 && searchResults?.data && searchResults.data.length > 0) {
                            setIsDropdownOpen(true)
                        }
                    }}
                    className="w-full px-4 py-2 pl-10 pr-10 rounded-lg bg-white border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {isSearching ? (
                        <Loader className="w-5 h-5" />
                    ) : (
                        <Search className="w-5 h-5 text-gray-400" />
                    )}
                </div>
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00] hover:text-[#FF8C00] transition-colors"
                >
                    <Search className="w-5 h-5" />
                </button>
            </form>

            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                            Kết quả tìm kiếm ({searchResults?.pagination?.totalElements || 0})
                        </div>
                        <div className="space-y-1">
                            {searchResults.data.map((product) => {
                                const primaryVariant = product.primaryVariant
                                const hasDiscount = primaryVariant.originalPrice > primaryVariant.finalPrice

                                return (
                                    <button
                                        key={product.productId}
                                        onClick={() => handleProductClick(product.productId)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                                    >
                                        <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                            <Image
                                                src={primaryVariant.thumbnailImage || "/placeholder.svg"}
                                                alt={product.productName}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                sizes="64px"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-gray-900 group-hover:text-[#FF6B00] transition-colors line-clamp-1">
                                                {product.productName}
                                            </div>
                                            {product.brand?.name && (
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {product.brand.name}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                {hasDiscount && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {formatPrice(primaryVariant.originalPrice)}
                                                    </span>
                                                )}
                                                <span className="text-sm font-bold text-red-600">
                                                    {formatPrice(primaryVariant.finalPrice)}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                        {searchResults.pagination && searchResults.pagination.totalElements > 6 && (
                            <button
                                onClick={handleSearch}
                                className="w-full mt-2 px-4 py-2 text-sm font-semibold text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white rounded-lg transition-colors border border-[#FF6B00]"
                            >
                                Xem tất cả ({searchResults.pagination.totalElements} sản phẩm)
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

interface NavItem {
    label: string
    href: string
    hasChildren?: boolean
    children?: NavItem[]
}

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const categoryHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const dispatch = useAppDispatch()

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') : null

    const { data: userData } = useFetchCurrentCustomerQuery(undefined, {
        skip: !token,
        refetchOnMountOrArgChange: true
    })

    const cartData = useSelector((state: RootState) => state.cart?.data)
    const cartCount = useMemo(() => {
        return cartData?.items?.length || 0
    }, [cartData?.items?.length])

    const { data: categoriesData } = useFetchAllCategoriesQuery()

    // Build navigation items with dynamic categories
    const navItems: NavItem[] = useMemo(() => {
        const categoryChildren = categoriesData?.data
            ? categoriesData.data.map((category) => ({
                  label: category.name,
                  href: `/products?categoryId=${category.id}`,
              }))
            : []

        return [
            { label: "Trang chủ", href: "/" },
            {
                label: "Sản phẩm",
                href: "/products",
                hasChildren: categoryChildren.length > 0,
                children: categoryChildren,
            },
            { label: "Khuyến mãi", href: "/vouchers" },
            { label: "Blog", href: "/blogs" },
            { label: "Về chúng tôi", href: "/about" },
            { label: "Hỗ trợ", href: "/faqs" },
            ...(!token ? [{ label: "Tra cứu đơn hàng", href: "/order/track" }] : []),
        ]
    }, [categoriesData, token])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                setActiveDropdown(null)
                setIsUserDropdownOpen(false)
                setHoveredCategory(null)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current)
            }
            if (categoryHoverTimeoutRef.current) {
                clearTimeout(categoryHoverTimeoutRef.current)
            }
        }
    }, [])

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const handleMouseEnter = (label: string) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }
        setActiveDropdown(label)
    }

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setActiveDropdown(null)
        }, 200)
    }

    const handleCategoryMouseEnter = (categoryLabel: string) => {
        if (categoryHoverTimeoutRef.current) {
            clearTimeout(categoryHoverTimeoutRef.current)
            categoryHoverTimeoutRef.current = null
        }
        setHoveredCategory(categoryLabel)
    }

    const handleCategoryMouseLeave = () => {
        categoryHoverTimeoutRef.current = setTimeout(() => {
            setHoveredCategory(null)
        }, 150)
    }

    const toggleDropdown = (label: string) => {
        setActiveDropdown(activeDropdown === label ? null : label)
    }

    const handleLogout = async () => {
        const clearAllTokens = () => {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            sessionStorage.removeItem('accessToken')
            sessionStorage.removeItem('refreshToken')
        }

        dispatch(setCustomerId(null))
        clearAllTokens()
        await persistor.purge()
        window.location.href = '/login'
    }

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen)
    }

    // Component để render menu đệ quy cho menu 2 tầng (Desktop)
    const renderDropdownMenu = (items: NavItem[], level: number = 0) => {
        return items.map((item) => (
            <div key={item.label} className="relative">
                {item.hasChildren && item.children && item.children.length > 0 ? (
                    <div
                        className="group"
                        onMouseEnter={() => handleCategoryMouseEnter(item.label)}
                        onMouseLeave={handleCategoryMouseLeave}
                    >
                        <div className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 hover:text-[#FF6B00] transition-colors cursor-pointer">
                            <span>{item.label}</span>
                            <ChevronDown className="h-3 w-3 ml-1" />
                        </div>
                        {hoveredCategory === item.label && (
                            <div className="absolute left-full top-0 w-56 bg-white border rounded shadow-lg z-20 animate-in slide-in-from-left-2 duration-200">
                                {renderDropdownMenu(item.children, level + 1)}
                            </div>
                        )}
                    </div>
                ) : (
                    <Link
                        href={item.href}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 hover:text-[#FF6B00] transition-colors"
                    >
                        {item.label}
                    </Link>
                )}
            </div>
        ))
    }

    // Component để render menu đệ quy cho mobile
    const renderMobileMenu = (items: NavItem[], level: number = 0) => {
        return items.map((item) => (
            <div key={item.label} className={cn("py-1", level > 0 && "ml-6")}>
                {item.hasChildren && item.children && item.children.length > 0 ? (
                    <div>
                        <button
                            className="flex items-center justify-between w-full text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => toggleDropdown(item.label)}
                            aria-expanded={activeDropdown === item.label}
                        >
                            <span className="text-left">{item.label}</span>
                            <ChevronDown
                                className={cn(
                                    "h-4 w-4 transition-transform text-gray-500",
                                    activeDropdown === item.label ? "rotate-180" : "",
                                )}
                            />
                        </button>
                        {activeDropdown === item.label && (
                            <div className="mt-1 space-y-1 bg-gray-50 rounded-lg p-2">
                                {renderMobileMenu(item.children, level + 1)}
                            </div>
                        )}
                    </div>
                ) : (
                    <Link
                        href={item.href}
                        className="block py-2 px-3 text-sm hover:text-[#FF6B00] hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={toggleMenu}
                    >
                        {item.label}
                    </Link>
                )}
            </div>
        ))
    }

    return (
        <header ref={headerRef} className="sticky top-0 z-50 w-full bg-white shadow-md border-b-2 border-[#FF6B00]/20">
            {/* Top Section */}
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C00]">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        {/* Mobile Menu Button */}
                        <button className="lg:hidden flex items-center text-white" onClick={toggleMenu} aria-label="Toggle menu">
                            <Menu className="h-6 w-6" />
                        </button>

                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <div className="text-xl font-bold text-white">
                                    NIKON STORE
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Search */}
                        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
                            <SearchBar />
                        </div>

                        {/* Login and Cart */}
                        <div className="flex items-center space-x-3">
                            {!token ? (
                                <Link href="/login" className="text-sm font-semibold text-white hover:text-gray-100 transition-colors px-3 py-1.5 rounded">
                                    Đăng nhập
                                </Link>
                            ) : (
                                <div className="relative">
                                    <button
                                        onClick={toggleUserDropdown}
                                        className="flex items-center space-x-2 text-sm font-semibold text-white hover:text-gray-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
                                            {userData?.data?.urlImage ? (
                                                <Image
                                                    src={userData.data.urlImage}
                                                    alt={userData.data.fullName || 'User'}
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <span className="hidden md:block">
                                            {userData?.data?.fullName || userData?.data?.username || 'Tài khoản'}
                                        </span>
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                    {isUserDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {userData?.data?.fullName || userData?.data?.username || 'Tài khoản'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {userData?.data?.email}
                                                </p>
                                            </div>
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm hover:bg-gray-100 hover:text-[#FF6B00] transition-colors"
                                                onClick={() => setIsUserDropdownOpen(false)}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-4 w-4" />
                                                    <span>Thông tin cá nhân</span>
                                                </div>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Đăng xuất</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <CartDropdown>
                                <button
                                    className="flex items-center text-white hover:text-gray-100 transition-colors relative"
                                >
                                    <ShoppingCartIcon className="h-6 w-6" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 bg-white text-[#FF6B00] text-xs font-bold rounded-full border-2 border-[#FF6B00] px-1">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </button>
                            </CartDropdown>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="lg:hidden border-b bg-gray-50">
                <div className="container mx-auto px-4 py-2">
                    <SearchBar />
                </div>
            </div>

            {/* Bottom Section - Navigation (Desktop) */}
            <div className="hidden lg:block bg-white">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center justify-center h-14">
                        <div className="flex items-center space-x-8">
                            {navItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="relative"
                                >
                                    {item.hasChildren ? (
                                        <div
                                            className="group"
                                            onMouseEnter={() => handleMouseEnter(item.label)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <Link
                                                href={item.href}
                                                className="flex items-center text-base font-semibold text-gray-700 hover:text-[#FF6B00] transition-colors duration-200"
                                            >
                                                {item.label}
                                                <ChevronDown className={cn(
                                                    "ml-1 h-4 w-4 transition-transform duration-200",
                                                    activeDropdown === item.label ? "rotate-180" : ""
                                                )} />
                                            </Link>
                                            {activeDropdown === item.label && (
                                                <div className="absolute left-0 mt-2 w-56 bg-white border-2 border-[#FF6B00]/20 rounded-lg shadow-xl z-10">
                                                    {renderDropdownMenu(item.children || [])}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="text-base font-semibold text-gray-700 hover:text-[#FF6B00] transition-colors duration-200"
                                        >
                                            {item.label}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </nav>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={cn(
                    "fixed inset-0 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
                    isMenuOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#FF6B00] to-[#FF8C00]">
                    <div className="text-xl font-bold text-white">NIKON STORE</div>
                    <button onClick={toggleMenu} aria-label="Close menu" className="text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto h-full">
                    <div className="flex flex-col space-y-4">
                        {navItems.map((item) => (
                            <div key={item.label} className="py-2">
                                {item.hasChildren ? (
                                    <div>
                                        <button
                                            className="flex items-center justify-between w-full text-base font-semibold text-gray-800"
                                            onClick={() => toggleDropdown(item.label)}
                                            aria-expanded={activeDropdown === item.label}
                                        >
                                            {item.label}
                                            <ChevronDown
                                                className={cn(
                                                    "h-4 w-4 transition-transform",
                                                    activeDropdown === item.label ? "rotate-180" : "",
                                                )}
                                            />
                                        </button>
                                        {activeDropdown === item.label && (
                                            <div className="mt-2 space-y-2">
                                                {renderMobileMenu(item.children || [])}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="block text-base font-semibold text-gray-800 hover:text-[#FF6B00] transition-colors"
                                        onClick={toggleMenu}
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </div>
                        ))}
                        <div className="pt-4 mt-4 border-t">
                            {token ? (
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {userData?.data?.urlImage ? (
                                                <Image
                                                    src={userData.data.urlImage}
                                                    alt={userData.data.fullName || 'User'}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-6 w-6 text-gray-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {userData?.data?.fullName || userData?.data?.username || 'Tài khoản'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {userData?.data?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="flex items-center space-x-2 py-2 text-base font-semibold hover:text-[#FF6B00]"
                                        onClick={toggleMenu}
                                    >
                                        <User className="h-5 w-5" />
                                        <span>Thông tin cá nhân</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            toggleMenu()
                                        }}
                                        className="flex items-center space-x-2 py-2 text-base font-semibold text-red-600 hover:text-red-700"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="block py-2 text-base font-semibold hover:text-[#FF6B00]"
                                    onClick={toggleMenu}
                                >
                                    Đăng nhập
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

