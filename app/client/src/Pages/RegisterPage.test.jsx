import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RegisterPage from './RegisterPage';
import { loginPath } from '../Path';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

describe('RegisterPage Component', () => {
  test('renders RegisterPage with form elements and Register button', () => {
    render(<Router><RegisterPage /></Router>);

    // Test for register card Title
    const registerCardTitle = screen.getByRole('heading', { name: /register/i });
    expect(registerCardTitle).toBeInTheDocument();  

    // Test for Username and Password label
    const username = screen.getByText('Username');
    const password = screen.getByText('Password');
    expect(username).toBeInTheDocument();
    expect(password).toBeInTheDocument();

    // Test for register button
    const registerButton = screen.getByRole('button', { name: /register/i });
    expect(registerButton).toBeInTheDocument();
    
    // Test for the links
    const haveAccountLink = screen.getByText(/have an account?/i);
    expect(haveAccountLink).toBeInTheDocument();
    expect(haveAccountLink).toHaveAttribute('href', loginPath);
  });
});
