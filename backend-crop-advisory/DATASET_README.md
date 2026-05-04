# Crop Disease Dataset Integration

## Overview
This implementation uses a comprehensive crop disease dataset based on real agricultural research from:
- PlantVillage Dataset
- ICAR (Indian Council of Agricultural Research)
- Pakistan Agricultural Research Council
- FAO Crop Disease Management Guidelines

## Features

### 1. Real Dataset Coverage
- **9 Major Crops**: Onion, Wheat, Rice, Cotton, Tomato, Potato, Sugarcane, Maize
- **20+ Diseases/Pests**: Common issues affecting Pakistani agriculture
- **Accurate Information**: Based on peer-reviewed agricultural research

### 2. Smart Fallback System
- **Primary**: Uses Google Gemini AI for image analysis and text-based diagnosis
- **Fallback**: Uses dataset when AI fails or API key is invalid
- **Symptom Matching**: Intelligent matching of user-described symptoms to diseases

### 3. Dataset Structure
Each disease entry contains:
- Name and symptoms
- Detailed diagnosis
- Severity level (Low/Medium/High/Critical)
- Recommended products (Pakistan-available pesticides/fungicides)
- Dosage per acre
- Application method
- Safety interval before harvest
- Alternative products
- Prevention tips
- Urgency timeline

## How It Works

### Image Detection Flow
1. User uploads crop image
2. Backend tries Gemini Vision AI
3. If AI fails → Returns "Unable to detect from image" with no product recommendations
4. Frontend shows warning message asking user to select issue manually

### Manual Selection Flow
1. User selects crop and issue
2. Backend tries Gemini AI with text prompt
3. If AI fails → Uses dataset to find matching disease
4. Returns accurate recommendations from dataset

### Symptom-Based Detection
1. User describes symptoms (e.g., "yellow spots on leaves")
2. System searches dataset for matching symptoms
3. Returns best matching disease with recommendations

## Configuration

### Environment Variables
```env
GEMINI_API_KEY=your_api_key_here
```

If API key is not set or invalid, system automatically uses dataset fallback.

## Dataset Expansion

To add more diseases, edit `backend-crop-advisory/data/cropDiseaseDataset.js`:

```javascript
cropName: [
  {
    name: "Disease Name",
    symptoms: ["symptom1", "symptom2"],
    diagnosis: "Detailed diagnosis",
    severity: "Medium",
    products: ["Product 1", "Product 2"],
    dosage: "Amount per acre",
    applicationMethod: "How to apply",
    safetyInterval: "Days before harvest",
    alternatives: ["Alt 1", "Alt 2"],
    preventionTips: ["Tip 1", "Tip 2"],
    urgency: "Timeline"
  }
]
```

## Benefits

1. **No Dependency on AI**: Works even without API key
2. **Accurate Data**: Based on real agricultural research
3. **Pakistan-Specific**: Products and recommendations for Pakistani farmers
4. **Offline Capable**: Dataset is local, no external API needed for fallback
5. **Cost-Effective**: Reduces AI API calls by using dataset intelligently

## Future Enhancements

1. Add more crops (Mango, Citrus, Vegetables)
2. Include regional variations
3. Add seasonal disease patterns
4. Integrate with local pesticide availability database
5. Multi-language support (Urdu, Punjabi)

## Data Sources

- PlantVillage: https://plantvillage.psu.edu/
- ICAR: https://icar.org.in/
- PARC: https://www.parc.gov.pk/
- FAO: http://www.fao.org/agriculture/crops/
