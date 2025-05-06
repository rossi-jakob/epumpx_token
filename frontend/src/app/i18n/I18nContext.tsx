'use client';

import { createContext, useContext } from 'react';
import type { i18n as I18nType } from 'i18next';

export const I18nContext = createContext<I18nType | undefined>(undefined);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return ctx;
}