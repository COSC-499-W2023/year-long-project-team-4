import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RecieveAndSendPage from './RecieveAndSendPage';
import {
  viewVideoPath,
  uploadVideoPath,
} from '../Path';

describe('RecieveAndSendPage Component', () => {
  test('renders RecieveAndSendPage with buttons', () => {
    render(<RecieveAndSendPage />);

    // Test for Send video button
    const sendVideosButton = screen.getByRole('button', { name: /send videos/i });
    expect(sendVideosButton).toBeInTheDocument();
    expect(sendVideosButton).toHaveAttribute('href', uploadVideoPath);

    // Test for receive video button
    const receiveVideosButton = screen.getByRole('button', { name: /receive videos/i });
    expect(receiveVideosButton).toBeInTheDocument();
    expect(receiveVideosButton).toHaveAttribute('href', viewVideoPath);
  });
});
