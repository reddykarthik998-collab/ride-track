// API service for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const authState = localStorage.getItem('ridetrack_auth');
    if (authState) {
      try {
        const parsed = JSON.parse(authState);
        if (parsed.token) {
          return {
            'Authorization': `Bearer ${parsed.token}`
          };
        }
      } catch (error) {
        console.error('Failed to parse auth state:', error);
      }
    }
    return {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    // Handle 204 No Content responses (common for DELETE operations)
    if (response.status === 204) {
      return {} as T;
    }

    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    // Return empty object for non-JSON responses
    return {} as T;
  }

  // Trips API
  async getTrips() {
    return this.request('/trips');
  }

  async getTripByNumber(tripNumber: string) {
    return this.request(`/trips/trip-number/${tripNumber}`);
  }

  async createTrip(trip: any) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(trip),
    });
  }

  async updateTrip(id: string, trip: any) {
    return this.request(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trip),
    });
  }

  async deleteTrip(id: string) {
    return this.request(`/trips/${id}`, {
      method: 'DELETE',
    });
  }

  // Drivers API
  async getDrivers() {
    return this.request('/drivers');
  }

  async getDriverByPhone(phone: string) {
    return this.request(`/drivers/phone/${phone}`);
  }

  async createDriver(driver: any) {
    return this.request('/drivers', {
      method: 'POST',
      body: JSON.stringify(driver),
    });
  }

  async updateDriver(id: string, driver: any) {
    return this.request(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driver),
    });
  }

  async deleteDriver(id: string) {
    return this.request(`/drivers/${id}`, {
      method: 'DELETE',
    });
  }

  // Clients API
  async getClients() {
    return this.request('/clients');
  }

  async createClient(client: any) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  async updateClient(id: string, client: any) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  }

  async deleteClient(id: string) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Customers API
  async getCustomers() {
    return this.request('/customers');
  }

  async createCustomer(customer: any) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(id: string, customer: any) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  }

  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Fares API
  async getFares() {
    return this.request('/fares');
  }

  async createFare(fare: any) {
    return this.request('/fares', {
      method: 'POST',
      body: JSON.stringify(fare),
    });
  }

  async updateFare(id: string, fare: any) {
    return this.request(`/fares/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fare),
    });
  }

  async deleteFare(id: string) {
    return this.request(`/fares/${id}`, {
      method: 'DELETE',
    });
  }

  // Events API
  async getEvents() {
    return this.request('/events');
  }

  async createEvent(event: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(id: string, event: any) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
