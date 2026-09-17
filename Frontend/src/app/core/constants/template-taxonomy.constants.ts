export interface SubCategoryInfo {
  name: string;
  icon: string;
  defaultSubtitle: string;
}

export interface MainCategoryInfo {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  badgeClass: string;
  colorAccent: string;
  themeClass: string;
  subSummary: string;
  subCategories: SubCategoryInfo[];
}

export const TEMPLATE_TAXONOMY: MainCategoryInfo[] = [
  {
    id: 'TRADITIONAL',
    name: 'Célébrations Traditionnelles & Culturelles',
    shortName: 'Tradition & Culture',
    icon: 'fa-heart',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    colorAccent: '#e11d48',
    themeClass: 'theme-traditional',
    subSummary: 'Mariage, Fiançailles, Circoncision, Henné...',
    subCategories: [
      { name: 'Mariage', icon: 'fa-ring', defaultSubtitle: 'Le Mariage de' },
      { name: 'Fiançailles', icon: 'fa-gem', defaultSubtitle: 'Les Fiançailles de' },
      { name: 'Circoncision', icon: 'fa-crown', defaultSubtitle: 'La Célébration de Circoncision de' },
      { name: 'Henné & Coutumes', icon: 'fa-hand-sparkles', defaultSubtitle: 'Soirée Henné de' }
    ]
  },
  {
    id: 'FAMILY',
    name: 'Événements & Fêtes de Famille',
    shortName: 'Famille & Fêtes',
    icon: 'fa-cake-candles',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    colorAccent: '#d97706',
    themeClass: 'theme-family',
    subSummary: 'Baby Shower, Anniversaire, Diplôme...',
    subCategories: [
      { name: 'Baby Shower & Naissance', icon: 'fa-baby', defaultSubtitle: 'Baby Shower de' },
      { name: 'Anniversaire', icon: 'fa-birthday-cake', defaultSubtitle: 'L\'Anniversaire de' },
      { name: 'Remise de Diplôme', icon: 'fa-graduation-cap', defaultSubtitle: 'Célébration de Diplôme de' },
      { name: 'Fête de Famille', icon: 'fa-users', defaultSubtitle: 'Réunion de Famille de' }
    ]
  },
  {
    id: 'CORPORATE',
    name: 'Événements Corporate & Professionnels',
    shortName: 'Corporate & Pro',
    icon: 'fa-briefcase',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    colorAccent: '#4f46e5',
    themeClass: 'theme-corporate',
    subSummary: 'Dîner d\'Affaires, Lancement, Séminaire, Gala...',
    subCategories: [
      { name: 'Dîner d\'Affaires', icon: 'fa-utensils', defaultSubtitle: 'Dîner d\'Affaires' },
      { name: 'Lancement de Produit', icon: 'fa-rocket', defaultSubtitle: 'Lancement Officiel de' },
      { name: 'Conférence & Séminaire', icon: 'fa-microphone-alt', defaultSubtitle: 'Conférence & Réception' },
      { name: 'Soirée de Gala', icon: 'fa-champagne-glasses', defaultSubtitle: 'Soirée de Gala' }
    ]
  },
  {
    id: 'SEASONAL_SOCIAL',
    name: 'Événements Saisonniers & Sociaux',
    shortName: 'Saisonnier & Social',
    icon: 'fa-champagne-glasses',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    colorAccent: '#059669',
    themeClass: 'theme-seasonal',
    subSummary: 'Réveillon, Gala Caritatif, Réception...',
    subCategories: [
      { name: 'Réveillon & Nouvel An', icon: 'fa-glass-cheers', defaultSubtitle: 'Soirée de Réveillon du Nouvel An' },
      { name: 'Événement Caritatif', icon: 'fa-hand-holding-heart', defaultSubtitle: 'Gala de Bienfaisance & Solidarité' },
      { name: 'Réception Sociale', icon: 'fa-cocktail', defaultSubtitle: 'Cocktail & Réception d\'Exception' }
    ]
  },
  {
    id: 'SCOLAIRE',
    name: 'Événements Scolaires & Universitaires',
    shortName: 'Scolaire & Éducation',
    icon: 'fa-graduation-cap',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    colorAccent: '#0891b2',
    themeClass: 'theme-scolaire',
    subSummary: 'Remise de Diplôme, Fête d\'école, Bal de Promo, Kermesse...',
    subCategories: [
      { name: 'Remise de Diplôme', icon: 'fa-graduation-cap', defaultSubtitle: 'Cérémonie de Remise de Diplôme de' },
      { name: 'Fête d\'école & Kermesse', icon: 'fa-school', defaultSubtitle: 'Grande Fête de Fin d\'Année' },
      { name: 'Bal de Promo / Gala', icon: 'fa-masks-theater', defaultSubtitle: 'Bal de Promo Annuel de' },
      { name: 'Gala d\'Anciens Élèves', icon: 'fa-user-graduate', defaultSubtitle: 'Retrouvailles & Soirée des Alumni' }
    ]
  }
];

export function getCategoryTaxonomy(categoryName?: string, customTaxonomy?: MainCategoryInfo[]): MainCategoryInfo | undefined {
  if (!categoryName) return undefined;
  const norm = categoryName.trim().toLowerCase();
  const source = customTaxonomy && customTaxonomy.length > 0 ? customTaxonomy : TEMPLATE_TAXONOMY;
  
  return source.find(c => 
    c.name.toLowerCase() === norm || 
    c.shortName.toLowerCase() === norm ||
    c.id.toLowerCase() === norm ||
    (norm.includes('tradition') && c.id === 'TRADITIONAL') ||
    (norm.includes('mariage') && c.id === 'TRADITIONAL') ||
    (norm.includes('famille') && c.id === 'FAMILY') ||
    (norm.includes('anniversaire') && c.id === 'FAMILY') ||
    (norm.includes('corporate') && c.id === 'CORPORATE') ||
    (norm.includes('professionnel') && c.id === 'CORPORATE') ||
    (norm.includes('saisonnier') && c.id === 'SEASONAL_SOCIAL') ||
    (norm.includes('social') && c.id === 'SEASONAL_SOCIAL') ||
    (norm.includes('scolaire') && c.id === 'SCOLAIRE') ||
    (norm.includes('diplome') && c.id === 'SCOLAIRE') ||
    (norm.includes('diplôme') && c.id === 'SCOLAIRE') ||
    (norm.includes('education') && c.id === 'SCOLAIRE') ||
    (norm.includes('éducation') && c.id === 'SCOLAIRE')
  );
}

export function getAllSubcategoriesForCategory(categoryName?: string, customTaxonomy?: MainCategoryInfo[]): SubCategoryInfo[] {
  const cat = getCategoryTaxonomy(categoryName, customTaxonomy);
  return cat ? cat.subCategories : [];
}
