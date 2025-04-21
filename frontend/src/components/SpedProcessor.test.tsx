import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpedProcessor from './SpedProcessor';
import axios from 'axios';

// Mock do axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SpedProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza o componente corretamente', () => {
    render(<SpedProcessor />);
    expect(screen.getByText('Processamento de Arquivo SPED')).toBeInTheDocument();
    expect(screen.getByText('Selecionar Arquivo')).toBeInTheDocument();
  });

  it('exibe mensagem quando nenhum arquivo está selecionado', () => {
    render(<SpedProcessor />);
    const processButton = screen.getByText('Processar');
    fireEvent.click(processButton);
    expect(screen.getByText('Por favor, selecione um arquivo SPED')).toBeInTheDocument();
  });

  it('atualiza o nome do arquivo quando um arquivo é selecionado', () => {
    render(<SpedProcessor />);
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/selecionar arquivo/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText('Arquivo selecionado: test.txt')).toBeInTheDocument();
  });

  it('processa o arquivo SPED com sucesso', async () => {
    const mockResponse = {
      data: {
        id: 1,
        fileName: 'test.txt',
        processedAt: '2024-03-20T10:00:00Z',
        totalRefund: 1000.00,
        details: [
          {
            fuelType: 'Gasolina',
            quantity: 1000,
            pmpfValue: 5.00,
            saleValue: 6000.00,
            refund: 1000.00
          }
        ]
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(<SpedProcessor />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/selecionar arquivo/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    const processButton = screen.getByText('Processar');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText('Resultado do Processamento')).toBeInTheDocument();
      expect(screen.getByText('Gasolina')).toBeInTheDocument();
      expect(screen.getByText('1000.00')).toBeInTheDocument();
      expect(screen.getByText('5.00')).toBeInTheDocument();
      expect(screen.getByText('6000.00')).toBeInTheDocument();
      expect(screen.getByText('1000.00')).toBeInTheDocument();
    });
  });

  it('exibe erro quando o processamento falha', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Erro ao processar arquivo'));

    render(<SpedProcessor />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/selecionar arquivo/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    const processButton = screen.getByText('Processar');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText('Erro ao processar arquivo SPED. Por favor, tente novamente.')).toBeInTheDocument();
    });
  });

  it('exporta os resultados para CSV quando disponível', async () => {
    const mockResponse = {
      data: {
        id: 1,
        fileName: 'test.txt',
        processedAt: '2024-03-20T10:00:00Z',
        totalRefund: 1000.00,
        details: [
          {
            fuelType: 'Gasolina',
            quantity: 1000,
            pmpfValue: 5.00,
            saleValue: 6000.00,
            refund: 1000.00
          }
        ]
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(<SpedProcessor />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/selecionar arquivo/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    const processButton = screen.getByText('Processar');
    fireEvent.click(processButton);

    await waitFor(() => {
      const exportButton = screen.getByText('Exportar para CSV');
      fireEvent.click(exportButton);
    });
  });
}); 