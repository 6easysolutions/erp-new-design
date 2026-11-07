/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router';
import TableTopHead from '../components/table-top-head';
import sidebarSlice from '../core/redux/sidebarSlice';

const renderWithProviders = (initialToggleHeader = false) => {
  const store = configureStore({
    reducer: {
      sidebar: sidebarSlice,
    },
    preloadedState: {
      sidebar: {
        toggleHeader: initialToggleHeader,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <TableTopHead />
      </MemoryRouter>
    </Provider>
  );
};

describe('TableTopHead Accessibility', () => {
  it('renders all icon-only links with proper aria-labels', () => {
    renderWithProviders(false);

    expect(screen.getByRole('link', { name: /export as pdf/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /export as excel/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /refresh table/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /collapse header/i })).toBeDefined();
  });

  it('updates collapse button aria-label and aria-expanded when toggleHeader is true', () => {
    renderWithProviders(true);

    const collapseLink = screen.getByRole('link', { name: /expand header/i });
    expect(collapseLink).toBeDefined();
    expect(collapseLink.getAttribute('aria-expanded')).toBe('false');
  });
});
