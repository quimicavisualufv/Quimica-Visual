import { atomScaleLimits, atomTypesWithMass, ionicLatticeTypes, impurityTypes, modeConfig, vacancyTypes } from './config.js';
import { findNearestInterstitial, findPairedHost, generateLattice } from './lattice.js';

const listeners = new Set();
const STORAGE_KEY = 'defeitos-cristalinos-appearance';
const APPEARANCE_VERSION = 2;
const defaultAppearance = {
  backgroundColor: '#FFEDD5',
  lightColor: '#FDFDFC'
};

function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function normalizeHexColor(value) {
  return isHexColor(value) ? value.toUpperCase() : null;
}

function loadAppearance() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const savedBackgroundColor = normalizeHexColor(saved.backgroundColor);
    const savedLightColor = normalizeHexColor(saved.lightColor);
    if (saved.version === APPEARANCE_VERSION) {
      return {
        backgroundColor: savedBackgroundColor || defaultAppearance.backgroundColor,
        lightColor: savedLightColor || defaultAppearance.lightColor
      };
    }
    return {
      backgroundColor: savedBackgroundColor || defaultAppearance.backgroundColor,
      lightColor: savedLightColor && savedLightColor !== '#FFB03A' ? savedLightColor : defaultAppearance.lightColor
    };
  } catch (_) {
    return { ...defaultAppearance };
  }
}

function saveAppearance() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: APPEARANCE_VERSION,
      backgroundColor: state.backgroundColor,
      lightColor: state.lightColor
    }));
  } catch (_) {}
}

const state = {
  atoms: generateLattice('sc'),
  mode: 'view',
  latticeType: 'sc',
  clipPlane: 'none',
  atomScale: 1,
  ...loadAppearance()
};

function cloneState() {
  return {
    ...state,
    atoms: state.atoms.map((atom) => ({ ...atom, position: [...atom.position] }))
  };
}

function isIonicLatticeType(latticeType) {
  return ionicLatticeTypes.includes(latticeType);
}

function isNativeSite(atom) {
  return ['host', 'cation', 'anion'].includes(atom.type);
}

function restoreNativeType(atom) {
  return ['host', 'cation', 'anion'].includes(atom.baseType) ? atom.baseType : 'host';
}

function getSchottkyVacancyType(atom) {
  return restoreNativeType(atom) === 'anion' ? 'schottky_anion' : 'schottky_cation';
}

function clampAtomScale(atomScale) {
  const value = Number(atomScale);
  if (!Number.isFinite(value)) return state.atomScale;
  const clamped = Math.min(atomScaleLimits.max, Math.max(atomScaleLimits.min, value));
  return Math.round(clamped * 10) / 10;
}

export function canUseMode(mode, latticeType = state.latticeType) {
  const config = modeConfig[mode];
  if (!config) return false;
  return !config.ionicOnly || isIonicLatticeType(latticeType);
}

function notify() {
  const snapshot = cloneState();
  listeners.forEach((listener) => listener(snapshot));
}

function setAtomType(atoms, id, type) {
  const index = atoms.findIndex((atom) => atom.id === id);
  if (index < 0) return;
  const atom = atoms[index];
  const baseType = ['host', 'cation', 'anion'].includes(atom.type) ? atom.type : atom.baseType;
  atoms[index] = { ...atom, type, baseType };
}

export function subscribe(listener) {
  listeners.add(listener);
  listener(cloneState());
  return () => listeners.delete(listener);
}

export function getState() {
  return cloneState();
}

export function setMode(mode) {
  if (!canUseMode(mode)) return;
  state.mode = mode;
  notify();
}

export function setLatticeType(latticeType) {
  state.latticeType = latticeType;
  state.atoms = generateLattice(latticeType);
  state.mode = 'view';
  notify();
}

export function setClipPlane(clipPlane) {
  state.clipPlane = clipPlane;
  notify();
}

export function setAtomScale(atomScale) {
  const nextScale = clampAtomScale(atomScale);
  if (nextScale === state.atomScale) return;
  state.atomScale = nextScale;
  notify();
}

export function setBackgroundColor(backgroundColor) {
  const normalizedBackgroundColor = normalizeHexColor(backgroundColor);
  if (!normalizedBackgroundColor) return;
  state.backgroundColor = normalizedBackgroundColor;
  saveAppearance();
  notify();
}

export function setLightColor(lightColor) {
  const normalizedLightColor = normalizeHexColor(lightColor);
  if (!normalizedLightColor) return;
  state.lightColor = normalizedLightColor;
  saveAppearance();
  notify();
}

export function resetAppearance() {
  state.backgroundColor = defaultAppearance.backgroundColor;
  state.lightColor = defaultAppearance.lightColor;
  saveAppearance();
  notify();
}

export function resetLattice() {
  state.atoms = generateLattice(state.latticeType);
  notify();
}

export function getCounts(snapshot = state) {
  return {
    atoms: snapshot.atoms.filter((atom) => atomTypesWithMass.includes(atom.type)).length,
    vacancies: snapshot.atoms.filter((atom) => vacancyTypes.includes(atom.type)).length,
    impurities: snapshot.atoms.filter((atom) => impurityTypes.includes(atom.type)).length
  };
}

export function isInteractive(atom, mode) {
  if (mode === 'vacancy') return ['host', 'cation', 'anion', 'vacancy', 'substitutional'].includes(atom.type);
  if (mode === 'substitutional') return ['host', 'cation', 'anion', 'substitutional', 'vacancy'].includes(atom.type);
  if (mode === 'interstitial') return ['interstitial_site', 'interstitial'].includes(atom.type);
  if (mode === 'frenkel') return ['cation', 'anion', 'frenkel_interstitial', 'frenkel_vacancy', 'interstitial_site'].includes(atom.type);
  if (mode === 'schottky') return ['cation', 'anion', 'schottky_cation', 'schottky_anion'].includes(atom.type);
  return false;
}

export function interactWithAtom(id) {
  const atomIndex = state.atoms.findIndex((atom) => atom.id === id);
  if (atomIndex === -1) return;
  const atoms = state.atoms.map((atom) => ({ ...atom }));
  const atom = atoms[atomIndex];

  if (state.mode === 'vacancy') {
    if (isNativeSite(atom) || atom.type === 'substitutional') setAtomType(atoms, atom.id, 'vacancy');
    else if (atom.type === 'vacancy') setAtomType(atoms, atom.id, restoreNativeType(atom));
  }

  if (state.mode === 'substitutional') {
    if (isNativeSite(atom) || atom.type === 'vacancy') setAtomType(atoms, atom.id, 'substitutional');
    else if (atom.type === 'substitutional') setAtomType(atoms, atom.id, restoreNativeType(atom));
  }

  if (state.mode === 'interstitial') {
    if (atom.type === 'interstitial_site') setAtomType(atoms, atom.id, 'interstitial');
    else if (atom.type === 'interstitial') setAtomType(atoms, atom.id, 'interstitial_site');
  }

  if (state.mode === 'frenkel' && canUseMode('frenkel')) {
    if (atom.type === 'cation' || atom.type === 'anion') {
      const targetSite = findNearestInterstitial(atoms, atom.position);
      if (targetSite) {
        setAtomType(atoms, atom.id, 'frenkel_vacancy');
        setAtomType(atoms, targetSite.id, 'frenkel_interstitial');
        const targetIndex = atoms.findIndex((item) => item.id === targetSite.id);
        if (targetIndex >= 0) atoms[targetIndex] = { ...atoms[targetIndex], displacedType: atom.type };
      }
    } else if (atom.type === 'frenkel_vacancy' || atom.type === 'frenkel_interstitial') {
      atoms.forEach((item) => {
        if (item.type === 'frenkel_vacancy') item.type = restoreNativeType(item);
        if (item.type === 'frenkel_interstitial') {
          item.type = 'interstitial_site';
          delete item.displacedType;
        }
      });
    }
  }

  if (state.mode === 'schottky' && canUseMode('schottky')) {
    if (atom.type === 'cation' || atom.type === 'anion') {
      const pair = findPairedHost(atoms, atom.id);
      if (pair) {
        setAtomType(atoms, atom.id, getSchottkyVacancyType(atom));
        setAtomType(atoms, pair.id, getSchottkyVacancyType(pair));
      }
    } else if (atom.type === 'schottky_cation' || atom.type === 'schottky_anion') {
      atoms.forEach((item) => {
        if (item.type === 'schottky_cation' || item.type === 'schottky_anion') item.type = restoreNativeType(item);
      });
    }
  }

  state.atoms = atoms;
  notify();
}
