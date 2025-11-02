export interface Customer {
    id: number
    username: string
    email: string
    fullName: string
    phoneNumber: string
    urlImage: string
    dateOfBirth: string
    gender: string
    isGuest: boolean
    status: string
    provider: string
    providerId: string
    createdAt: string
    updatedAt: string
}

export interface ResponseEntity<T> {
    status: number
    message: string
    data: T
}

export interface CustomerUpdate {
    username: string
    email: string
    fullName: string
    phoneNumber: string
    urlImage?: string
    dateOfBirth: string
    gender: string
}

export interface ResponseStatus {
    status: number
    message: string
    data?: any
}

