// Patient data model for GhEHR system
export interface Patient {
  id: string; // Unique patient identifier
  patientId: string; // Human-readable patient ID (e.g., GH-2025-001234)
  
  // Personal Demographics
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string; // ISO date string
  gender: 'male' | 'female' | 'other';
  nationality: string; // Default: Ghana
  
  // Ghana-specific Identifiers
  ghanaCardNumber?: string; // National ID
  votersId?: string;
  nhisNumber?: string; // National Health Insurance Scheme
  
  // Contact Information
  phoneNumber: string; // Primary phone (mobile money linked)
  alternativePhone?: string;
  email?: string;
  
  // Address (Ghana-specific structure)
  address: {
    region: string; // 16 regions of Ghana
    district: string;
    town: string;
    area?: string; // Specific area/neighborhood
    houseNumber?: string;
    landmark?: string;
    digitalAddress?: string; // Ghana Post GPS address
  };
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  
  // Medical Information
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  
  // Insurance Information
  insurance: {
    hasNHIS: boolean;
    nhisStatus?: 'active' | 'expired' | 'pending';
    privateInsurance?: {
      provider: string;
      policyNumber: string;
      expiryDate: string;
    };
  };
  
  // System Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID who registered the patient
  facilityId: string; // Healthcare facility where registered
  status: 'active' | 'inactive' | 'deceased';
  
  // Language Preferences (Ghana-specific)
  preferredLanguage: 'english' | 'twi' | 'ga' | 'ewe' | 'fante' | 'hausa' | 'dagbani' | 'other';
  interpreterNeeded: boolean;
}

// Patient search and filtering criteria
export interface PatientSearchCriteria {
  query?: string; // General search term
  patientId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  ghanaCardNumber?: string;
  nhisNumber?: string;
  region?: string;
  district?: string;
  gender?: string;
  ageRange?: {
    min: number;
    max: number;
  };
  bloodGroup?: string;
  facilityId?: string;
  status?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  page?: number;
  limit?: number;
  sortBy?: 'firstName' | 'lastName' | 'createdAt' | 'patientId';
  sortOrder?: 'asc' | 'desc';
}

// Patient registration request
export interface PatientRegistrationRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  address: Patient['address'];
  emergencyContact: Patient['emergencyContact'];
  nationality?: string;
  ghanaCardNumber?: string;
  nhisNumber?: string;
  preferredLanguage?: Patient['preferredLanguage'];
}

// Ghana regions for validation
export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Central',
  'Eastern',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Brong-Ahafo',
  'Western North',
  'Savannah',
  'North East',
  'Bono',
  'Bono East',
  'Oti'
] as const;

export type GhanaRegion = typeof GHANA_REGIONS[number];
