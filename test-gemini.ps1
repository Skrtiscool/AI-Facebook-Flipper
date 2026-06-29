require('dotenv').config({ path: '.env.local' });
(async () => {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('Say hello in JSON only');
    console.log('Gemini response:', result.response.text());
  } catch(e) {
    console.error('Gemini error:', e.message);
  }
})();
