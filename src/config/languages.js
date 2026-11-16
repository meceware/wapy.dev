import {
  US, FI, TR, VN, TH, KR, CN, ES, PT, LK, IN, ID, MY, EG, DE, NO, SE, NL, JP, GB,
} from 'country-flag-icons/react/3x2';

const SupportedLanguages = {
  'en': {
    name: 'English',
    nativeName: 'English',
    flag: US,
    dir: 'ltr',
  },
  'ar-EG': {
    name: 'Arabic (Egypt)',
    nativeName: 'العربية',
    flag: EG,
    dir: 'rtl',
    numberLocale: 'ar-EG-u-nu-latn',
  },
  'de': {
    name: 'German',
    nativeName: 'Deutsch',
    flag: DE,
    dir: 'ltr',
  },
  'en-GB': {
    name: 'English (UK)',
    nativeName: 'English (UK)',
    flag: GB,
    dir: 'ltr',
  },
  'en-IN': {
    name: 'English (India)',
    nativeName: 'English (India)',
    flag: IN,
    dir: 'ltr',
  },
  'es': {
    name: 'Spanish',
    nativeName: 'Español',
    flag: ES,
    dir: 'ltr',
  },
  'fi': {
    name: 'Finnish',
    nativeName: 'Suomi',
    flag: FI,
    dir: 'ltr',
  },
  'hi': {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: IN,
    dir: 'ltr',
  },
  'id': {
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: ID,
    dir: 'ltr',
  },
  'ja': {
    name: 'Japanese',
    nativeName: '日本語',
    flag: JP,
    dir: 'ltr',
  },
  'ko': {
    name: 'Korean',
    nativeName: '한국어',
    flag: KR,
    dir: 'ltr',
  },
  'ms': {
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    flag: MY,
    dir: 'ltr',
  },
  'nb': {
    name: 'Norwegian Bokmål',
    nativeName: 'Norsk bokmål',
    flag: NO,
    dir: 'ltr',
  },
  'nl': {
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: NL,
    dir: 'ltr',
  },
  'pt': {
    name: 'Portuguese',
    nativeName: 'Português',
    flag: PT,
    dir: 'ltr',
  },
  'si': {
    name: 'Sinhala',
    nativeName: 'සිංහල',
    flag: LK,
    dir: 'ltr',
  },
  'sv': {
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: SE,
    dir: 'ltr',
  },
  'th': {
    name: 'Thai',
    nativeName: 'ไทย',
    flag: TH,
    dir: 'ltr',
  },
  'tr': {
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: TR,
    dir: 'ltr',
  },
  'vi': {
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: VN,
    dir: 'ltr',
  },
  'zh': {
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: CN,
    dir: 'ltr',
  },
};

export const DefaultLanguage = 'en';

export const getSupportedLanguageCodes = () => {
  return Object.keys(SupportedLanguages);
};

export const isLanguageSupported = (code) => {
  return code && (code in SupportedLanguages);
};

export const getLanguageConfig = (code) => {
  return isLanguageSupported(code) ? SupportedLanguages[code] : SupportedLanguages[DefaultLanguage];
};

export const resolveLanguageCode = (tag) => {
  if (!tag) return null;
  const lower = tag.trim().toLowerCase();
  const base = lower.split('-')[0];
  const codes = getSupportedLanguageCodes();
  return codes.find((c) => c.toLowerCase() === lower)
    || codes.find((c) => c.toLowerCase() === base)
    || codes.find((c) => c.toLowerCase().startsWith(`${base}-`))
    || null;
};
