import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { Header } from '~/components/layout/Header';

// Mock básico de i18next para el Header
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'es', changeLanguage: () => {} } }),
}));

jest.mock('@remix-run/react', () => ({
  Link: ({ to, children, ...rest }: any) => <a href={to} {...rest}>{children}</a>,
}));

describe('Header accessibility', () => {
  it('no tiene violaciones de accesibilidad básicas', async () => {
    const { container } = render(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
