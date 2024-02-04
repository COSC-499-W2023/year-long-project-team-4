import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ReceiveAndSendPage from './ReceiveAndSendPage';
import {
  viewVideoPath,
  uploadVideoPath,
} from '../Path';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';

jest.mock('axios');

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  jest.clearAllMocks();
});

describe('ReceiwveAndSendPage Component', () => {
  test('renders ReceiveAndSendPage with buttons', () => {
    render(
    <Router>
    <ReceiveAndSendPage />
    </Router>);

    // Test for Send video button
    const sendVideosButton = screen.getByRole('button', { name: /send videos/i });
    expect(sendVideosButton).toBeInTheDocument();
    expect(sendVideosButton).toHaveAttribute('href', uploadVideoPath);

    // Test for receive video button
    const receiveVideosButton = screen.getByRole('button', { name: /receive videos/i });
    expect(receiveVideosButton).toBeInTheDocument();
    expect(receiveVideosButton).toHaveAttribute('href', viewVideoPath);
  });

  test('renders logout button and initiates logout on click', async () => {
    axios.get.mockResolvedValue({ data: { success: true } });
    render(
      <Router>
        <ReceiveAndSendPage />
      </Router>
    );

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Add your assertions for navigation or state change after logout
  });

  test('displays current user name', async () => {
    const username = 'randomUsername';
    axios.get.mockResolvedValueOnce({ data: { username } });
    render(
      <Router>
        <ReceiveAndSendPage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(`Welcome, ${username}!`)).toBeInTheDocument();
    });
  });

  test('shows error message on failed logout', async () => {
    axios.get.mockRejectedValue(new Error('Logout failed'));
    render(
      <Router>
        <ReceiveAndSendPage />
      </Router>
    );

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText('There was an error Logging out')).toBeInTheDocument();
    });
  });

  test('handles error on fetching current user', async () => {
    axios.get.mockRejectedValue(new Error('Fetch error'));
    render(
      <Router>
        <ReceiveAndSendPage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('There was an error fetching the current user')).toBeInTheDocument();
    });
  });

});
