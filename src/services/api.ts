const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export type OfferType = 'service' | 'objet' | 'nourriture';

export interface Offer {
  id: number;
  title: string;
  description: string;
  type: OfferType;
  author: string;
  contact: string;
  userId: number;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
  validated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferDto {
  title: string;
  description: string;
  type: OfferType;
  author: string;
  contact: string;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
}

export interface UpdateOfferDto {
  title?: string;
  description?: string;
  type?: OfferType;
  author?: string;
  contact?: string;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
}

export interface SearchOptions {
  type?: OfferType;
  search?: string;
  sortBy?: 'date' | 'title' | 'author';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
  prioritizeByLocation?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { authService } from './auth';

class ApiService {
  private baseUrl: string;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 seconde

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const token = authService.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: { message: 'Unknown error', code: 'UNKNOWN_ERROR' }
        }));
        
        // Ne pas retry pour les erreurs 4xx (erreurs client)
        if (response.status >= 400 && response.status < 500) {
          const errorMessage = errorData.error?.message || errorData.error || `HTTP error! status: ${response.status}`;
          const errorCode = errorData.error?.code || 'CLIENT_ERROR';
          const error = new Error(errorMessage) as any;
          error.statusCode = response.status;
          error.code = errorCode;
          throw error;
        }

        // Retry pour les erreurs 5xx (erreurs serveur)
        if (response.status >= 500 && retryCount < this.maxRetries) {
          await this.sleep(this.retryDelay * (retryCount + 1));
          return this.request<T>(endpoint, options, retryCount + 1);
        }

        const errorMessage = errorData.error?.message || errorData.error || `HTTP error! status: ${response.status}`;
        const errorCode = errorData.error?.code || 'SERVER_ERROR';
        const error = new Error(errorMessage) as any;
        error.statusCode = response.status;
        error.code = errorCode;
        throw error;
      }

      // Pour les réponses 204 (No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      // Retry pour les erreurs réseau
      if (error instanceof TypeError && error.message.includes('fetch') && retryCount < this.maxRetries) {
        await this.sleep(this.retryDelay * (retryCount + 1));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      console.error('API request failed:', error);
      throw error;
    }
  }

  async getAllOffers(options: SearchOptions = {}): Promise<PaginatedResult<Offer>> {
    const params = new URLSearchParams();
    
    if (options.type) params.append('type', options.type);
    if (options.search) params.append('search', options.search);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    // Paramètres de géolocalisation
    if (options.country) params.append('country', options.country);
    if (options.region) params.append('region', options.region);
    if (options.city) params.append('city', options.city);
    if (options.postalCode) params.append('postalCode', options.postalCode);
    if (options.prioritizeByLocation) params.append('prioritizeByLocation', 'true');

    const endpoint = `/offers${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<PaginatedResult<Offer>>(endpoint);
  }

  async getOfferById(id: number): Promise<Offer> {
    return this.request<Offer>(`/offers/${id}`);
  }

  async createOffer(offer: CreateOfferDto): Promise<Offer> {
    return this.request<Offer>('/offers', {
      method: 'POST',
      body: JSON.stringify(offer),
    });
  }

  async updateOffer(id: number, offer: UpdateOfferDto): Promise<Offer> {
    return this.request<Offer>(`/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(offer),
    });
  }

  async deleteOffer(id: number): Promise<void> {
    return this.request<void>(`/offers/${id}`, {
      method: 'DELETE',
    });
  }

  async validateOffer(id: number): Promise<Offer> {
    return this.request<Offer>(`/offers/${id}/validate`, {
      method: 'PATCH',
    });
  }

  // User profile methods
  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/users/profile');
  }

  async updateProfile(profile: UpdateProfileDto): Promise<{ id: number; email: string; username: string }> {
    return this.request<{ id: number; email: string; username: string }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async getUserOffers(): Promise<Offer[]> {
    return this.request<Offer[]>('/users/offers');
  }
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  createdAt: string;
  offersCount: number;
  offers: Offer[];
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
}

export interface UpdateProfileDto {
  username?: string;
  email?: string;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
}

export const apiService = new ApiService();

