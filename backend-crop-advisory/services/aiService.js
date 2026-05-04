const { GoogleGenerativeAI } = require('@google/generative-ai');
const { findDiseaseBySymptoms, getDiseaseByName } = require('../data/cropDiseaseDataset');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Get crop advisory using AI or fallback to dataset
 */
async function getCropAdvisory(prompt, crop, issue, symptoms) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('AI Service Error:', error.message);
    return getDatasetFallback(crop, issue, symptoms);
  }
}

/**
 * Detect pest/disease from image using AI or fallback to dataset
 */
async function detectPestFromImage(imageBase64, crop, symptoms) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    const prompt = `Analyze this ${crop} crop image and identify any pest or disease. Provide response in JSON format:
{
  "detectedIssue": "Disease/Pest name",
  "confidence": "High|Medium|Low",
  "diagnosis": "Brief diagnosis",
  "severity": "Low|Medium|High|Critical",
  "products": ["Product 1", "Product 2"],
  "dosage": "Dosage per acre",
  "applicationMethod": "How to apply",
  "safetyInterval": "Days before harvest",
  "alternatives": ["Alt 1", "Alt 2"],
  "preventionTips": ["Tip 1", "Tip 2"],
  "urgency": "Action timeline"
}`;

    const imageParts = [{
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    }];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.confidence === 'Low' || !data.detectedIssue) {
        throw new Error('Low confidence detection');
      }
      return data;
    }
    
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('Image Detection Error:', error.message);
    
    return {
      detectedIssue: "Unable to detect from image",
      confidence: "Low",
      diagnosis: `Image analysis failed. Please select the issue manually or provide more details about symptoms on your ${crop} crop.`,
      severity: "Medium",
      urgency: "Consult with agronomist for accurate diagnosis",
      aiError: true,
      errorMessage: error.message
    };
  }
}

/**
 * Get recommendation from dataset when AI fails
 */
function getDatasetFallback(crop, issue, symptoms) {
  let diseaseData;
  
  if (symptoms && symptoms.trim()) {
    diseaseData = findDiseaseBySymptoms(crop, symptoms);
  } else {
    diseaseData = getDiseaseByName(crop, issue);
  }

  if (!diseaseData) {
    return {
      diagnosis: `Unable to find specific information for ${issue} in ${crop}. Please consult with a local agronomist.`,
      severity: "Medium",
      products: [],
      dosage: "Consult agronomist",
      applicationMethod: "Consult agronomist",
      safetyInterval: "Consult agronomist",
      alternatives: [],
      preventionTips: ["Regular field monitoring", "Maintain field hygiene", "Consult local agricultural extension"],
      urgency: "Seek professional advice",
      datasetFallback: true
    };
  }

  return {
    diagnosis: diseaseData.diagnosis,
    severity: diseaseData.severity,
    products: diseaseData.products,
    dosage: diseaseData.dosage,
    applicationMethod: diseaseData.applicationMethod,
    safetyInterval: diseaseData.safetyInterval,
    alternatives: diseaseData.alternatives,
    preventionTips: diseaseData.preventionTips,
    urgency: diseaseData.urgency,
    datasetFallback: true
  };
}

module.exports = {
  getCropAdvisory,
  detectPestFromImage
};
