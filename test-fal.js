const { fal } = require('@fal-ai/client');

// Set FAL API key
process.env.FAL_KEY = '03c9ee28-16c8-4298-ada8-a6cba2de94be:112a61e5bab77062736544e5ef9b2141';

async function testFALAI() {
  try {
    console.log('Testing FAL AI integration...');
    
    const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
      input: {
        prompt: "Make this image more vibrant and colorful",
        image_url: "https://v3.fal.media/files/rabbit/rmgBxhwGYb2d3pl3x9sKf_output.png"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log('✅ FAL AI test successful!');
    console.log('Response data:', result.data);
    console.log('Request ID:', result.requestId);
    
  } catch (error) {
    console.error('❌ FAL AI test failed:', error.message);
  }
}

testFALAI(); 