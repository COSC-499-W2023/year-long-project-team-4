import React from 'react';
import { render } from '@testing-library/react';
import AccountPage from './AccountPage';

describe('AccountPage', () => {
    it('renders without crashing', () => {
        render(<AccountPage />);
    });

    it('renders AccountPage with form elements and Register button', () => {
        const { getByText, getByRole } = render(<AccountPage />);
        const username = getByText('Username');
        const password = getByText('Password');
        expect(username).toBeInTheDocument();
        expect(password).toBeInTheDocument();
        const registerButton = getByRole('button', { name: /register/i });
        expect(registerButton).toBeInTheDocument();
    });
});
