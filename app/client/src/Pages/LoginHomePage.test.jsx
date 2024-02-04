import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginHomePage from './LoginHomePage';

test('renders LoginHomePage component', () => {
  render(
  <Router>
    <LoginHomePage />
  </Router>
  );

  //Test for Login Card title
  //const loginCardTitle = screen.getByRole('heading', { name: /login/i });
  //expect(loginCardTitle).toBeInTheDocument();  

  {/*const loginCardTitle = screen.getByText(/login/i);
  expect(loginCardTitle).toBeInTheDocument();*/}

  // Test for Username and Password labels
  /*const username = screen.getByText('Username');
  const password = screen.getByText('Password');
  expect(username).toBeInTheDocument();
  expect(password).toBeInTheDocument();*/

  // Test for login button
  {/*const loginButton = screen.getByRole('button', { name: /login/i });
  expect(loginButton).toBeInTheDocument();*/}

  const loginTitle = screen.getByText(/login/i, { selector: '.display-3' });
  expect(loginTitle).toBeInTheDocument();

    // Test for input fields
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  
    // Test form submission
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

  // Test for links
  const guestLink = screen.getByText(/use as guest/i);
  const noAccountLink = screen.getByText(/no account?/i);
  expect(guestLink).toBeInTheDocument();
  expect(noAccountLink).toBeInTheDocument();
  expect(guestLink).toHaveAttribute('href');
  expect(noAccountLink).toHaveAttribute('href');
});
