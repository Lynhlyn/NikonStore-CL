export interface Feature {
  id: number
  name: string
  featureGroup: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface FeatureListResponse {
  status: number
  message: string
  data: Feature[]
}

