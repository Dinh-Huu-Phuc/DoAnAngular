// Using built-in fetch (Node.js 18+)

async function testEquationAPI() {
    const baseUrl = 'http://localhost:5150';
    
    console.log('🧪 Testing Equation API...');
    
    try {
        // Test 1: Get all equations
        console.log('\n1. Testing GET /api/equations');
        const allEquationsResponse = await fetch(`${baseUrl}/api/equations`);
        
        if (allEquationsResponse.ok) {
            const equations = await allEquationsResponse.json();
            console.log(`✅ Found ${equations.length} equations`);
            
            // Check if equation 1041 exists
            const equation1041 = equations.find(eq => eq.id === 1041);
            if (equation1041) {
                console.log('✅ Equation 1041 found:', equation1041);
            } else {
                console.log('❌ Equation 1041 NOT found in response');
                console.log('Available IDs:', equations.map(eq => eq.id).slice(0, 10), '...');
            }
        } else {
            console.log(`❌ Failed to get equations: ${allEquationsResponse.status} ${allEquationsResponse.statusText}`);
        }
        
        // Test 2: Get specific equation by ID
        console.log('\n2. Testing GET /api/equations/1041');
        const specificResponse = await fetch(`${baseUrl}/api/equations/1041`);
        
        if (specificResponse.ok) {
            const equation = await specificResponse.json();
            console.log('✅ Equation 1041 details:', equation);
        } else {
            console.log(`❌ Failed to get equation 1041: ${specificResponse.status} ${specificResponse.statusText}`);
        }
        
        // Test 3: Search equations
        console.log('\n3. Testing search functionality');
        const searchResponse = await fetch(`${baseUrl}/api/equations/search?q=1041`);
        
        if (searchResponse.ok) {
            const results = await searchResponse.json();
            console.log('✅ Search results:', results);
        } else {
            console.log(`❌ Search failed: ${searchResponse.status} ${searchResponse.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        console.log('\n💡 Make sure backend server is running on http://localhost:5150');
    }
}

testEquationAPI();