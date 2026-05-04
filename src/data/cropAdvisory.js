// Comprehensive crop database for Pakistan agriculture
export const CROPS = [
  { id: 'cotton', name: 'Cotton', icon: '🌱', season: 'Kharif', sowingMonths: [4, 5, 6] },
  { id: 'wheat', name: 'Wheat', icon: '🌾', season: 'Rabi', sowingMonths: [10, 11, 12] },
  { id: 'rice', name: 'Rice', icon: '🌾', season: 'Kharif', sowingMonths: [5, 6, 7] },
  { id: 'sugarcane', name: 'Sugarcane', icon: '🎋', season: 'Year-round', sowingMonths: [2, 3, 9, 10] },
  { id: 'maize', name: 'Maize', icon: '🌽', season: 'Both', sowingMonths: [2, 3, 7, 8] },
  { id: 'tomato', name: 'Tomato', icon: '🍅', season: 'Both', sowingMonths: [1, 2, 8, 9] },
  { id: 'potato', name: 'Potato', icon: '🥔', season: 'Rabi', sowingMonths: [10, 11] },
  { id: 'onion', name: 'Onion', icon: '🧅', season: 'Rabi', sowingMonths: [10, 11, 12] },
  { id: 'mango', name: 'Mango', icon: '🥭', season: 'Perennial', sowingMonths: [] },
  { id: 'citrus', name: 'Citrus', icon: '🍊', season: 'Perennial', sowingMonths: [] },
  { id: 'chili', name: 'Chili', icon: '🌶️', season: 'Both', sowingMonths: [2, 3, 8, 9] },
  { id: 'okra', name: 'Okra', icon: '🫛', season: 'Kharif', sowingMonths: [2, 3, 4] },
];

// Common pests and diseases by crop
export const PEST_DISEASE_DATABASE = {
  cotton: [
    { id: 'whitefly', name: 'White Fly', type: 'pest', severity: 'High', symptoms: ['Yellowing leaves', 'Sticky honeydew', 'Sooty mold'] },
    { id: 'bollworm', name: 'Pink Bollworm', type: 'pest', severity: 'Critical', symptoms: ['Damaged bolls', 'Pink larvae inside', 'Reduced yield'] },
    { id: 'leafcurl', name: 'Leaf Curl Virus', type: 'disease', severity: 'High', symptoms: ['Curled leaves', 'Stunted growth', 'Yellowing'] },
    { id: 'aphids', name: 'Aphids', type: 'pest', severity: 'Medium', symptoms: ['Curled leaves', 'Sticky residue', 'Stunted growth'] },
  ],
  wheat: [
    { id: 'rust', name: 'Rust Disease', type: 'disease', severity: 'High', symptoms: ['Orange pustules', 'Leaf yellowing', 'Reduced grain'] },
    { id: 'aphids', name: 'Aphids', type: 'pest', severity: 'Medium', symptoms: ['Sticky leaves', 'Stunted growth'] },
    { id: 'smut', name: 'Loose Smut', type: 'disease', severity: 'Medium', symptoms: ['Black spores', 'Destroyed grain'] },
    { id: 'armyworm', name: 'Armyworm', type: 'pest', severity: 'High', symptoms: ['Leaf damage', 'Defoliation'] },
  ],
  rice: [
    { id: 'stemborer', name: 'Stem Borer', type: 'pest', severity: 'High', symptoms: ['Dead hearts', 'White heads', 'Stem tunneling'] },
    { id: 'blast', name: 'Blast Disease', type: 'disease', severity: 'Critical', symptoms: ['Diamond-shaped lesions', 'Neck rot', 'Panicle blast'] },
    { id: 'bph', name: 'Brown Plant Hopper', type: 'pest', severity: 'High', symptoms: ['Hopper burn', 'Yellowing', 'Plant death'] },
  ],
  tomato: [
    { id: 'earlyblight', name: 'Early Blight', type: 'disease', severity: 'High', symptoms: ['Dark spots with rings', 'Leaf yellowing', 'Defoliation'] },
    { id: 'lateblight', name: 'Late Blight', type: 'disease', severity: 'Critical', symptoms: ['Water-soaked lesions', 'White mold', 'Fruit rot'] },
    { id: 'fruitborer', name: 'Fruit Borer', type: 'pest', severity: 'High', symptoms: ['Holes in fruit', 'Larvae inside', 'Fruit drop'] },
  ],
};

// Product recommendations with dosages
export const PRODUCT_DATABASE = [
  {
    id: 'imidacloprid',
    name: 'Imidacloprid 200SL',
    category: 'Insecticide',
    type: 'Systemic',
    targetPests: ['whitefly', 'aphids', 'jassids', 'thrips'],
    dosage: { min: 150, max: 250, unit: 'ml/acre' },
    waterVolume: '80-100 liters/acre',
    safetyInterval: 14,
    price: 850,
    brands: ['Confidor', 'Imidor', 'Admire'],
  },
  {
    id: 'chlorpyrifos',
    name: 'Chlorpyrifos 40EC',
    category: 'Insecticide',
    type: 'Contact',
    targetPests: ['bollworm', 'stemborer', 'armyworm', 'cutworm'],
    dosage: { min: 500, max: 750, unit: 'ml/acre' },
    waterVolume: '100-120 liters/acre',
    safetyInterval: 21,
    price: 650,
    brands: ['Lorsban', 'Dursban', 'Pyrifos'],
  },
  {
    id: 'mancozeb',
    name: 'Mancozeb 80WP',
    category: 'Fungicide',
    type: 'Protective',
    targetDiseases: ['earlyblight', 'lateblight', 'rust', 'blast'],
    dosage: { min: 400, max: 600, unit: 'g/acre' },
    waterVolume: '100-120 liters/acre',
    safetyInterval: 7,
    price: 450,
    brands: ['Dithane', 'Indofil', 'Manzate'],
  },
  {
    id: 'cypermethrin',
    name: 'Cypermethrin 10EC',
    category: 'Insecticide',
    type: 'Contact',
    targetPests: ['bollworm', 'fruitborer', 'leafminer', 'caterpillar'],
    dosage: { min: 200, max: 300, unit: 'ml/acre' },
    waterVolume: '80-100 liters/acre',
    safetyInterval: 14,
    price: 550,
    brands: ['Ripcord', 'Cymbush', 'Cyperkill'],
  },
  {
    id: 'propiconazole',
    name: 'Propiconazole 25EC',
    category: 'Fungicide',
    type: 'Systemic',
    targetDiseases: ['rust', 'blast', 'powderymildew', 'leafspot'],
    dosage: { min: 200, max: 300, unit: 'ml/acre' },
    waterVolume: '100-120 liters/acre',
    safetyInterval: 14,
    price: 950,
    brands: ['Tilt', 'Bumper', 'Propicon'],
  },
  {
    id: 'acetamiprid',
    name: 'Acetamiprid 20SP',
    category: 'Insecticide',
    type: 'Systemic',
    targetPests: ['whitefly', 'aphids', 'jassids', 'thrips'],
    dosage: { min: 50, max: 80, unit: 'g/acre' },
    waterVolume: '80-100 liters/acre',
    safetyInterval: 7,
    price: 750,
    brands: ['Mospilan', 'Assail', 'Aceta'],
  },
  {
    id: 'emamectin',
    name: 'Emamectin Benzoate 5SG',
    category: 'Insecticide',
    type: 'Systemic',
    targetPests: ['bollworm', 'fruitborer', 'armyworm', 'leafminer'],
    dosage: { min: 80, max: 120, unit: 'g/acre' },
    waterVolume: '100-120 liters/acre',
    safetyInterval: 7,
    price: 1200,
    brands: ['Proclaim', 'Affirm', 'Emacot'],
  },
];

// Fertilizer recommendations
export const FERTILIZER_DATABASE = [
  {
    id: 'urea',
    name: 'Urea (46-0-0)',
    npk: '46-0-0',
    dosage: { cotton: 50, wheat: 60, rice: 55, maize: 50 },
    unit: 'kg/acre',
    timing: ['Basal', 'First irrigation', 'Flowering'],
    price: 2800,
  },
  {
    id: 'dap',
    name: 'DAP (18-46-0)',
    npk: '18-46-0',
    dosage: { cotton: 50, wheat: 50, rice: 40, maize: 50 },
    unit: 'kg/acre',
    timing: ['Basal application'],
    price: 6500,
  },
  {
    id: 'potash',
    name: 'Potash (0-0-60)',
    npk: '0-0-60',
    dosage: { cotton: 25, wheat: 20, rice: 20, maize: 25 },
    unit: 'kg/acre',
    timing: ['Basal', 'Flowering'],
    price: 4200,
  },
  {
    id: 'npk',
    name: 'NPK (15-15-15)',
    npk: '15-15-15',
    dosage: { tomato: 40, potato: 50, onion: 40, chili: 35 },
    unit: 'kg/acre',
    timing: ['Basal', 'Every 15 days'],
    price: 5500,
  },
];

// Crop calendar with growth stages
export const CROP_CALENDAR = {
  cotton: {
    duration: 180,
    stages: [
      { name: 'Sowing', days: '0-7', activities: ['Land preparation', 'Seed treatment', 'Sowing'] },
      { name: 'Germination', days: '7-15', activities: ['Irrigation', 'Weed control'] },
      { name: 'Vegetative', days: '15-60', activities: ['Fertilizer application', 'Pest monitoring', 'Thinning'] },
      { name: 'Flowering', days: '60-90', activities: ['Pest control', 'Irrigation', 'Fertilizer'] },
      { name: 'Boll Formation', days: '90-150', activities: ['Pest control', 'Irrigation management'] },
      { name: 'Maturity', days: '150-180', activities: ['Stop irrigation', 'Harvest preparation'] },
    ],
    criticalPeriods: ['Flowering (60-90 days)', 'Boll formation (90-120 days)'],
  },
  wheat: {
    duration: 120,
    stages: [
      { name: 'Sowing', days: '0-7', activities: ['Land preparation', 'Seed treatment', 'Sowing'] },
      { name: 'Germination', days: '7-15', activities: ['First irrigation', 'Weed control'] },
      { name: 'Tillering', days: '15-45', activities: ['Fertilizer application', 'Irrigation'] },
      { name: 'Stem Elongation', days: '45-75', activities: ['Pest monitoring', 'Disease control'] },
      { name: 'Heading', days: '75-90', activities: ['Irrigation', 'Pest control'] },
      { name: 'Grain Filling', days: '90-120', activities: ['Final irrigation', 'Harvest preparation'] },
    ],
    criticalPeriods: ['Tillering (15-45 days)', 'Grain filling (90-120 days)'],
  },
  rice: {
    duration: 120,
    stages: [
      { name: 'Nursery', days: '0-25', activities: ['Seed treatment', 'Nursery preparation', 'Sowing'] },
      { name: 'Transplanting', days: '25-30', activities: ['Field preparation', 'Transplanting', 'Irrigation'] },
      { name: 'Vegetative', days: '30-60', activities: ['Fertilizer application', 'Weed control'] },
      { name: 'Reproductive', days: '60-90', activities: ['Pest control', 'Water management'] },
      { name: 'Ripening', days: '90-120', activities: ['Drain field', 'Harvest preparation'] },
    ],
    criticalPeriods: ['Transplanting (25-30 days)', 'Flowering (60-75 days)'],
  },
  tomato: {
    duration: 90,
    stages: [
      { name: 'Nursery', days: '0-25', activities: ['Seed sowing', 'Nursery care'] },
      { name: 'Transplanting', days: '25-30', activities: ['Field preparation', 'Transplanting'] },
      { name: 'Vegetative', days: '30-45', activities: ['Staking', 'Fertilizer', 'Irrigation'] },
      { name: 'Flowering', days: '45-60', activities: ['Pest control', 'Pollination support'] },
      { name: 'Fruiting', days: '60-90', activities: ['Harvesting', 'Disease control'] },
    ],
    criticalPeriods: ['Flowering (45-60 days)', 'Fruiting (60-90 days)'],
  },
};

// Weather-based recommendations
export const WEATHER_ADVISORIES = {
  highTemp: {
    threshold: 35,
    advisory: 'High temperature stress. Increase irrigation frequency. Apply spray in early morning or evening.',
    actions: ['Increase irrigation', 'Mulching', 'Evening spray only'],
  },
  lowTemp: {
    threshold: 10,
    advisory: 'Low temperature may slow growth. Avoid irrigation and spraying.',
    actions: ['Reduce irrigation', 'Postpone spraying', 'Monitor frost'],
  },
  highHumidity: {
    threshold: 80,
    advisory: 'High humidity increases disease risk. Apply preventive fungicides.',
    actions: ['Fungicide application', 'Improve ventilation', 'Monitor diseases'],
  },
  rain: {
    advisory: 'Rain expected. Postpone spraying. Ensure drainage.',
    actions: ['Postpone spray', 'Check drainage', 'Monitor waterlogging'],
  },
  wind: {
    threshold: 20,
    advisory: 'High wind speed. Avoid spraying to prevent drift.',
    actions: ['Postpone spray', 'Secure structures', 'Check for damage'],
  },
};

// Application methods
export const APPLICATION_METHODS = {
  foliarSpray: {
    name: 'Foliar Spray',
    description: 'Apply as spray on leaves and stems',
    bestTime: 'Early morning (6-9 AM) or evening (4-6 PM)',
    equipment: 'Knapsack sprayer or power sprayer',
    tips: ['Ensure complete coverage', 'Spray both sides of leaves', 'Avoid windy conditions'],
  },
  soilApplication: {
    name: 'Soil Application',
    description: 'Apply to soil around plant base',
    bestTime: 'Before irrigation',
    equipment: 'Manual or mechanical spreader',
    tips: ['Mix with soil', 'Irrigate after application', 'Avoid direct contact with stem'],
  },
  seedTreatment: {
    name: 'Seed Treatment',
    description: 'Treat seeds before sowing',
    bestTime: 'Before sowing',
    equipment: 'Mixing container',
    tips: ['Ensure uniform coating', 'Dry in shade', 'Sow within 24 hours'],
  },
  drip: {
    name: 'Drip/Fertigation',
    description: 'Apply through drip irrigation system',
    bestTime: 'During irrigation',
    equipment: 'Drip system with injector',
    tips: ['Flush system before and after', 'Monitor pH', 'Use water-soluble products'],
  },
};

// Safety precautions
export const SAFETY_PRECAUTIONS = [
  'Wear protective clothing, gloves, and mask during application',
  'Do not eat, drink, or smoke while handling pesticides',
  'Keep children and animals away from treated area',
  'Wash hands and face thoroughly after application',
  'Store pesticides in original containers in locked storage',
  'Dispose of empty containers properly',
  'Follow recommended dosage - more is not better',
  'Observe safety interval before harvest',
  'Do not spray near water sources',
  'Read product label carefully before use',
];
