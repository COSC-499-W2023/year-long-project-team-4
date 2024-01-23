import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ReceiveAndSendPage from './ReceiveAndSendPage';
import {
  viewVideoPath,
  uploadVideoPath,
} from '../Path';

describe('ReceiwveAndSendPage Component', () => {
  test('renders ReceiveAndSendPage with buttons', () => {
    render(<ReceiveAndSendPage />);

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
