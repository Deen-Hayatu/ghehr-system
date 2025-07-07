import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Mock clinical notes data
let clinicalNotes: any[] = [
  {
    id: 'NOTE-001',
    patientId: '1',
    providerId: '1',
    date: new Date().toISOString(),
    content: 'Patient presents with fever, headache, and joint pains. Suspected malaria.',
    tags: ['malaria', 'fever', 'headache'],
    confidence: { malaria: 0.85, typhoid: 0.2 },
    facilityId: 'facility_1',
    createdAt: new Date().toISOString(),
  }
];

// Enhanced Ghana-specific medical term analyzer
class GhanaMedicalNLP {
  private medicalTerms = {
    // Common diseases in Ghana with enhanced symptom matching
    malaria: {
      primary: ['fever', 'chills', 'headache', 'joint pain', 'muscle aches', 'sweating'],
      secondary: ['vomiting', 'nausea', 'fatigue', 'weakness', 'body aches', 'shivering'],
      localTerms: ['atiridii', 'nsanyare', 'cold body', 'hot body', 'maleria'],
      severity: ['high fever', 'severe headache', 'unconscious', 'convulsions'],
      weight: 1.0
    },
    typhoid: {
      primary: ['prolonged fever', 'abdominal pain', 'headache', 'weakness'],
      secondary: ['diarrhea', 'constipation', 'rose spots', 'loss of appetite'],
      localTerms: ['stomach fever', 'typhoid fever', 'enteric fever'],
      severity: ['severe abdominal pain', 'high fever', 'delirium'],
      weight: 0.9
    },
    tuberculosis: {
      primary: ['persistent cough', 'cough with blood', 'weight loss', 'night sweats'],
      secondary: ['fever', 'fatigue', 'chest pain', 'shortness of breath'],
      localTerms: ['tb', 'consumption', 'wasting disease', 'chest disease'],
      severity: ['hemoptysis', 'severe weight loss', 'difficulty breathing'],
      weight: 0.8
    },
    hypertension: {
      primary: ['high blood pressure', 'headache', 'dizziness', 'chest pain'],
      secondary: ['shortness of breath', 'nosebleeds', 'blurred vision'],
      localTerms: ['bp', 'pressure', 'high pressure', 'blood pressure'],
      severity: ['severe headache', 'chest tightness', 'stroke symptoms'],
      weight: 0.7
    },
    diabetes: {
      primary: ['excessive thirst', 'frequent urination', 'unexplained weight loss'],
      secondary: ['fatigue', 'blurred vision', 'slow healing wounds'],
      localTerms: ['sugar', 'diabetes', 'sugar disease', 'sweet urine'],
      severity: ['diabetic coma', 'severe dehydration', 'ketoacidosis'],
      weight: 0.7
    },
    pneumonia: {
      primary: ['cough', 'fever', 'difficulty breathing', 'chest pain'],
      secondary: ['shortness of breath', 'fatigue', 'confusion'],
      localTerms: ['lung infection', 'chest infection', 'pneumonia'],
      severity: ['severe breathing difficulty', 'high fever', 'chest tightness'],
      weight: 0.8
    },
    asthma: {
      primary: ['wheezing', 'shortness of breath', 'cough', 'chest tightness'],
      secondary: ['difficulty breathing', 'fatigue', 'sleep disturbance'],
      localTerms: ['asthma', 'breathing problem', 'chest tightness'],
      severity: ['severe wheezing', 'cannot speak', 'blue lips'],
      weight: 0.6
    },
    gastroenteritis: {
      primary: ['diarrhea', 'vomiting', 'stomach pain', 'nausea'],
      secondary: ['dehydration', 'weakness', 'loss of appetite'],
      localTerms: ['stomach upset', 'stomach problem', 'loose stool'],
      severity: ['severe dehydration', 'blood in stool', 'persistent vomiting'],
      weight: 0.7
    },
    urinaryTractInfection: {
      primary: ['painful urination', 'frequent urination', 'burning sensation'],
      secondary: ['cloudy urine', 'strong odor', 'pelvic pain'],
      localTerms: ['uti', 'urine infection', 'water problem'],
      severity: ['blood in urine', 'fever', 'severe pain'],
      weight: 0.6
    },
    meningitis: {
      primary: ['severe headache', 'neck stiffness', 'fever', 'sensitivity to light'],
      secondary: ['vomiting', 'confusion', 'rash'],
      localTerms: ['brain fever', 'neck pain', 'stiff neck'],
      severity: ['unconscious', 'convulsions', 'high fever'],
      weight: 0.9
    }
  };

  analyze(text: string): { [condition: string]: number } {
    const lowercaseText = text.toLowerCase();
    const results: { [condition: string]: number } = {};

    Object.entries(this.medicalTerms).forEach(([condition, data]) => {
      let primaryMatches = 0;
      let secondaryMatches = 0;
      let localMatches = 0;
      let severityMatches = 0;

      // Check primary symptoms (higher weight)
      data.primary.forEach(symptom => {
        if (lowercaseText.includes(symptom.toLowerCase())) {
          primaryMatches++;
        }
      });

      // Check secondary symptoms
      data.secondary.forEach(symptom => {
        if (lowercaseText.includes(symptom.toLowerCase())) {
          secondaryMatches++;
        }
      });

      // Check local/cultural terms
      data.localTerms.forEach(term => {
        if (lowercaseText.includes(term.toLowerCase())) {
          localMatches++;
        }
      });

      // Check severity indicators
      data.severity.forEach(indicator => {
        if (lowercaseText.includes(indicator.toLowerCase())) {
          severityMatches++;
        }
      });

      // Calculate sophisticated confidence score
      if (primaryMatches > 0 || secondaryMatches > 0 || localMatches > 0) {
        const primaryScore = (primaryMatches / data.primary.length) * 0.6;
        const secondaryScore = (secondaryMatches / data.secondary.length) * 0.3;
        const localScore = (localMatches / data.localTerms.length) * 0.4;
        const severityBonus = (severityMatches / data.severity.length) * 0.2;
        
        let confidence = primaryScore + secondaryScore + localScore + severityBonus;
        confidence = confidence * data.weight; // Apply disease-specific weight
        confidence = Math.min(confidence, 0.95); // Cap at 95%
        
        results[condition] = confidence;
      }
    });

    return results;
  }

  extractSymptoms(text: string): string[] {
    const lowercaseText = text.toLowerCase();
    const foundSymptoms: string[] = [];

    Object.values(this.medicalTerms).forEach(data => {
      [...data.primary, ...data.secondary, ...data.severity].forEach(symptom => {
        if (lowercaseText.includes(symptom.toLowerCase()) && !foundSymptoms.includes(symptom)) {
          foundSymptoms.push(symptom);
        }
      });
    });

    return foundSymptoms;
  }

  assessSeverity(text: string): 'mild' | 'moderate' | 'severe' | 'critical' {
    const lowercaseText = text.toLowerCase();
    const severityKeywords = {
      critical: ['unconscious', 'convulsions', 'severe dehydration', 'cannot breathe', 'chest tightness'],
      severe: ['severe', 'intense', 'unbearable', 'blood', 'high fever', 'difficulty breathing'],
      moderate: ['moderate', 'persistent', 'ongoing', 'regular', 'frequent'],
      mild: ['mild', 'slight', 'occasional', 'minor', 'light']
    };

    for (const [level, keywords] of Object.entries(severityKeywords)) {
      for (const keyword of keywords) {
        if (lowercaseText.includes(keyword)) {
          return level as 'mild' | 'moderate' | 'severe' | 'critical';
        }
      }
    }

    return 'mild'; // Default
  }

  getUrgencyLevel(conditions: { [condition: string]: number }, severity: string): 'low' | 'medium' | 'high' | 'urgent' {
    const criticalConditions = ['meningitis', 'tuberculosis'];
    const highPriorityConditions = ['malaria', 'typhoid', 'pneumonia'];
    
    const hasCritical = Object.keys(conditions).some(condition => 
      criticalConditions.includes(condition) && conditions[condition] > 0.6
    );
    
    const hasHighPriority = Object.keys(conditions).some(condition => 
      highPriorityConditions.includes(condition) && conditions[condition] > 0.7
    );

    if (hasCritical || severity === 'critical') return 'urgent';
    if (hasHighPriority || severity === 'severe') return 'high';
    if (severity === 'moderate') return 'medium';
    return 'low';
  }
}

const medNLP = new GhanaMedicalNLP();

// GET /api/notes - Get clinical notes for a patient
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.query;
    const facilityId = req.user?.facilityId;

    let filteredNotes = clinicalNotes.filter(note => 
      note.facilityId === facilityId
    );

    if (patientId) {
      filteredNotes = filteredNotes.filter(note => note.patientId === patientId);
    }

    res.json({
      success: true,
      data: { notes: filteredNotes }
    });
  } catch (error) {
    console.error('Error fetching clinical notes:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching clinical notes' }
    });
  }
});

// POST /api/notes - Create new clinical note with AI analysis
router.post('/', [
  authenticateToken,
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('content').notEmpty().withMessage('Note content is required'),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📝 Creating clinical note with AI analysis');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid input', details: errors.array() }
      });
      return;
    }

    const { patientId, content, diagnosis = '', treatment = '' } = req.body;
    const facilityId = req.user?.facilityId;
    const providerId = req.user?.id;

    // Enhanced AI Analysis of the clinical note
    const aiAnalysis = medNLP.analyze(content);
    const extractedSymptoms = medNLP.extractSymptoms(content);
    const severityAssessment = medNLP.assessSeverity(content);
    const urgencyLevel = medNLP.getUrgencyLevel(aiAnalysis, severityAssessment);

    console.log('🤖 Enhanced AI Analysis Results:', {
      conditions: aiAnalysis,
      symptoms: extractedSymptoms,
      severity: severityAssessment,
      urgency: urgencyLevel
    });

    const newNote = {
      id: `NOTE-${(clinicalNotes.length + 1).toString().padStart(3, '0')}`,
      patientId,
      providerId,
      content,
      diagnosis,
      treatment,
      symptoms: extractedSymptoms,
      aiSuggestions: aiAnalysis,
      confidence: aiAnalysis,
      facilityId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    clinicalNotes.push(newNote);

    console.log('✅ Clinical note created with AI insights');

    res.status(201).json({
      success: true,
      data: { 
        note: newNote,
        aiInsights: {
          suggestedConditions: Object.entries(aiAnalysis)
            .filter(([_, confidence]) => confidence > 0.3)
            .sort((a, b) => b[1] - a[1])
            .map(([condition, confidence]) => ({
              condition,
              confidence: Math.round(confidence * 100) / 100,
              reasoning: `Based on symptom analysis and Ghana medical patterns`
            })),
          extractedSymptoms,
          severity: severityAssessment,
          urgencyLevel,
          recommendations: generateRecommendations(aiAnalysis, severityAssessment),
          culturalContext: getCulturalGuidance(aiAnalysis)
        }
      }
    });
  } catch (error) {
    console.error('❌ Error creating clinical note:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error creating clinical note' }
    });
  }
});

// Generate enhanced treatment recommendations based on AI analysis
function generateRecommendations(analysis: { [condition: string]: number }, severity: string = 'mild'): string[] {
  const recommendations: string[] = [];
  
  Object.entries(analysis).forEach(([condition, confidence]) => {
    if (confidence > 0.4) {
      switch (condition) {
        case 'malaria':
          if (confidence > 0.7) {
            recommendations.push('🔬 IMMEDIATE: Perform malaria RDT or microscopy');
            recommendations.push('💊 If positive: ACT - Artemether-Lumefantrine (Adult: 4 tablets twice daily x 3 days)');
            recommendations.push('🌡️ Paracetamol 1g QDS for fever management');
            if (severity === 'severe' || severity === 'critical') {
              recommendations.push('🚨 URGENT: Consider severe malaria - IV Artesunate required');
              recommendations.push('🏥 Immediate referral to higher facility');
            }
          } else {
            recommendations.push('🔬 Consider malaria testing (RDT preferred)');
            recommendations.push('⚠️ Monitor for danger signs: convulsions, vomiting, altered consciousness');
          }
          break;

        case 'typhoid':
          if (confidence > 0.6) {
            recommendations.push('🔬 Blood culture and Widal test recommended');
            recommendations.push('💊 Ciprofloxacin 500mg BD x 7-10 days OR Azithromycin 500mg OD x 5-7 days');
            recommendations.push('💧 Ensure adequate fluid intake and rest');
            recommendations.push('🍽️ Dietary advice: soft, easily digestible foods');
          }
          break;

        case 'tuberculosis':
          recommendations.push('🔬 URGENT: Chest X-ray and sputum examination (3 samples)');
          recommendations.push('🏥 Refer to TB clinic immediately if sputum positive');
          recommendations.push('😷 Isolate patient until cleared');
          recommendations.push('📞 Contact tracing for household members');
          if (confidence > 0.7) {
            recommendations.push('💊 Consider starting anti-TB treatment pending results');
          }
          break;

        case 'hypertension':
          if (confidence > 0.6) {
            recommendations.push('📊 Monitor BP regularly (target <140/90 mmHg)');
            recommendations.push('💊 Consider Amlodipine 5mg OD or Lisinopril 10mg OD');
            recommendations.push('🥗 Lifestyle: reduce salt, exercise, weight management');
            recommendations.push('⚠️ Check for end-organ damage (ECG, urinalysis)');
          }
          break;

        case 'diabetes':
          recommendations.push('🔬 Check random blood glucose and HbA1c');
          recommendations.push('💊 If confirmed: Metformin 500mg BD with meals');
          recommendations.push('🍎 Dietary counseling: low sugar, complex carbs');
          recommendations.push('👁️ Annual eye and foot examinations');
          break;

        case 'pneumonia':
          if (confidence > 0.6) {
            recommendations.push('🔬 Chest X-ray and sputum culture');
            recommendations.push('💊 Amoxicillin 1g TDS x 5-7 days OR Azithromycin 500mg OD x 3 days');
            recommendations.push('🌡️ Paracetamol for fever and pain relief');
            if (severity === 'severe') {
              recommendations.push('🏥 Consider hospitalization for IV antibiotics');
            }
          }
          break;

        case 'asthma':
          recommendations.push('💨 Salbutamol inhaler 2 puffs QDS PRN');
          recommendations.push('⚠️ Identify and avoid triggers');
          recommendations.push('📚 Patient education on inhaler technique');
          if (severity === 'severe') {
            recommendations.push('💊 Consider prednisolone 30mg OD x 5 days');
          }
          break;

        case 'gastroenteritis':
          recommendations.push('💧 Oral rehydration therapy (ORS solution)');
          recommendations.push('🍽️ BRAT diet: bananas, rice, applesauce, toast');
          recommendations.push('⚠️ Monitor for dehydration signs');
          if (severity === 'severe') {
            recommendations.push('🏥 Consider IV fluids if severe dehydration');
          }
          break;

        case 'urinaryTractInfection':
          recommendations.push('🔬 Urine microscopy and culture');
          recommendations.push('💊 Nitrofurantoin 100mg BD x 5 days OR Trimethoprim 200mg BD x 3 days');
          recommendations.push('💧 Increase fluid intake');
          recommendations.push('⚠️ Return if symptoms persist after 48 hours');
          break;

        case 'meningitis':
          recommendations.push('🚨 MEDICAL EMERGENCY - Immediate referral');
          recommendations.push('💊 IV Ceftriaxone 2g BD stat before transfer');
          recommendations.push('🔬 Lumbar puncture at referral facility');
          recommendations.push('😷 Droplet precautions and prophylaxis for contacts');
          break;
      }
    }
  });

  // General recommendations based on severity
  if (severity === 'critical') {
    recommendations.unshift('🚨 CRITICAL: Immediate medical attention required');
    recommendations.push('🏥 Refer to hospital emergency department');
  } else if (severity === 'severe') {
    recommendations.push('⚠️ Close monitoring required - return if worsening');
    recommendations.push('📞 Follow-up within 24-48 hours');
  }

  return recommendations;
}

// Provide culturally appropriate guidance for Ghana
function getCulturalGuidance(analysis: { [condition: string]: number }): string[] {
  const guidance: string[] = [];
  
  Object.entries(analysis).forEach(([condition, confidence]) => {
    if (confidence > 0.5) {
      switch (condition) {
        case 'malaria':
          guidance.push('🏠 Advise use of bed nets and clearing stagnant water around home');
          guidance.push('🌿 Traditional remedies can be used alongside modern medicine, but modern treatment is essential');
          break;
        case 'tuberculosis':
          guidance.push('😷 Explain importance of completing full treatment course (6+ months)');
          guidance.push('👨‍👩‍👧‍👦 Educate family about transmission and prevention');
          break;
        case 'hypertension':
          guidance.push('🧂 Reduce palm oil and salt in cooking - use more vegetables and fruits');
          guidance.push('🚶‍♂️ Encourage walking and physical activity suitable for age');
          break;
        case 'diabetes':
          guidance.push('🍠 Education about local foods: choose yam over white rice, prefer plantain');
          guidance.push('📚 Family education important for diet management');
          break;
      }
    }
  });

  return guidance;
}

// Identify risk factors based on analysis
function getRiskFactors(analysis: { [condition: string]: number }): string[] {
  const riskFactors: string[] = [];
  
  Object.entries(analysis).forEach(([condition, confidence]) => {
    if (confidence > 0.4) {
      switch (condition) {
        case 'malaria':
          riskFactors.push('Living in endemic area');
          riskFactors.push('Rainy season exposure');
          riskFactors.push('Poor sanitation around home');
          break;
        case 'tuberculosis':
          riskFactors.push('Close contact with TB patient');
          riskFactors.push('Overcrowded living conditions');
          riskFactors.push('Malnutrition or HIV status');
          break;
        case 'hypertension':
          riskFactors.push('Family history of hypertension');
          riskFactors.push('High salt diet');
          riskFactors.push('Age >40 years');
          break;
        case 'diabetes':
          riskFactors.push('Family history of diabetes');
          riskFactors.push('Obesity or overweight');
          riskFactors.push('Sedentary lifestyle');
          break;
      }
    }
  });

  return riskFactors;
}

// Provide follow-up instructions based on urgency and conditions
function getFollowUpInstructions(urgency: string, analysis: { [condition: string]: number }): string[] {
  const instructions: string[] = [];
  
  switch (urgency) {
    case 'urgent':
      instructions.push('🚨 Immediate medical attention required');
      instructions.push('📞 Call emergency services if symptoms worsen');
      instructions.push('🏥 Go to nearest hospital emergency department');
      break;
    case 'high':
      instructions.push('⚠️ Return within 24 hours if no improvement');
      instructions.push('📞 Call clinic if symptoms worsen');
      instructions.push('🌡️ Monitor temperature and symptoms closely');
      break;
    case 'medium':
      instructions.push('📅 Follow-up appointment in 2-3 days');
      instructions.push('📊 Monitor symptoms and report changes');
      instructions.push('💊 Take medications as prescribed');
      break;
    case 'low':
      instructions.push('📅 Routine follow-up in 1 week');
      instructions.push('🏠 Home care and rest');
      instructions.push('📞 Call if symptoms persist or worsen');
      break;
  }

  // Add condition-specific follow-up
  Object.entries(analysis).forEach(([condition, confidence]) => {
    if (confidence > 0.6) {
      switch (condition) {
        case 'malaria':
          instructions.push('🔬 Return for repeat test if symptoms persist after 48 hours');
          break;
        case 'tuberculosis':
          instructions.push('🏥 Weekly follow-up at TB clinic once started on treatment');
          break;
        case 'hypertension':
          instructions.push('📊 Monthly BP monitoring');
          break;
        case 'diabetes':
          instructions.push('🔬 Monthly blood glucose monitoring');
          break;
      }
    }
  });

  return instructions;
}

// POST /api/notes/analyze - Analyze text for medical insights (for real-time suggestions)
router.post('/analyze', [
  authenticateToken,
  body('text').notEmpty().withMessage('Text is required'),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    
    const analysis = medNLP.analyze(text);
    const symptoms = medNLP.extractSymptoms(text);
    const severity = medNLP.assessSeverity(text);
    const urgency = medNLP.getUrgencyLevel(analysis, severity);
    const recommendations = generateRecommendations(analysis, severity);
    const culturalGuidance = getCulturalGuidance(analysis);

    res.json({
      success: true,
      data: {
        suggestedConditions: Object.entries(analysis)
          .filter(([_, confidence]) => confidence > 0.2)
          .sort((a, b) => b[1] - a[1])
          .map(([condition, confidence]) => ({
            condition,
            confidence: Math.round(confidence * 100) / 100,
            reasoning: `Based on ${symptoms.length} symptom matches and Ghana medical patterns`
          })),
        extractedSymptoms: symptoms,
        severity,
        urgencyLevel: urgency,
        treatmentRecommendations: recommendations,
        culturalGuidance,
        riskFactors: getRiskFactors(analysis),
        followUpInstructions: getFollowUpInstructions(urgency, analysis)
      }
    });
  } catch (error) {
    console.error('❌ Error analyzing text:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error analyzing text' }
    });
  }
});

export default router;
