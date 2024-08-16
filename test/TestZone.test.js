import React from 'react';
import { render } from '@testing-library/react';
import TestZone from './TestZone';
import '@testing-library/jest-dom';


test('renders team logos', () => {
  const { getByAltText } = render(<TestZone />);
  expect(getByAltText('Team A logo')).toBeInTheDocument();
  expect(getByAltText('Team B logo')).toBeInTheDocument();
  expect(getByAltText('Team C logo')).toBeInTheDocument();
});
