import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import LoginHomePage from './LoginHomePage';

test('renders LoginHomePage component', () => {
  render(<LoginHomePage />);

  //Test for Login Card title
  const loginCardTitle = screen.getByRole('heading', { name: /login/i });
  expect(loginCardTitle).toBeInTheDocument();  

  // Test for Username and Password labels
  const username = screen.getByText('Username');
  const password = screen.getByText('Password');
  expect(username).toBeInTheDocument();
  expect(password).toBeInTheDocument();

  // Test for login button
  const loginButton = screen.getByRole('button', { name: /login/i });
  expect(loginButton).toBeInTheDocument();

  // Test for links
  const guestLink = screen.getByText(/use as guest/i);
  const noAccountLink = screen.getByText(/no account?/i);
  expect(guestLink).toBeInTheDocument();
  expect(noAccountLink).toBeInTheDocument();
  expect(guestLink).toHaveAttribute('href');
  expect(noAccountLink).toHaveAttribute('href');
});
