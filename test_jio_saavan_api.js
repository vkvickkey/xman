import { jioSaavanAPI } from './src/jioSaavanApi.js';

// Test Jio Saavan API functionality
async function testJioSaavanAPI() {
  console.log('🎵 Testing Jio Saavan API Integration...\n');

  // Test 1: API Health Check
  console.log('1. Testing API health check...');
  try {
    const healthResults = await jioSaavanAPI.healthCheck();
    console.log('✅ API Health Results:');
    healthResults.forEach(result => {
      const status = result.status === 'healthy' ? '✅' : '❌';
      console.log(`  ${status} ${result.name}: ${result.url}`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Get Modules
  console.log('\n2. Testing modules endpoint...');
  try {
    const modules = await jioSaavanAPI.getModules('hindi');
    console.log(`✅ Modules loaded: ${modules.data?.length || 0} modules found`);
    if (modules.data?.length > 0) {
      console.log(`   First module: ${modules.data[0].title || modules.data[0].name || 'Unknown'}`);
    } else if (modules.status === 'Success') {
      console.log(`   API Response Status: ${modules.status}`);
      console.log(`   Message: ${modules.message}`);
    }
  } catch (error) {
    console.log('❌ Modules test failed:', error.message);
  }

  // Test 3: Search Songs
  console.log('\n3. Testing song search...');
  try {
    const searchResults = await jioSaavanAPI.searchSongs('tamil', 1, 5);
    const results = searchResults.data || searchResults.results || [];
    console.log(`✅ Search completed: ${results.length} songs found`);
    if (results.length > 0) {
      const firstSong = results[0];
      console.log(`   First song: ${firstSong.name || firstSong.title || 'Unknown'} by ${firstSong.primaryArtists || firstSong.artists || 'Unknown'}`);
    }
  } catch (error) {
    console.log('❌ Song search failed:', error.message);
  }

  // Test 4: Get Song Details
  console.log('\n4. Testing song details...');
  try {
    // First search for a song to get an ID
    const searchResults = await jioSaavanAPI.searchSongs('hindi', 1, 1);
    const results = searchResults.data || searchResults.results || [];
    if (results.length > 0) {
      const songId = results[0].id;
      const songDetails = await jioSaavanAPI.getSongDetails(songId);
      const songData = songDetails.data?.[0] || songDetails.data || songDetails;
      console.log(`✅ Song details retrieved for: ${songData.name || songData.title || 'Unknown'}`);
      console.log(`   Album: ${songData.album?.name || songData.album || 'Unknown'}`);
      console.log(`   Duration: ${songData.duration || 'Unknown'}`);
    } else {
      console.log('⚠️ No songs found to test details');
    }
  } catch (error) {
    console.log('❌ Song details failed:', error.message);
  }

  // Test 5: Get Trending Songs
  console.log('\n5. Testing trending songs...');
  try {
    const trending = await jioSaavanAPI.getTrendingSongs('english', 1, 3);
    const results = trending.data || trending.results || [];
    console.log(`✅ Trending songs: ${results.length} found`);
    if (results.length > 0) {
      console.log(`   First trending: ${results[0].name || results[0].title || 'Unknown'}`);
    }
  } catch (error) {
    console.log('❌ Trending songs failed:', error.message);
  }

  // Test 6: Get New Releases
  console.log('\n6. Testing new releases...');
  try {
    const newReleases = await jioSaavanAPI.getNewReleases('punjabi', 1, 3);
    const results = newReleases.data || newReleases.results || [];
    console.log(`✅ New releases: ${results.length} found`);
    if (results.length > 0) {
      console.log(`   First new release: ${results[0].name || results[0].title || 'Unknown'}`);
    }
  } catch (error) {
    console.log('❌ New releases failed:', error.message);
  }

  // Test 7: API Switching
  console.log('\n7. Testing API switching...');
  try {
    const originalAPI = jioSaavanAPI.getCurrentAPI();
    console.log(`   Original API: ${originalAPI.name}`);
    
    // Switch to alternative 1
    if (jioSaavanAPI.switchToAlternative(1)) {
      const switchedAPI = jioSaavanAPI.getCurrentAPI();
      console.log(`✅ Switched to: ${switchedAPI.name}`);
      
      // Test a request with the new API
      const testResult = await jioSaavanAPI.getModules('tamil');
      console.log(`✅ Request successful with alternative API: ${testResult.data?.length || 0} modules`);
      
      // Reset to primary
      jioSaavanAPI.resetToPrimary();
      const resetAPI = jioSaavanAPI.getCurrentAPI();
      console.log(`✅ Reset to: ${resetAPI.name}`);
    } else {
      console.log('⚠️ Could not switch to alternative API');
    }
  } catch (error) {
    console.log('❌ API switching failed:', error.message);
  }

  // Test 8: API Status
  console.log('\n8. Getting API status...');
  try {
    const status = jioSaavanAPI.getAPIStatus();
    console.log('✅ API Status:');
    console.log(`   Current: ${status.current.name} (index: ${status.current.index})`);
    console.log(`   Available APIs: ${1 + status.availableAPIs.alternatives.length}`);
    console.log(`   Failed attempts: ${Object.keys(status.failedAttempts).length}`);
  } catch (error) {
    console.log('❌ API status failed:', error.message);
  }

  console.log('\n🎉 Jio Saavan API testing completed!');
}

// Test different languages
async function testLanguages() {
  console.log('\n🌍 Testing different languages...\n');
  
  const languages = ['hindi', 'english', 'punjabi', 'tamil', 'telugu'];
  
  for (const lang of languages) {
    try {
      const modules = await jioSaavanAPI.getModules(lang);
      console.log(`✅ ${lang}: ${modules.data?.length || 0} modules`);
    } catch (error) {
      console.log(`❌ ${lang}: Failed - ${error.message}`);
    }
  }
}

// Test API fallback mechanism
async function testAPIFallback() {
  console.log('\n🔄 Testing API fallback mechanism...\n');
  
  // Test with a potentially failing endpoint
  try {
    console.log('Testing search with automatic fallback...');
    const results = await jioSaavanAPI.searchSongs('bollywood', 1, 5);
    console.log(`✅ Search successful: ${results.data?.results?.length || 0} results`);
    console.log(`   Using API: ${jioSaavanAPI.getCurrentAPI().name}`);
  } catch (error) {
    console.log('❌ Fallback test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testJioSaavanAPI();
  await testLanguages();
  await testAPIFallback();
}

// Execute tests
runAllTests().catch(console.error);
