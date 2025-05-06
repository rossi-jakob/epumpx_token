'use client';

import { I18nContext } from '@/app/i18n/I18nContext';
import i18n from '@/app/i18n/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nContext.Provider value={i18n}>
      {children}
    </I18nContext.Provider>
  );
}