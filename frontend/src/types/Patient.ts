// Patient types for the GhEHR system
export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  address: {
    region: string;
    district: string;
    town: string;
    area?: string;
  };
  bloodGroup?: string;
  insurance: {
    hasNHIS: boolean;
    nhisStatus?: 'active' | 'expired' | 'pending';
  };
  status: 'active' | 'inactive' | 'deceased';
  createdAt: string;
}

export interface PatientSelectionItem {
  id: string;
  patientId: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
}

export interface PatientsResponse {
  patients: Patient[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPatients: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
