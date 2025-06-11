import { render, screen } from '@testing-library/react';
import App from './App';

test('renders school election voting system', () => {
  render(<App />);
  const headerElement = screen.getByText(/School Election Voting System/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders student login form', () => {
  render(<App />);
  const loginElement = screen.getByText(/Student Login/i);
  expect(loginElement).toBeInTheDocument();
});

test('renders navigation buttons', () => {
  render(<App />);
  // More specific selector for navigation buttons
  const voteButton = screen.getByRole('button', { name: /^Vote$/i });
  const resultsButton = screen.getByRole('button', { name: /Results/i });
  const statusButton = screen.getByRole('button', { name: /Status/i });
  const adminButton = screen.getByRole('button', { name: /Admin/i });
  
  expect(voteButton).toBeInTheDocument();
  expect(resultsButton).toBeInTheDocument();
  expect(statusButton).toBeInTheDocument();
  expect(adminButton).toBeInTheDocument();
});
