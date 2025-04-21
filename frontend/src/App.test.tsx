import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock dos componentes filhos
jest.mock('./components/SpedProcessor', () => {
  return function MockSpedProcessor() {
    return <div data-testid="sped-processor">Processador SPED</div>;
  };
});

jest.mock('./components/FuelTypeManager', () => {
  return function MockFuelTypeManager() {
    return <div data-testid="fuel-type-manager">Gerenciador de Tipos de Combustível</div>;
  };
});

jest.mock('./components/PmpfManager', () => {
  return function MockPmpfManager() {
    return <div data-testid="pmpf-manager">Gerenciador de Valores PMPF</div>;
  };
});

describe('App Component', () => {
  test('renderiza o título do aplicativo', () => {
    render(<App />);
    const titleElement = screen.getByText(/Sistema de Restituição ICMS/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renderiza o componente SpedProcessor por padrão', () => {
    render(<App />);
    const spedProcessor = screen.getByTestId('sped-processor');
    expect(spedProcessor).toBeInTheDocument();
  });

  test('alterna para o componente FuelTypeManager quando clicado', () => {
    render(<App />);
    
    // Clicar no item de menu "Tipos de Combustível"
    const fuelTypeMenuItem = screen.getByText(/Tipos de Combustível/i);
    fireEvent.click(fuelTypeMenuItem);
    
    // Verificar se o componente FuelTypeManager é renderizado
    const fuelTypeManager = screen.getByTestId('fuel-type-manager');
    expect(fuelTypeManager).toBeInTheDocument();
    
    // Verificar se o SpedProcessor não está mais visível
    expect(screen.queryByTestId('sped-processor')).not.toBeInTheDocument();
  });

  test('alterna para o componente PmpfManager quando clicado', () => {
    render(<App />);
    
    // Clicar no item de menu "Valores PMPF"
    const pmpfMenuItem = screen.getByText(/Valores PMPF/i);
    fireEvent.click(pmpfMenuItem);
    
    // Verificar se o componente PmpfManager é renderizado
    const pmpfManager = screen.getByTestId('pmpf-manager');
    expect(pmpfManager).toBeInTheDocument();
    
    // Verificar se o SpedProcessor não está mais visível
    expect(screen.queryByTestId('sped-processor')).not.toBeInTheDocument();
  });

  test('alterna de volta para o SpedProcessor após navegar para outros componentes', () => {
    render(<App />);
    
    // Primeiro, navegar para outro componente
    const fuelTypeMenuItem = screen.getByText(/Tipos de Combustível/i);
    fireEvent.click(fuelTypeMenuItem);
    
    // Depois, voltar para o SpedProcessor
    const spedMenuItem = screen.getByText(/Processamento SPED/i);
    fireEvent.click(spedMenuItem);
    
    // Verificar se o SpedProcessor está visível novamente
    const spedProcessor = screen.getByTestId('sped-processor');
    expect(spedProcessor).toBeInTheDocument();
    
    // Verificar se o FuelTypeManager não está mais visível
    expect(screen.queryByTestId('fuel-type-manager')).not.toBeInTheDocument();
  });
});
