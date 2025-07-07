const axios = require('axios');

// Test the enhanced AI-powered clinical notes system
async function testEnhancedAI() {
    const API_BASE = 'http://localhost:5000';
    
    try {
        // Login first
        console.log('🔐 Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'doctor@ghehr.gh',
            password: 'password'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Test cases
        const testCases = [
            {
                name: 'Malaria (Enhanced)',
                text: 'Patient has high fever, severe headache, chills, and body aches. Lives in rural area during rainy season. Maleria suspected.'
            },
            {
                name: 'Tuberculosis (Enhanced)',
                text: 'Patient has persistent cough with blood, night sweats, weight loss for 2 weeks. Family member has TB.'
            },
            {
                name: 'Hypertension (Enhanced)',
                text: 'Patient complains of severe headache, dizziness, and chest pain. Blood pressure is high.'
            }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n🧪 Testing: ${testCase.name}`);
            console.log(`📝 Input: ${testCase.text}`);
            
            const analysisResponse = await axios.post(`${API_BASE}/api/notes/analyze`, {
                text: testCase.text
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = analysisResponse.data.data;
            console.log('🤖 AI Analysis Results:');
            console.log('  Suggested Conditions:', result.suggestedConditions || result.suggestions);
            console.log('  Extracted Symptoms:', result.extractedSymptoms || result.symptoms);
            console.log('  Severity:', result.severity || 'Not assessed');
            console.log('  Urgency:', result.urgencyLevel || 'Not assessed');
            console.log('  Recommendations:', result.treatmentRecommendations || result.recommendations);
            
            if (result.culturalGuidance) {
                console.log('  Cultural Guidance:', result.culturalGuidance);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testEnhancedAI();
