/**
 * Comprehensive Crop Disease Dataset
 * Based on PlantVillage, ICAR, and Pakistan Agricultural Research datasets
 */

const CROP_DISEASE_DATASET = {
  // ONION DISEASES
  onion: [
    {
      name: "Purple Blotch",
      symptoms: ["purple spots on leaves", "dark lesions", "leaf blight", "purple patches"],
      diagnosis: "Purple Blotch is a fungal disease caused by Alternaria porri. It appears as purple-brown spots with concentric rings on leaves and stems.",
      severity: "High",
      products: ["Mancozeb 75% WP", "Chlorothalonil 75% WP", "Azoxystrobin 23% SC"],
      dosage: "400-500g per acre",
      applicationMethod: "Foliar spray at 10-15 day intervals. Apply in early morning or evening. Ensure complete coverage of leaves and stems.",
      safetyInterval: "7-10 days before harvest",
      alternatives: ["Copper Oxychloride 50% WP", "Propineb 70% WP"],
      preventionTips: [
        "Use disease-free seeds and bulbs",
        "Maintain proper spacing (15cm between plants)",
        "Avoid overhead irrigation",
        "Remove and destroy infected plant debris",
        "Crop rotation with non-allium crops"
      ],
      urgency: "Apply within 2-3 days of symptom appearance"
    },
    {
      name: "Stemphylium Leaf Blight",
      symptoms: ["yellow spots", "leaf yellowing", "brown lesions", "wilting leaves"],
      diagnosis: "Stemphylium Leaf Blight is caused by Stemphylium vesicarium. Small yellow spots enlarge to brown lesions with yellow halos.",
      severity: "Medium",
      products: ["Mancozeb 75% WP", "Iprodione 50% WP", "Difenoconazole 25% EC"],
      dosage: "300-400g per acre",
      applicationMethod: "Spray at first sign of disease. Repeat every 7-10 days. Apply during cool hours.",
      safetyInterval: "10-14 days before harvest",
      alternatives: ["Tebuconazole 25% EC", "Carbendazim 50% WP"],
      preventionTips: [
        "Plant resistant varieties",
        "Ensure good air circulation",
        "Avoid water stress",
        "Regular field monitoring",
        "Balanced fertilization"
      ],
      urgency: "Apply within 3-5 days"
    },
    {
      name: "Thrips Infestation",
      symptoms: ["silvery streaks", "leaf curling", "stunted growth", "white patches on leaves"],
      diagnosis: "Thrips are tiny insects that feed on onion leaves causing silvery streaks and distorted growth. Heavy infestations can reduce bulb size.",
      severity: "Medium",
      products: ["Imidacloprid 17.8% SL", "Acetamiprid 20% SP", "Spinosad 45% SC"],
      dosage: "100-150ml per acre",
      applicationMethod: "Foliar spray covering both leaf surfaces. Apply early morning. Repeat after 10-12 days if needed.",
      safetyInterval: "14 days before harvest",
      alternatives: ["Fipronil 5% SC", "Thiamethoxam 25% WG"],
      preventionTips: [
        "Use blue sticky traps for monitoring",
        "Remove weeds around field",
        "Avoid over-fertilization with nitrogen",
        "Maintain field hygiene",
        "Use reflective mulches"
      ],
      urgency: "Apply within 5-7 days"
    }
  ],

  // WHEAT DISEASES
  wheat: [
    {
      name: "Leaf Rust",
      symptoms: ["orange pustules", "rust spots", "yellow leaves", "brown spots on leaves"],
      diagnosis: "Leaf Rust (Puccinia triticina) appears as small orange-brown pustules on leaves. Can cause significant yield loss if not controlled.",
      severity: "High",
      products: ["Propiconazole 25% EC", "Tebuconazole 25% EC", "Azoxystrobin + Tebuconazole"],
      dosage: "200-250ml per acre",
      applicationMethod: "Spray at first appearance of rust. Apply thoroughly covering all leaf surfaces. Repeat after 15 days if needed.",
      safetyInterval: "21 days before harvest",
      alternatives: ["Mancozeb 75% WP", "Sulfur 80% WP"],
      preventionTips: [
        "Plant resistant varieties",
        "Timely sowing",
        "Balanced fertilization",
        "Remove volunteer wheat plants",
        "Monitor fields regularly"
      ],
      urgency: "Apply immediately upon detection"
    },
    {
      name: "Aphid Infestation",
      symptoms: ["sticky leaves", "curled leaves", "black sooty mold", "yellowing"],
      diagnosis: "Aphids suck plant sap causing yellowing, curling, and stunted growth. They also transmit viral diseases.",
      severity: "Medium",
      products: ["Imidacloprid 17.8% SL", "Thiamethoxam 25% WG", "Acetamiprid 20% SP"],
      dosage: "100ml per acre",
      applicationMethod: "Spray when aphid population reaches threshold. Cover entire plant. Repeat after 10 days if needed.",
      safetyInterval: "15 days before harvest",
      alternatives: ["Dimethoate 30% EC", "Lambda-cyhalothrin 5% EC"],
      preventionTips: [
        "Early sowing to avoid peak aphid season",
        "Conserve natural enemies",
        "Remove alternate hosts",
        "Use yellow sticky traps",
        "Avoid excessive nitrogen"
      ],
      urgency: "Apply within 3-5 days"
    }
  ],

  // RICE DISEASES
  rice: [
    {
      name: "Bacterial Leaf Blight",
      symptoms: ["water-soaked lesions", "yellowing leaves", "wilting", "leaf tips dying"],
      diagnosis: "Bacterial Leaf Blight (Xanthomonas oryzae) causes water-soaked lesions that turn yellow then brown. Severe cases cause complete leaf death.",
      severity: "Critical",
      products: ["Copper Oxychloride 50% WP", "Streptocycline 9% + Tetracycline 1%", "Validamycin 3% L"],
      dosage: "500g per acre",
      applicationMethod: "Spray at tillering and booting stage. Ensure good coverage. Repeat every 10 days for 2-3 applications.",
      safetyInterval: "14 days before harvest",
      alternatives: ["Bordeaux mixture", "Copper hydroxide 77% WP"],
      preventionTips: [
        "Use certified disease-free seeds",
        "Avoid excessive nitrogen fertilizer",
        "Maintain proper water management",
        "Remove infected plants",
        "Plant resistant varieties"
      ],
      urgency: "Apply immediately - disease spreads rapidly"
    },
    {
      name: "Brown Plant Hopper",
      symptoms: ["hopper burn", "yellowing plants", "stunted growth", "plant drying"],
      diagnosis: "Brown Plant Hopper sucks sap from rice plants causing 'hopper burn' - yellowing and drying of plants from base upward.",
      severity: "High",
      products: ["Imidacloprid 17.8% SL", "Buprofezin 25% SC", "Pymetrozine 50% WG"],
      dosage: "150ml per acre",
      applicationMethod: "Spray targeting lower parts of plants. Apply when population reaches 5-10 hoppers per hill. Repeat after 15 days.",
      safetyInterval: "21 days before harvest",
      alternatives: ["Thiamethoxam 25% WG", "Dinotefuran 20% SG"],
      preventionTips: [
        "Avoid continuous flooding",
        "Remove weeds and alternate hosts",
        "Avoid excessive nitrogen",
        "Use light traps for monitoring",
        "Maintain balanced fertilization"
      ],
      urgency: "Apply within 2-3 days"
    }
  ],

  // COTTON DISEASES
  cotton: [
    {
      name: "Cotton Leaf Curl Virus",
      symptoms: ["leaf curling", "vein thickening", "stunted growth", "small leaves"],
      diagnosis: "Cotton Leaf Curl Virus (CLCuV) transmitted by whiteflies. Causes severe leaf curling, vein thickening, and stunted plant growth.",
      severity: "Critical",
      products: ["Imidacloprid 17.8% SL", "Thiamethoxam 25% WG", "Acetamiprid 20% SP"],
      dosage: "200ml per acre (for whitefly control)",
      applicationMethod: "Spray for whitefly vector control. Apply at 15-day intervals. Cover both leaf surfaces thoroughly.",
      safetyInterval: "21 days before harvest",
      alternatives: ["Spiromesifen 22.9% SC", "Pyriproxyfen 10% EC"],
      preventionTips: [
        "Plant CLCuV-resistant varieties",
        "Remove infected plants immediately",
        "Control whitefly population",
        "Avoid late sowing",
        "Maintain field sanitation"
      ],
      urgency: "Immediate action required - remove infected plants"
    },
    {
      name: "Pink Bollworm",
      symptoms: ["boll damage", "holes in bolls", "pink larvae inside", "rosette flowers"],
      diagnosis: "Pink Bollworm larvae bore into cotton bolls causing damage and reducing lint quality. Major pest of cotton.",
      severity: "High",
      products: ["Chlorantraniliprole 18.5% SC", "Emamectin Benzoate 5% SG", "Spinosad 45% SC"],
      dosage: "80-100ml per acre",
      applicationMethod: "Spray at flower initiation and boll formation. Target flowers and young bolls. Repeat every 15 days.",
      safetyInterval: "21 days before harvest",
      alternatives: ["Indoxacarb 14.5% SC", "Flubendiamide 39.35% SC"],
      preventionTips: [
        "Use pheromone traps for monitoring",
        "Destroy crop residues after harvest",
        "Avoid ratoon cropping",
        "Timely picking of bolls",
        "Plant Bt cotton varieties"
      ],
      urgency: "Apply within 3-5 days"
    }
  ],

  // TOMATO DISEASES
  tomato: [
    {
      name: "Early Blight",
      symptoms: ["dark spots with rings", "target-like lesions", "yellowing leaves", "leaf drop"],
      diagnosis: "Early Blight (Alternaria solani) causes dark brown spots with concentric rings on older leaves. Can cause significant defoliation.",
      severity: "Medium",
      products: ["Mancozeb 75% WP", "Chlorothalonil 75% WP", "Azoxystrobin 23% SC"],
      dosage: "400g per acre",
      applicationMethod: "Begin spraying at first sign of disease. Apply every 7-10 days. Ensure good coverage of lower leaves.",
      safetyInterval: "7 days before harvest",
      alternatives: ["Copper Oxychloride 50% WP", "Difenoconazole 25% EC"],
      preventionTips: [
        "Use disease-free transplants",
        "Mulch to prevent soil splash",
        "Proper spacing for air circulation",
        "Remove infected leaves",
        "Crop rotation"
      ],
      urgency: "Apply within 3-5 days"
    },
    {
      name: "Whitefly and Tomato Yellow Leaf Curl",
      symptoms: ["yellowing leaves", "leaf curling", "stunted growth", "small fruits"],
      diagnosis: "Whiteflies transmit Tomato Yellow Leaf Curl Virus causing severe leaf curling, yellowing, and reduced fruit production.",
      severity: "High",
      products: ["Imidacloprid 17.8% SL", "Spiromesifen 22.9% SC", "Pyriproxyfen 10% EC"],
      dosage: "150ml per acre",
      applicationMethod: "Spray undersides of leaves where whiteflies congregate. Apply every 10-12 days. Alternate products to prevent resistance.",
      safetyInterval: "14 days before harvest",
      alternatives: ["Thiamethoxam 25% WG", "Diafenthiuron 50% WP"],
      preventionTips: [
        "Use yellow sticky traps",
        "Plant virus-resistant varieties",
        "Remove infected plants",
        "Use insect-proof nets",
        "Maintain field hygiene"
      ],
      urgency: "Apply within 2-3 days"
    }
  ],

  // POTATO DISEASES
  potato: [
    {
      name: "Late Blight",
      symptoms: ["water-soaked spots", "white mold", "brown lesions", "rotting tubers"],
      diagnosis: "Late Blight (Phytophthora infestans) is the most destructive potato disease. Causes rapid leaf and tuber rot in humid conditions.",
      severity: "Critical",
      products: ["Metalaxyl 8% + Mancozeb 64% WP", "Cymoxanil 8% + Mancozeb 64% WP", "Dimethomorph 50% WP"],
      dosage: "500g per acre",
      applicationMethod: "Preventive sprays every 7-10 days during favorable conditions. Ensure complete coverage. Increase frequency during rainy weather.",
      safetyInterval: "14 days before harvest",
      alternatives: ["Copper Oxychloride 50% WP", "Propineb 70% WP"],
      preventionTips: [
        "Plant certified disease-free seed",
        "Avoid overhead irrigation",
        "Proper hilling to protect tubers",
        "Remove volunteer plants",
        "Destroy infected plants immediately"
      ],
      urgency: "Immediate action - disease spreads rapidly in 24-48 hours"
    }
  ],

  // SUGARCANE DISEASES
  sugarcane: [
    {
      name: "Red Rot",
      symptoms: ["reddening of stalks", "wilting", "drying leaves", "sour smell"],
      diagnosis: "Red Rot (Colletotrichum falcatum) causes internal reddening of stalks with white patches. Severely affects sugar content and yield.",
      severity: "Critical",
      products: ["Carbendazim 50% WP", "Propiconazole 25% EC", "Copper Oxychloride 50% WP"],
      dosage: "300g per acre",
      applicationMethod: "Spray at early stage. Treat seed setts before planting. Remove and burn infected plants.",
      safetyInterval: "Not applicable for sugarcane",
      alternatives: ["Thiophanate Methyl 70% WP", "Hexaconazole 5% EC"],
      preventionTips: [
        "Use disease-free seed material",
        "Plant resistant varieties",
        "Treat setts with fungicide before planting",
        "Proper drainage",
        "Roguing of infected plants"
      ],
      urgency: "Immediate removal of infected plants required"
    }
  ],

  // MAIZE DISEASES
  maize: [
    {
      name: "Maize Leaf Blight",
      symptoms: ["long gray lesions", "leaf blight", "dead leaves", "reduced yield"],
      diagnosis: "Northern Corn Leaf Blight (Exserohilum turcicum) causes long cigar-shaped gray-green lesions on leaves.",
      severity: "Medium",
      products: ["Mancozeb 75% WP", "Propiconazole 25% EC", "Azoxystrobin 23% SC"],
      dosage: "400g per acre",
      applicationMethod: "Spray at first appearance of symptoms. Repeat after 15 days if disease persists.",
      safetyInterval: "21 days before harvest",
      alternatives: ["Carbendazim 50% WP", "Tebuconazole 25% EC"],
      preventionTips: [
        "Plant resistant hybrids",
        "Crop rotation",
        "Remove crop debris",
        "Balanced fertilization",
        "Proper plant spacing"
      ],
      urgency: "Apply within 5-7 days"
    },
    {
      name: "Fall Armyworm",
      symptoms: ["holes in leaves", "larvae in whorl", "defoliation", "damaged cobs"],
      diagnosis: "Fall Armyworm (Spodoptera frugiperda) larvae feed on leaves and can cause complete defoliation. Major emerging pest.",
      severity: "High",
      products: ["Chlorantraniliprole 18.5% SC", "Emamectin Benzoate 5% SG", "Spinetoram 11.7% SC"],
      dosage: "80ml per acre",
      applicationMethod: "Spray targeting whorl and young larvae. Apply early morning or evening. Repeat after 10 days if needed.",
      safetyInterval: "21 days before harvest",
      alternatives: ["Lambda-cyhalothrin 5% EC", "Profenofos 50% EC"],
      preventionTips: [
        "Regular field scouting",
        "Use pheromone traps",
        "Hand-pick egg masses and larvae",
        "Deep plowing after harvest",
        "Intercropping with pulses"
      ],
      urgency: "Apply within 2-3 days - larvae grow rapidly"
    }
  ]
};

function findDiseaseBySymptoms(crop, symptoms) {
  const cropDiseases = CROP_DISEASE_DATASET[crop.toLowerCase()];
  if (!cropDiseases) return null;

  const symptomLower = symptoms.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;

  for (const disease of cropDiseases) {
    let score = 0;
    for (const symptom of disease.symptoms) {
      if (symptomLower.includes(symptom.toLowerCase())) {
        score += 2;
      }
    }
    if (symptomLower.includes(disease.name.toLowerCase())) {
      score += 5;
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = disease;
    }
  }

  return maxScore > 0 ? bestMatch : cropDiseases[0];
}

function getDiseaseByName(crop, diseaseName) {
  const cropDiseases = CROP_DISEASE_DATASET[crop.toLowerCase()];
  if (!cropDiseases) return null;
  return cropDiseases.find(d => d.name.toLowerCase() === diseaseName.toLowerCase()) || cropDiseases[0];
}

function getAllDiseasesForCrop(crop) {
  return CROP_DISEASE_DATASET[crop.toLowerCase()] || [];
}

module.exports = {
  CROP_DISEASE_DATASET,
  findDiseaseBySymptoms,
  getDiseaseByName,
  getAllDiseasesForCrop
};
