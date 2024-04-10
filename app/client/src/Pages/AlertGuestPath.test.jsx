import React from 'react';
import { render, screen } from '@testing-library/react';
import AlertGuestPage from './AlertGuestPage';
import { loginPath, uploadVideoPath } from '../Path';

test('renders alert message', () => {
    render(<AlertGuestPage />);
    const alertMessage = screen.getByText(
    /Understand, as a guest you will only be able to send videos, not receive them./i);
    expect(alertMessage).toBeInTheDocument();
});

test('renders login button', () => {
    render(<AlertGuestPage />);
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('href', loginPath);

});

test('renders continue button', () => {
    render(<AlertGuestPage />);
    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toHaveAttribute('href', uploadVideoPath);
});
