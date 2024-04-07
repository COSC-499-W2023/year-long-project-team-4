import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadVideoPage from './UploadVideoPage';
import{ MemoryRouter } from 'react-router-dom';
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
describe('UploadVideoPage', () => {
    test('renders Upload Video form', () => {
        render(<MemoryRouter><UploadVideoPage /></MemoryRouter>);
       
        expect(screen.getByLabelText('Upload Video')).toBeInTheDocument();
        expect(screen.getByLabelText('Recipient Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Video Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Tags')).toBeInTheDocument();
        expect(screen.getByLabelText('Retention Period in days (1-365)')).toBeInTheDocument();
        expect(screen.getByText('Blur video')).toBeInTheDocument();
        expect(screen.getByText('Send video')).toBeInTheDocument();
    });

 /*   test('allows user to upload a video', () => {
        render(<UploadVideoPage />);
        
        // Simulate user input and interaction
        const fileInput = screen.getByLabelText('Upload Video');
        const recipientEmailInput = screen.getByLabelText('Recipient Email');
        const videoNameInput = screen.getByLabelText('Video Name');
        const tagsInput = screen.getByLabelText('Tags');
        const retentionPeriodInput = screen.getByLabelText('Retention Period in days (1-365)');
        const blurButton = screen.getByText('Blur video');
        const sendButton = screen.getByText('Send video');

        fireEvent.change(fileInput, { target: { files: [new File([''], 'video.mp4', { type: 'video/mp4' })] } });
        fireEvent.change(recipientEmailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(videoNameInput, { target: { value: 'Test Video' } });
        fireEvent.change(tagsInput, { target: { value: 'tag1, tag2, tag3' } });
        fireEvent.change(retentionPeriodInput, { target: { value: '30' } });
        fireEvent.click(blurButton);
        fireEvent.click(sendButton);

    });
*/
});
