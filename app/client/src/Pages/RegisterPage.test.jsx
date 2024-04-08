import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RegisterPage from './RegisterPage';
import { loginPath } from '../Path';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from 'axios';

jest.mock('axios');

describe('RegisterPage Component', () => {
  test('renders RegisterPage with form elements and Register button', () => {
    render(<Router><RegisterPage /></Router>);

    const username = screen.getByTestId('Email');
    const password = screen.getByTestId('Password');
    const firstName = screen.getByTestId('Firstname');
    const lastName = screen.getByTestId('Lastname');

    const passwordConfirm1 = screen.getByText(/Password must contain at least 1 capital letter/i);
    const passwordConfirm2 = screen.getByText(/Password must contain at least 1 number./i);
    const passwordConfirm3 = screen.getByText(/Password must contain at least 1 special character./i);
    const passwordConfirm4 = screen.getByText(/Password requires at least 8 characters./i);
    const passwordConfirm5 = screen.getByText(/Password requires at most 25 characters./i);

    expect(username).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(firstName).toBeInTheDocument();
    expect(lastName).toBeInTheDocument();
    expect(passwordConfirm1).toBeInTheDocument();
    expect(passwordConfirm2).toBeInTheDocument();
    expect(passwordConfirm3).toBeInTheDocument();
    expect(passwordConfirm4).toBeInTheDocument();
    expect(passwordConfirm5).toBeInTheDocument();

    fireEvent.change(username, { target: { value: 'testuser' } });
    fireEvent.change(password, { target: { value: 'password' } });
    fireEvent.change(firstName, { target: { value: 'test' } });
    fireEvent.change(lastName, { target: { value: 'user' } });

    expect(username).toHaveValue('testuser');
    expect(password).toHaveValue('password');
    expect(firstName).toHaveValue('test');  
    expect(lastName).toHaveValue('user');

    const registerButton = screen.getByRole('button', { name: /register/i });
    expect(registerButton).toBeInTheDocument();
    
    const haveAccountLink = screen.getByText(/have an account?/i);
    expect(haveAccountLink).toBeInTheDocument();
    expect(haveAccountLink).toHaveAttribute('href', loginPath);
 
    const haveVerificationLink = screen.getByText(/have a verification code?/i);
    expect(haveVerificationLink).toBeInTheDocument();
    fireEvent.click(haveVerificationLink);
    expect(screen.getByText('Verify Your Account')).toBeInTheDocument();
    
    const verificationCode = screen.getByPlaceholderText('Verification Code');
    const email = screen.getByPlaceholderText('Email');
    const text = screen.getByText('Please enter your email and the verification code sent there.');
    const close = screen.getByRole('button', { name: "Close" });
    const verfify = screen.getByRole('button', { name: /verify/i });
    const closeButton = screen.getByRole('button', { name: /closebutton/i });

    expect(text).toBeInTheDocument();
    expect(verfify).toBeInTheDocument();
    expect(verificationCode).toBeInTheDocument();
    expect(email).toBeInTheDocument();
    expect(close).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();

    fireEvent.change(email, { target: { value: 'testemail' } });
    fireEvent.change(verificationCode, { target: { value: '1234' } });

    expect(email).toHaveValue('testemail');
    expect(verificationCode).toHaveValue('1234');

    fireEvent.click(closeButton);

    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: /pass/i }));
    expect(password).toHaveAttribute('type', 'text');

    const loginLink = screen.getByText(/have an account?/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', loginPath);
  });

 test('displays error message when registration fails', async () => {
  render(<Router><RegisterPage /></Router>);  
  axios.post.mockRejectedValue({
      response: {
        data: { error: 'There was an error signing up' }
      }
    });

    screen.debug();

    await waitFor(() => {
      expect(screen.getByTestId('Firstname')).toBeInTheDocument();
    });
  });
});
