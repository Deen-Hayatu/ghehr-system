import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const dataDir = path.resolve(__dirname, '../../../../Research');

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
  res.json(data?.healthcare_facilities || []);
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
  const data = readJson('ehr_insights_20250709_144205.json');
  res.json(data || {});
});

export default router;
