import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App', () => {
  it('renders without crashing and produces content', () => {
    const { container } = render(<App />);
    console.log('Rendered HTML length:', container.innerHTML.length);
    console.log('First 200 chars:', container.innerHTML.substring(0, 200));
    expect(container.innerHTML).not.toBe('');
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
  
  it('shows Apollo for Reddit heading', () => {
    render(<App />);
    const headings = screen.getAllByText('Apollo for Reddit');
    expect(headings.length).toBeGreaterThanOrEqual(1);
    const h1 = headings.find(el => el.tagName === 'H1');
    expect(h1).toBeDefined();
  });
});
