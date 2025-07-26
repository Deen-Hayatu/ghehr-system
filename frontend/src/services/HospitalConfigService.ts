export interface HospitalConfig {
  id: string;
  name: string;
  tagline: string;
  logo?: string; // URL to logo image
  logoEmoji: string; // Fallback emoji
  address: string;
  phone: string;
  email?: string;
  website?: string;
  license?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  departments: string[];
  timezone: string;
  currency: string;
  language: 'en' | 'tw' | 'ga'; // English, Twi, Ga
}

class HospitalConfigService {
  private static readonly STORAGE_KEY = 'hospital_config';
  
  // Default configuration for Ghana EHR system
  private static readonly DEFAULT_CONFIG: HospitalConfig = {
    id: 'ghehr-default',
    name: 'Ghana Electronic Health Records',
    tagline: 'Advanced Healthcare Management System',
    logoEmoji: '⚕️ GhEHR',
    address: 'Accra, Ghana',
    phone: '+233 XXX XXX XXX',
    email: 'info@ghehr.gov.gh',
    website: 'www.ghehr.gov.gh',
    license: 'MOH License #GH-2024-001',
    colors: {
      primary: '#1976D2',
      secondary: '#2E7D32',
      accent: '#FF6B35'
    },
    departments: [
      'Emergency',
      'Internal Medicine', 
      'Pediatrics',
      'Surgery',
      'Obstetrics & Gynecology',
      'Laboratory',
      'Pharmacy',
      'Radiology'
    ],
    timezone: 'Africa/Accra',
    currency: 'GHS',
    language: 'en'
  };

  // Sample hospital configurations
  private static readonly SAMPLE_CONFIGS: Record<string, HospitalConfig> = {
    'korle-bu': {
      id: 'korle-bu',
      name: 'Korle-Bu Teaching Hospital',
      tagline: 'Excellence in Healthcare, Teaching & Research',
      logoEmoji: '⚕️ GhEHR',
      address: 'Korle Bu, Accra, Ghana',
      phone: '+233 302 674 858',
      email: 'info@kbth.gov.gh',
      website: 'www.kbth.gov.gh',
      license: 'MOH License #GH-KBTH-001',
      colors: {
        primary: '#0D47A1',
        secondary: '#1B5E20',
        accent: '#E65100'
      },
      departments: [
        'Emergency',
        'Internal Medicine',
        'Surgery',
        'Pediatrics',
        'Obstetrics & Gynecology',
        'Neurology',
        'Cardiology',
        'Laboratory',
        'Pharmacy'
      ],
      timezone: 'Africa/Accra',
      currency: 'GHS',
      language: 'en'
    },
    'komfo-anokye': {
      id: 'komfo-anokye',
      name: 'Komfo Anokye Teaching Hospital',
      tagline: 'Quality Healthcare for All',
      logoEmoji: '⚕️ GhEHR',
      address: 'Bantama, Kumasi, Ghana',
      phone: '+233 322 022 701',
      email: 'info@kath.gov.gh',
      website: 'www.kath.gov.gh',
      license: 'MOH License #GH-KATH-001',
      colors: {
        primary: '#4A148C',
        secondary: '#2E7D32',
        accent: '#FF8F00'
      },
      departments: [
        'Emergency',
        'Internal Medicine',
        'Surgery',
        'Pediatrics',
        'Obstetrics & Gynecology',
        'Orthopedics',
        'Laboratory',
        'Pharmacy'
      ],
      timezone: 'Africa/Accra',
      currency: 'GHS',
      language: 'en'
    },
    'ridge-hospital': {
      id: 'ridge-hospital',
      name: 'Ridge Hospital',
      tagline: 'Caring for Your Health',
      logoEmoji: '⚕️ GhEHR',
      address: 'Ridge, Accra, Ghana',
      phone: '+233 302 776 111',
      email: 'info@ridgehospital.gov.gh',
      website: 'www.ridgehospital.gov.gh',
      license: 'MOH License #GH-RH-001',
      colors: {
        primary: '#388E3C',
        secondary: '#1976D2',
        accent: '#F57C00'
      },
      departments: [
        'Emergency',
        'Internal Medicine',
        'Surgery',
        'Pediatrics',
        'Laboratory',
        'Pharmacy'
      ],
      timezone: 'Africa/Accra',
      currency: 'GHS',
      language: 'en'
    },
    'cape-coast': {
      id: 'cape-coast',
      name: 'Cape Coast Teaching Hospital',
      tagline: 'Excellence in Healthcare Delivery',
      logoEmoji: '⚕️ GhEHR',
      address: 'Cape Coast, Central Region, Ghana',
      phone: '+233 332 132 867',
      email: 'info@ccth.gov.gh',
      website: 'www.ccth.gov.gh',
      license: 'MOH License #GH-CCTH-001',
      colors: {
        primary: '#0277BD',
        secondary: '#00695C',
        accent: '#FF5722'
      },
      departments: [
        'Emergency',
        'Internal Medicine',
        'Surgery',
        'Pediatrics',
        'Obstetrics & Gynecology',
        'Laboratory',
        'Pharmacy'
      ],
      timezone: 'Africa/Accra',
      currency: 'GHS',
      language: 'en'
    }
  };

  static getCurrentConfig(): HospitalConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading hospital config:', error);
    }
    return this.DEFAULT_CONFIG;
  }

  static setCurrentConfig(config: HospitalConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving hospital config:', error);
    }
  }

  static getAvailableHospitals(): HospitalConfig[] {
    return [this.DEFAULT_CONFIG, ...Object.values(this.SAMPLE_CONFIGS)];
  }

  static getHospitalById(id: string): HospitalConfig | null {
    if (id === this.DEFAULT_CONFIG.id) {
      return this.DEFAULT_CONFIG;
    }
    return this.SAMPLE_CONFIGS[id] || null;
  }

  static switchHospital(hospitalId: string): boolean {
    const config = this.getHospitalById(hospitalId);
    if (config) {
      this.setCurrentConfig(config);
      return true;
    }
    return false;
  }

  static createCustomConfig(config: Partial<HospitalConfig>): HospitalConfig {
    return {
      ...this.DEFAULT_CONFIG,
      ...config,
      id: config.id || `custom-${Date.now()}`,
      colors: {
        ...this.DEFAULT_CONFIG.colors,
        ...config.colors
      }
    };
  }

  static updateCurrentConfig(updates: Partial<HospitalConfig>): void {
    const current = this.getCurrentConfig();
    const updated = {
      ...current,
      ...updates,
      colors: {
        ...current.colors,
        ...updates.colors
      }
    };
    this.setCurrentConfig(updated);
  }

  // Utility methods for formatting
  static formatCurrency(amount: number, config?: HospitalConfig): string {
    const hospitalConfig = config || this.getCurrentConfig();
    return `${hospitalConfig.currency} ${amount.toFixed(2)}`;
  }

  static formatDateTime(date: Date, config?: HospitalConfig): string {
    const hospitalConfig = config || this.getCurrentConfig();
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: hospitalConfig.timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  static getLocalizedText(key: string, config?: HospitalConfig): string {
    const hospitalConfig = config || this.getCurrentConfig();
    
    const translations: Record<string, Record<string, string>> = {
      'pharmacy_order': {
        'en': 'PHARMACY ORDER FORM',
        'tw': 'ADURO KRATAA',
        'ga': 'ADURO KRATAA'
      },
      'lab_order': {
        'en': 'LABORATORY ORDER FORM',
        'tw': 'NHWEHWƐMU KRATAA',
        'ga': 'NHWEHWƐMU KRATAA'
      },
      'patient': {
        'en': 'Patient',
        'tw': 'Ɔyarefoɔ',
        'ga': 'Ɔyarefoɔ'
      },
      'doctor': {
        'en': 'Doctor',
        'tw': 'Dɔkota',
        'ga': 'Dɔkota'
      },
      'total_cost': {
        'en': 'Total Cost',
        'tw': 'Ɛka Nyinaa',
        'ga': 'Ɛka Nyinaa'
      }
    };

    return translations[key]?.[hospitalConfig.language] || key;
  }
}

export default HospitalConfigService;
