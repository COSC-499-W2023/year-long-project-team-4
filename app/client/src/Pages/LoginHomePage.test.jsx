import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginHomePage from './LoginHomePage';
import { changePasswordPath, guestPath, registerPath } from '../Path';

test('renders LoginHomePage component', () => {
  render(
  <Router>
    <LoginHomePage />
  </Router>
  );

  const loginTitle = screen.getByText(/login/i, { selector: '.display-3' });
  expect(loginTitle).toBeInTheDocument();

    // Test for input fields
    const usernameInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  
    // Test form submission
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password');

    // Test for links
    const guestLink = screen.getByText(/use as guest/i);
    const noAccountLink = screen.getByText(/no account?/i);
    const forgotPasswordLink = screen.getByText(/forgot password?/i);
    expect(guestLink).toBeInTheDocument();
    expect(noAccountLink).toBeInTheDocument();
    expect(guestLink).toHaveAttribute('href', guestPath);
    expect(noAccountLink).toHaveAttribute('href', registerPath);
    expect(forgotPasswordLink).toHaveAttribute('href', changePasswordPath);

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: /pass/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
