// ============================================
// QUICK FIX SCRIPT FOR CROP ADVISORY API
// ============================================
// Copy and paste this entire script into your browser console
// when you're on the frontend app

console.log('🔧 Starting Quick Fix Script...\n');

// Step 1: Check current environment
console.log('📋 STEP 1: Environment Check');
console.log('─────────────────────────────');
console.log('Base URL:', import.meta?.env?.VITE_API_BASE_URL || 'Not available (try: process.env.VITE_API_BASE_URL)');
console.log('Current Token:', localStorage.getItem('token') ? 
  localStorage.getItem('token').substring(0, 30) + '...' : 
  '❌ NO TOKEN FOUND');
console.log('');

// Step 2: Test token validity
console.log('📋 STEP 2: Token Validity Test');
console.log('─────────────────────────────');
const token = localStorage.getItem('token');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = new Date(payload.exp * 1000);
    const now = new Date();
    const isExpired = exp < now;
    
    console.log('Token User ID:', payload.id);
    console.log('Token Issued:', new Date(payload.iat * 1000).toLocaleString());
    console.log('Token Expires:', exp.toLocaleString());
    console.log('Token Status:', isExpired ? '❌ EXPIRED' : '✅ VALID');
    console.log('Time until expiry:', isExpired ? 'Already expired' : Math.round((exp - now) / 1000 / 60) + ' minutes');
  } catch (e) {
    console.log('❌ Could not decode token:', e.message);
  }
} else {
  console.log('❌ No token found in localStorage');
}
console.log('');

// Step 3: Test API directly
console.log('📋 STEP 3: Direct API Test');
console.log('─────────────────────────────');
console.log('Testing API with current token...');

fetch('https://agri-pos-backend-kwmi.onrender.com/api/ai/crop-advisory', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    crop: "cotton",
    issue: "White Fly",
    symptoms: "White insects on leaf undersides, yellowing leaves",
    fieldSize: 5,
    location: "Punjab, Pakistan",
    language: "en"
  })
})
.then(async res => {
  console.log('Response Status:', res.status, res.statusText);
  const data = await res.json();
  
  if (res.ok) {
    console.log('✅ SUCCESS! API is working!');
    console.log('Response:', data);
    console.log('\n🎉 Your API is working fine! The issue might be in the frontend code.');
  } else {
    console.log('❌ ERROR! API returned error');
    console.log('Error Response:', data);
    
    if (res.status === 401) {
      console.log('\n💡 FIX: Your token is invalid or expired. Try:');
      console.log('   1. Login again to get a fresh token');
      console.log('   2. Or use the working token from Swagger:');
      console.log('      localStorage.setItem("token", "YOUR_SWAGGER_TOKEN");');
      console.log('      location.reload();');
    } else if (res.status === 500) {
      console.log('\n💡 FIX: Backend error. Possible causes:');
      console.log('   1. AI service (Gemini) is down or rate limited');
      console.log('   2. Backend configuration issue');
      console.log('   3. Database connection issue');
      console.log('   Try again in a few minutes or contact backend team.');
    }
  }
})
.catch(err => {
  console.log('❌ NETWORK ERROR!');
  console.log('Error:', err.message);
  console.log('\n💡 FIX: Network issue. Possible causes:');
  console.log('   1. CORS - Backend not allowing your domain');
  console.log('   2. Internet connection issue');
  console.log('   3. Backend server is down');
  console.log('   4. Browser extension blocking request');
});

console.log('');
console.log('⏳ Waiting for API response...');
console.log('');

// Step 4: Provide quick fixes
console.log('📋 STEP 4: Quick Fixes');
console.log('─────────────────────────────');
console.log('If the API test above fails, try these fixes:\n');

console.log('FIX 1: Use Swagger Token');
console.log('Copy this and replace YOUR_TOKEN with the token from Swagger:');
console.log('localStorage.setItem("token", "YOUR_TOKEN"); location.reload();');
console.log('');

console.log('FIX 2: Clear and Re-login');
console.log('localStorage.clear(); location.href = "/login";');
console.log('');

console.log('FIX 3: Check Backend Status');
console.log('fetch("https://agri-pos-backend-kwmi.onrender.com/api/health")');
console.log('  .then(r => r.json())');
console.log('  .then(d => console.log("Backend Status:", d))');
console.log('  .catch(e => console.log("Backend is DOWN:", e));');
console.log('');

console.log('FIX 4: Test with Working Token');
console.log('Use this token from your curl command:');
console.log('localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZGY2NjFmNTc5NTY3MzMzNDY1OGEyZiIsImlhdCI6MTc3ODE3MTQ3MSwiZXhwIjoxNzc4Nzc2MjcxfQ.1_FZHvlFavAgSzE7uuJ2B8P1TBocHJ94RUsm1S7wlYA");');
console.log('location.reload();');
console.log('');

console.log('─────────────────────────────');
console.log('🔧 Quick Fix Script Complete!');
console.log('─────────────────────────────');
