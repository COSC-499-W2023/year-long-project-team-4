import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

describe('ForgotPasswordPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render the component', () => {
        render(<ForgotPasswordPage />);
        expect(screen.getByText('Enter Email for send code to reset password:')).toBeInTheDocument();
        expect(screen.getByLabelText('Enter Email for send code to reset password:')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
    });

    test('should handle form submission', () => {
        const navigate = jest.fn();
        useNavigate.mockReturnValue(navigate);
        render(<ForgotPasswordPage />);
        const emailInput = screen.getByLabelText('Enter Email for send code to reset password:');
        const submitButton = screen.getByRole('button', { name: 'Enter' });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(submitButton);

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/bucket/set_verificationcode'),
            { email: 'test@example.com' },
            expect.any(Object)
        );
    });

    test('should handle form submission error', async() => {
        const errorMessage = 'An error occurred. Please try again.';
        render(<ForgotPasswordPage />);
        const submitButton = screen.getByRole('button', { name: 'Enter' });
        fireEvent.click(submitButton);
        // Add your assertions here
        await screen.findByText(errorMessage);
        expect(screen.getByText(errorMessage)).toBeInTheDocument();});
    });
