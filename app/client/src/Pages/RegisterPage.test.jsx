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

    // Test for register card Title
    //const registerCardTitle = screen.getByRole('heading', { name: /register/i });
    //expect(registerCardTitle).toBeInTheDocument();  

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

  test('displays error message when registration fails', async () => {
    // Mocking a failed registration response
    axios.post.mockRejectedValue({
      response: {
        data: { error: 'There was an error signing up' }
      }
    });

    screen.debug();

    await waitFor(() => {
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    });

    /*fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'john123' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
  
    fireEvent.submit(screen.getByRole('button', { name: /register/i }));
  
    await waitFor(() => {
      expect(screen.getByText('There was an error signing up')).toBeInTheDocument();
    });*/
  });
});
