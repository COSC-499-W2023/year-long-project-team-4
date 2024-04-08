// HomePage.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import HomePage from './HomePage'; // adjust this import as necessary
import { loginPath } from '../Path';


describe('HomePage', () => {
  test('renders HomePage component', () => {
    render(<HomePage />);
    expect(screen.getByText('A secure and anonymous platform for video submission')).toBeInTheDocument();
  });

  test('renders logo', () => {
    const { container } = render(<HomePage />);
    const logo = container.querySelector("svg");
    expect(logo).toBeInTheDocument();
  });

  test('renders get started button',() => {
    render(<HomePage />);
    const button = screen.getByText('Get Started');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', loginPath);

  });
});