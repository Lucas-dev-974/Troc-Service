// Validation email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation téléphone français
export const isValidFrenchPhone = (phone: string): boolean => {
  // Supprimer les espaces, points, tirets
  const cleaned = phone.replace(/[\s\.\-]/g, '');
  // Formats acceptés : 0612345678, +33612345678, 0033612345678, 01.23.45.67.89
  const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[\.\-\s]?\d{2}){4}$/;
  return phoneRegex.test(cleaned);
};

// Validation contact (email ou téléphone)
export const isValidContact = (contact: string): { valid: boolean; type: 'email' | 'phone' | 'invalid' } => {
  if (isValidEmail(contact)) {
    return { valid: true, type: 'email' };
  }
  if (isValidFrenchPhone(contact)) {
    return { valid: true, type: 'phone' };
  }
  return { valid: false, type: 'invalid' };
};

// Validation longueur avec limites
export const validateLength = (value: string, min: number, max: number): boolean => {
  return value.length >= min && value.length <= max;
};

// Messages d'erreur de validation
export const ValidationErrors = {
  EMAIL_REQUIRED: 'L\'email est requis',
  EMAIL_INVALID: 'Format d\'email invalide',
  USERNAME_REQUIRED: 'Le nom d\'utilisateur est requis',
  USERNAME_LENGTH: 'Le nom d\'utilisateur doit contenir entre 3 et 50 caractères',
  PASSWORD_REQUIRED: 'Le mot de passe est requis',
  PASSWORD_LENGTH: 'Le mot de passe doit contenir entre 6 et 100 caractères',
  TITLE_REQUIRED: 'Le titre est requis',
  TITLE_LENGTH: 'Le titre doit contenir entre 5 et 255 caractères',
  DESCRIPTION_REQUIRED: 'La description est requise',
  DESCRIPTION_LENGTH: 'La description doit contenir entre 10 et 2000 caractères',
  AUTHOR_REQUIRED: 'Le nom de l\'auteur est requis',
  AUTHOR_LENGTH: 'Le nom de l\'auteur doit contenir entre 2 et 100 caractères',
  CONTACT_REQUIRED: 'Le contact est requis',
  CONTACT_INVALID: 'Le contact doit être un email valide ou un numéro de téléphone français',
  TYPE_INVALID: 'Le type d\'offre est invalide',
  ID_INVALID: 'L\'identifiant est invalide',
};

