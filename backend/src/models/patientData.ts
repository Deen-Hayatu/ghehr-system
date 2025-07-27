import { Patient } from './Patient';

// Shared in-memory patient data array
export const patients: Patient[] = [
  {
    id: '1',
    patientId: 'GH-2025-001001',
    firstName: 'Kwame',
    lastName: 'Asante',
    middleName: 'Kofi',
    dateOfBirth: '1985-05-15',
    gender: 'male',
    nationality: 'Ghana',
    ghanaCardNumber: 'GHA-123456789-1',
    nhisNumber: 'NHIS-123456789',
    phoneNumber: '+233244123456',
    email: 'deenfortune89@gmail.com',
    address: {
      region: 'Ashanti',
      district: 'Kumasi Metropolitan',
      town: 'Kumasi',
      area: 'Asafo',
      digitalAddress: 'AK-123-4567'
    },
    emergencyContact: {
      name: 'Ama Asante',
      relationship: 'Wife',
      phoneNumber: '+233244654321'
    },
    bloodGroup: 'O+',
    allergies: ['Penicillin'],
    chronicConditions: ['Hypertension'],
    currentMedications: ['Lisinopril 10mg'],
    insurance: {
      hasNHIS: true,
      nhisStatus: 'active'
    },
    createdAt: '2025-01-15T08:30:00Z',
    updatedAt: '2025-06-20T10:45:00Z',
    createdBy: '1',
    facilityId: 'facility_1',
    status: 'active',
    preferredLanguage: 'twi',
    interpreterNeeded: false
  },
  {
    id: '2',
    patientId: 'GH-2025-001002',
    firstName: 'Ama',
    lastName: 'Mensah',
    middleName: 'Akosua',
    dateOfBirth: '1992-08-22',
    gender: 'female',
    nationality: 'Ghana',
    ghanaCardNumber: 'GHA-987654321-2',
    nhisNumber: 'NHIS-987654321',
    phoneNumber: '+233244987654',
    email: 'ama.mensah@email.com',
    address: {
      region: 'Greater Accra',
      district: 'Accra Metropolitan',
      town: 'Accra',
      area: 'Osu',
      digitalAddress: 'GA-456-7890'
    },
    emergencyContact: {
      name: 'Kwame Mensah',
      relationship: 'Husband',
      phoneNumber: '+233244123456'
    },
    bloodGroup: 'A+',
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    insurance: {
      hasNHIS: true,
      nhisStatus: 'active'
    },
    createdAt: new Date().toISOString(), // Today's patient
    updatedAt: new Date().toISOString(),
    createdBy: '1',
    facilityId: 'facility_1',
    status: 'active',
    preferredLanguage: 'english',
    interpreterNeeded: false
  },
  {
    id: '3',
    patientId: 'GH-2025-001003',
    firstName: 'Kofi',
    lastName: 'Owusu',
    dateOfBirth: '1978-12-10',
    gender: 'male',
    nationality: 'Ghana',
    ghanaCardNumber: 'GHA-456789123-3',
    phoneNumber: '+233244555666',
    address: {
      region: 'Western',
      district: 'Sekondi-Takoradi',
      town: 'Takoradi',
      area: 'Market Circle'
    },
    emergencyContact: {
      name: 'Akosua Owusu',
      relationship: 'Sister',
      phoneNumber: '+233244777888'
    },
    bloodGroup: 'B+',
    allergies: ['Latex'],
    chronicConditions: ['Diabetes Type 2'],
    currentMedications: ['Metformin 500mg'],
    insurance: {
      hasNHIS: false,
      nhisStatus: undefined
    },
    createdAt: '2025-07-03T14:20:00Z',
    updatedAt: '2025-07-03T14:20:00Z',
    createdBy: '1',
    facilityId: 'facility_1',
    status: 'active',
    preferredLanguage: 'twi',
    interpreterNeeded: false
  },
  {
    id: '4',
    patientId: 'GH-2025-001004',
    firstName: 'Akosua',
    lastName: 'Boateng',
    dateOfBirth: '2010-03-15',
    gender: 'female',
    nationality: 'Ghana',
    phoneNumber: '+233244111222',
    address: {
      region: 'Ashanti',
      district: 'Kumasi Metropolitan',
      town: 'Kumasi',
      area: 'Bantama'
    },
    emergencyContact: {
      name: 'Yaw Boateng',
      relationship: 'Father',
      phoneNumber: '+233244333444'
    },
    bloodGroup: 'O-',
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    insurance: {
      hasNHIS: true,
      nhisStatus: 'active'
    },
    createdAt: new Date().toISOString(), // Today's patient
    updatedAt: new Date().toISOString(),
    createdBy: '1',
    facilityId: 'facility_1',
    status: 'active',
    preferredLanguage: 'twi',
    interpreterNeeded: false
  },
  {
    id: '5',
    patientId: 'GH-2025-001005',
    firstName: 'Emmanuel',
    lastName: 'Adjei',
    dateOfBirth: '1965-09-08',
    gender: 'male',
    nationality: 'Ghana',
    nhisNumber: 'NHIS-555666777',
    phoneNumber: '+233244999000',
    address: {
      region: 'Eastern',
      district: 'Koforidua',
      town: 'Koforidua',
      area: 'Adweso'
    },
    emergencyContact: {
      name: 'Grace Adjei',
      relationship: 'Wife',
      phoneNumber: '+233244888999'
    },
    bloodGroup: 'AB+',
    allergies: ['Aspirin'],
    chronicConditions: ['Hypertension', 'Arthritis'],
    currentMedications: ['Amlodipine 5mg', 'Ibuprofen 400mg'],
    insurance: {
      hasNHIS: true,
      nhisStatus: 'active'
    },
    createdAt: '2025-07-04T09:15:00Z',
    updatedAt: '2025-07-04T09:15:00Z',
    createdBy: '1',
    facilityId: 'facility_1',
    status: 'active',
    preferredLanguage: 'english',
    interpreterNeeded: false
  }
]; 