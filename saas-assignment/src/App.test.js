import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// Mock axios and lucide-react to control testing environment
jest.mock('axios');
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  ChevronsLeft: () => <div data-testid="chevrons-left" />,
  ChevronsRight: () => <div data-testid="chevrons-right" />,
  Search: () => <div data-testid="search-icon" />
}));

// Sample mock data for testing
const mockProjectData = [
  { 'percentage.funded': 50, 'amt.pledged': 1000 },
  { 'percentage.funded': 75, 'amt.pledged': 2000 },
  { 'percentage.funded': 25, 'amt.pledged': 500 },
  { 'percentage.funded': 100, 'amt.pledged': 3000 },
  { 'percentage.funded': 60, 'amt.pledged': 1500 },
  { 'percentage.funded': 90, 'amt.pledged': 2500 },
];

describe('App Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    // Mock axios to simulate loading state
    axios.get.mockResolvedValue({ data: [] });

    render(<App />);

    // Check if loading text is displayed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders projects table after data fetch', async () => {
    // Mock successful data fetch
    axios.get.mockResolvedValue({ data: mockProjectData });

    render(<App />);

    // Wait for loading to complete and table to render
    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('S.No.')).toBeInTheDocument();
    expect(screen.getByText('Percentage Funded')).toBeInTheDocument();
    expect(screen.getByText('Amount Pledged')).toBeInTheDocument();
  });

  test('handles pagination correctly', async () => {
    // Mock data fetch
    axios.get.mockResolvedValue({ data: mockProjectData });

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Check initial page shows first 5 records
    const rows = screen.getAllByRole('row').slice(1); // Exclude header row
    expect(rows).toHaveLength(5);

    // Check pagination info
    expect(screen.getByText(/Showing 5 of 6 records/)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
  });

  test('navigates between pages using pagination buttons', async () => {
    // Mock data fetch
    axios.get.mockResolvedValue({ data: mockProjectData });

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Find and click next page button
    const nextButton = screen.getByTestId('chevron-right');
    fireEvent.click(nextButton);

    // Check page changed
    expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
  });

  test('handles page input submission', async () => {
    // Mock data fetch
    axios.get.mockResolvedValue({ data: mockProjectData });

    render(<App />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Find input and submit button
    const pageInput = screen.getByPlaceholderText('Enter page number');
    const submitButton = screen.getByTestId('search-icon');

    // Enter page 2 and submit
    fireEvent.change(pageInput, { target: { value: '2' } });
    fireEvent.click(submitButton);

    // Check page changed
    expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
  });

  test('handles error during data fetch', async () => {
    // Mock error in data fetch
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('Network error'));

    render(<App />);

    // Wait for potential error logging
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});