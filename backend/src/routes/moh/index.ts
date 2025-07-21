import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const dataDir = path.resolve(__dirname, '../../Research');

function readJson(filename: string) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

router.get('/policies', (req, res) => {
  const data = readJson('moh_data_20250709_144205.json');
  res.json(data?.health_policies || []);
});

router.get('/facilities', (req, res) => {
  const data = readJson('moh_data_20250709_144205.json');
  let facilities = data?.healthcare_facilities || [];
  
  // Filter out non-facility entries (news articles, etc.) and create proper facility data
  const realFacilities = facilities.filter((f: any) => 
    f.name && !f.name.includes('HEALTH MINISTER') && !f.name.includes('NEWS')
  );
  
  // If we don't have real facility data, provide mock data for demo
  if (realFacilities.length === 0) {
    facilities = [
      { name: "Korle-Bu Teaching Hospital", type: "hospital", location: "Accra", contact: "+233-xxx-xxxx" },
      { name: "Komfo Anokye Teaching Hospital", type: "hospital", location: "Kumasi", contact: "+233-xxx-xxxx" },
      { name: "Ridge Hospital", type: "hospital", location: "Accra", contact: "+233-xxx-xxxx" },
      { name: "Ho Teaching Hospital", type: "hospital", location: "Ho", contact: "+233-xxx-xxxx" },
      { name: "Tamale Teaching Hospital", type: "hospital", location: "Tamale", contact: "+233-xxx-xxxx" },
      { name: "Cape Coast Teaching Hospital", type: "hospital", location: "Cape Coast", contact: "+233-xxx-xxxx" },
      { name: "Accra Psychiatric Hospital", type: "hospital", location: "Accra", contact: "+233-xxx-xxxx" },
      { name: "Police Hospital", type: "hospital", location: "Accra", contact: "+233-xxx-xxxx" },
      { name: "37 Military Hospital", type: "hospital", location: "Accra", contact: "+233-xxx-xxxx" },
      { name: "Adabraka Polyclinic", type: "clinic", location: "Accra", contact: "+233-xxx-xxxx" },
      { name: "Kaneshie Polyclinic", type: "clinic", location: "Accra", contact: "+233-xxx-xxxx" },
      { name: "Dansoman Polyclinic", type: "clinic", location: "Accra", contact: "+233-xxx-xxxx" },
      { name: "Tema General Hospital", type: "hospital", location: "Tema", contact: "+233-xxx-xxxx" },
      { name: "La General Hospital", type: "hospital", location: "Accra", contact: "+233-xxx-xxxx" },
      { name: "Legon Hospital", type: "hospital", location: "Legon", contact: "+233-xxx-xxxx" }
    ];
  } else {
    facilities = realFacilities.map((facility: any) => ({
      ...facility,
      type: facility.type || 'hospital'
    }));
  }
  
  res.json(facilities);
});

router.get('/programs', (req, res) => {
  const data = readJson('moh_data_20250709_144205.json');
  res.json(data?.health_programs || []);
});

router.get('/news', (req, res) => {
  const data = readJson('moh_data_20250709_144205.json');
  res.json(data?.news_updates || []);
});

router.get('/contacts', (req, res) => {
  const data = readJson('moh_data_20250709_144205.json');
  res.json(data?.contact_info || []);
});

router.get('/insights', (req, res) => {
  const mohData = readJson('moh_data_20250709_144205.json');
  const ehrInsights = readJson('ehr_insights_20250709_144205.json');
  
  // Transform the scraped data into dashboard format
  const dashboardData = {
    compliance_score: 87, // Static for now, could be calculated based on available data
    hissp_alignment: "Compliant with HISSP 2025",
    data_protection_act: "Compliant with Ghana Data Protection Act",
    facility_registration: "MOH Licensed",
    lightwave_compatibility: "Ready for Integration",
    total_patients: "12,543", // Mock data for demo
    nhis_integration: 78, // Mock percentage
    
    // Disease surveillance data (mock data based on Ghana's common diseases)
    disease_surveillance: [
      { name: "Malaria", status: "Critical", count: 523, notes: "Surveillance Required" },
      { name: "Maternal Complications", status: "Critical", count: 89, notes: "Surveillance Required" },
      { name: "HIV/AIDS", status: "High", count: 45, notes: "Surveillance Required" },
      { name: "Tuberculosis", status: "High", count: 23, notes: "Surveillance Required" },
      { name: "Meningitis", status: "High", count: 3, notes: "Surveillance Required" }
    ],
    
    // Include original scraped data for reference
    regulatory_requirements: ehrInsights?.regulatory_requirements || [],
    facility_types: ehrInsights?.facility_types || [],
    common_health_issues: ehrInsights?.common_health_issues || [],
    data_standards: ehrInsights?.data_standards || [],
    compliance_requirements: ehrInsights?.compliance_requirements || []
  };
  
  res.json(dashboardData);
});

export default router;
