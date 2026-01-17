// Test specific equation 1041 functionality
// Using built-in fetch (Node.js 18+)

async function testEquation1041() {
    const baseUrl = 'http://localhost:5150';
    
    console.log('🧪 Testing Equation 1041 specifically...');
    
    try {
        // Test: Get equation 1041 directly
        console.log('\n1. Testing GET /api/equations/1041');
        const response = await fetch(`${baseUrl}/api/equations/1041`);
        
        if (response.ok) {
            const equation = await response.json();
            console.log('✅ Equation 1041 found:');
            console.log(`   ID: ${equation.id}`);
            console.log(`   Reactants: ${equation.reactants}`);
            console.log(`   Products: ${equation.products}`);
            console.log(`   Balanced: ${equation.balancedEquation}`);
            console.log(`   Condition: ${equation.condition}`);
            console.log(`   Level: ${equation.level}`);
            console.log(`   Tags: ${equation.tags}`);
            
            // Test search functionality that Angular would use
            console.log('\n2. Testing search for CaCO3 + HCl (like Angular would)');
            const allResponse = await fetch(`${baseUrl}/api/equations`);
            if (allResponse.ok) {
                const allEquations = await allResponse.json();
                
                // Simulate Angular search logic
                const reactant1 = 'caco3';
                const reactant2 = 'hcl';
                
                const results = allEquations.filter(eq => {
                    const reactants = eq.reactants.toLowerCase();
                    const hasReactant1 = reactants.includes(reactant1) || 
                                       reactant1.split(' ').some(word => reactants.includes(word));
                    const hasReactant2 = reactants.includes(reactant2) || 
                                       reactant2.split(' ').some(word => reactants.includes(word));
                    
                    return hasReactant1 && hasReactant2;
                });
                
                console.log(`✅ Search simulation found ${results.length} results`);
                if (results.length > 0) {
                    console.log('   First result:', results[0].id, '-', results[0].reactants);
                    const found1041 = results.find(r => r.id === 1041);
                    if (found1041) {
                        console.log('✅ Equation 1041 found in search results!');
                    } else {
                        console.log('❌ Equation 1041 NOT found in search results');
                    }
                } else {
                    console.log('❌ No results found for CaCO3 + HCl search');
                }
            }
            
        } else {
            console.log(`❌ Failed to get equation 1041: ${response.status} ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        console.log('\n💡 Make sure backend server is running on http://localhost:5150');
    }
}

testEquation1041();