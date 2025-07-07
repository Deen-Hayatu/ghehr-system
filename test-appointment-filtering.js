// Test script to debug appointment filtering
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

// Test data - replace with your actual login credentials
const testCredentials = {
  email: 'admin@ghehr.gh',
  password: 'password'
};

async function testAppointmentFiltering() {
  try {
    console.log('🔍 Testing Appointment Filtering...\n');

    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, testCredentials);
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Get all appointments
    console.log('2️⃣ Fetching all appointments...');
    const allAppointmentsResponse = await axios.get(`${API_BASE_URL}/api/appointments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (allAppointmentsResponse.data.success) {
      const appointments = allAppointmentsResponse.data.data.appointments;
      console.log(`✅ Found ${appointments.length} appointments:`);
      appointments.forEach(apt => {
        console.log(`   📅 ${apt.date} ${apt.time} - Patient: ${apt.patientId} - Type: ${apt.type}`);
      });
    } else {
      console.error('❌ Failed to fetch appointments:', allAppointmentsResponse.data);
      return;
    }

    // Step 3: Test date filtering with today's date
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n3️⃣ Testing date filter for: ${today}`);
    
    const dateFilterResponse = await axios.get(`${API_BASE_URL}/api/appointments?date=${today}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (dateFilterResponse.data.success) {
      const filteredAppointments = dateFilterResponse.data.data.appointments;
      console.log(`✅ Found ${filteredAppointments.length} appointments for ${today}:`);
      filteredAppointments.forEach(apt => {
        console.log(`   📅 ${apt.date} ${apt.time} - Patient: ${apt.patientId} - Type: ${apt.type}`);
      });
    } else {
      console.error('❌ Date filtering failed:', dateFilterResponse.data);
    }

    // Step 4: Test with a specific date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`\n4️⃣ Testing date filter for: ${tomorrowStr}`);
    
    const tomorrowFilterResponse = await axios.get(`${API_BASE_URL}/api/appointments?date=${tomorrowStr}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (tomorrowFilterResponse.data.success) {
      const tomorrowAppointments = tomorrowFilterResponse.data.data.appointments;
      console.log(`✅ Found ${tomorrowAppointments.length} appointments for ${tomorrowStr}:`);
      tomorrowAppointments.forEach(apt => {
        console.log(`   📅 ${apt.date} ${apt.time} - Patient: ${apt.patientId} - Type: ${apt.type}`);
      });
    } else {
      console.error('❌ Tomorrow filtering failed:', tomorrowFilterResponse.data);
    }

    console.log('\n🎯 Debugging Summary:');
    console.log('- Check if the date you selected matches the appointment date format');
    console.log('- Verify that the appointment was created with the correct facility ID');
    console.log('- Ensure the patient ID in the appointment matches a real patient');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAppointmentFiltering(); 