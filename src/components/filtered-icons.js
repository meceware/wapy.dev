'use client'

import * as SimpleIcons from 'simple-icons'

// Define safe licenses for commercial use
const SAFE_LICENSES = [
  'MIT',
  'Apache-2.0',
  'BSD-3-Clause',
  'CC0-1.0',
  'Unlicense',
  'MPL-2.0',
]

// Filter and re-export icons
export const SimpleIconsLicenseFiltered = Object.entries(SimpleIcons).reduce((acc, [key, icon]) => {
  // Skip if it's not an icon object or doesn't have a license
  if (!icon || typeof icon !== 'object') {
    return acc
  }

  if (!icon.license) {
    acc[key] = icon
  }
  // Include icon if its license is in our safe list
  else if (SAFE_LICENSES.includes(icon.license.type)) {
    acc[key] = icon
  }

  return acc
}, {})
