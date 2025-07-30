import { Patient } from '../types/Patient';
import axios from 'axios';

// API base URL configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Patient Service for centralized patient data management
export class PatientService {
  // Cache for patient data to avoid repeated API calls
  private static patientCache: Map<string, Patient> = new Map();
  private static allPatientsCache: Patient[] | null = null;
  private static cacheTimestamp: number | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Check if cache is still valid
  private static isCacheValid(): boolean {
    return this.cacheTimestamp !== null && 
           Date.now() - this.cacheTimestamp < this.CACHE_DURATION;
  }

  // Create axios instance with authentication
  private static createAuthenticatedRequest(token: string) {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Fetch all patients with optional search and filtering
  static async getAllPatients(token: string, searchTerm?: string, filters?: any): Promise<Patient[]> {
    try {
      // Return cached data if valid and no search/filters
      if (!searchTerm && !filters && this.isCacheValid() && this.allPatientsCache) {
        return this.allPatientsCache;
      }

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters?.region) params.append('region', filters.region);
      if (filters?.status) params.append('status', filters.status);

      const api = this.createAuthenticatedRequest(token);
      const response = await api.get(`/api/patients?${params}`);
      
      const data = response.data;
      const patients = data.data?.patients || [];

      // Update cache if no search/filters
      if (!searchTerm && !filters) {
        this.allPatientsCache = patients;
        this.cacheTimestamp = Date.now();
        
        // Update individual patient cache
        patients.forEach((patient: Patient) => {
          this.patientCache.set(patient.id, patient);
        });
      }

      return patients;
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Don't return fallback data - let the component handle the error
      throw error;
    }
  }

  // Get a specific patient by ID
  static async getPatientById(token: string, patientId: string): Promise<Patient | null> {
    try {
      // Check cache first
      if (this.patientCache.has(patientId)) {
        return this.patientCache.get(patientId)!;
      }

      const api = this.createAuthenticatedRequest(token);
      const response = await api.get(`/api/patients/${patientId}`);
      
      const patient = response.data.data?.patient;
      
      // Cache the patient
      this.patientCache.set(patientId, patient);
      
      return patient;
    } catch (error) {
      console.error('Error fetching patient:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Search patients by name, ID, or phone
  static async searchPatients(token: string, searchTerm: string): Promise<Patient[]> {
    if (!searchTerm.trim()) {
      return this.getAllPatients(token);
    }

    try {
      const api = this.createAuthenticatedRequest(token);
      const response = await api.get(`/api/patients/search?q=${encodeURIComponent(searchTerm)}`);
      
      const data = response.data;
      return data.data?.patients || [];
    } catch (error) {
      console.error('Error searching patients:', error);
      // Fallback to local search in cached data
      return this.searchPatientsLocally(token, searchTerm);
    }
  }

  // Local search fallback
  private static async searchPatientsLocally(token: string, searchTerm: string): Promise<Patient[]> {
    if (!this.allPatientsCache) {
      try {
        await this.getAllPatients(token);
      } catch (error) {
        return [];
      }
    }
    
    if (!this.allPatientsCache) return [];
    
    const term = searchTerm.toLowerCase();
    return this.allPatientsCache.filter(patient => 
      patient.firstName.toLowerCase().includes(term) ||
      patient.lastName.toLowerCase().includes(term) ||
      patient.patientId.toLowerCase().includes(term) ||
      patient.phoneNumber.includes(term)
    );
  }

  // Get patients for dropdown/selection (ID and Name only)
  static async getPatientsForSelection(token: string): Promise<Array<{id: string, patientId: string, name: string, phone: string, age: number, gender: string}>> {
    const patients = await this.getAllPatients(token);
    return patients.map(patient => {
      // Calculate age from date of birth
      const today = new Date();
      const birthDate = new Date(patient.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return {
        id: patient.id,
        patientId: patient.patientId,
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phoneNumber,
        age: age,
        gender: patient.gender
      };
    });
  }

  // Clear cache (useful for data refresh)
  static clearCache(): void {
    this.patientCache.clear();
    this.allPatientsCache = null;
    this.cacheTimestamp = null;
  }
}

export default PatientService;
