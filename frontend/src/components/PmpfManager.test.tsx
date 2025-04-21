import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PmpfManager from './PmpfManager';
import axios from 'axios';

// Mock do axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PmpfManager Component', () => {
  const mockFuelTypes = [
    { id: 1, name: 'Gasolina', anpCode: '001', icmsRate: 25 },
    { id: 2, name: 'Etanol', anpCode: '002', icmsRate: 25 }
  ];

  const mockPmpfValues = [
    {
      id: 1,
      fuelTypeId: 1,
      fuelType: { name: 'Gasolina' },
      value: 5.5,
      startDate: '2023-01-01',
      endDate: '2023-01-31'
    }
  ];

  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Configurar mocks padrão para as chamadas de API
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/fuel-types')) {
        return Promise.resolve({ data: mockFuelTypes });
      }
      if (url.includes('/pmpf-values')) {
        return Promise.resolve({ data: mockPmpfValues });
      }
      return Promise.reject(new Error('URL não mapeada'));
    });
  });

  test('renderiza o título do componente', () => {
    render(<PmpfManager />);
    const titleElement = screen.getByText(/Gerenciamento de Valores PMPF/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('carrega e exibe os valores PMPF', async () => {
    render(<PmpfManager />);
    
    // Verificar se o loading é exibido inicialmente
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
    
    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Gasolina')).toBeInTheDocument();
      expect(screen.getByText('R$ 5,50')).toBeInTheDocument();
    });
  });

  test('abre o diálogo de criação ao clicar no botão adicionar', async () => {
    render(<PmpfManager />);
    
    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(screen.getByText('Gasolina')).toBeInTheDocument();
    });
    
    // Clicar no botão de adicionar
    const addButton = screen.getByText(/Adicionar Valor PMPF/i);
    fireEvent.click(addButton);
    
    // Verificar se o diálogo é aberto
    expect(screen.getByText(/Novo Valor PMPF/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Combustível/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Data Inicial/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Data Final/i)).toBeInTheDocument();
  });

  test('cria um novo valor PMPF com sucesso', async () => {
    // Configurar o mock para a criação
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id: 2,
        fuelTypeId: 2,
        fuelType: { name: 'Etanol' },
        value: 4.5,
        startDate: '2023-02-01',
        endDate: '2023-02-28'
      }
    });
    
    render(<PmpfManager />);
    
    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(screen.getByText('Gasolina')).toBeInTheDocument();
    });
    
    // Abrir o diálogo de criação
    const addButton = screen.getByText(/Adicionar Valor PMPF/i);
    fireEvent.click(addButton);
    
    // Preencher o formulário
    fireEvent.change(screen.getByLabelText(/Combustível/i), {
      target: { value: '2' }
    });
    fireEvent.change(screen.getByLabelText(/Valor/i), {
      target: { value: '4.5' }
    });
    fireEvent.change(screen.getByLabelText(/Data Inicial/i), {
      target: { value: '2023-02-01' }
    });
    fireEvent.change(screen.getByLabelText(/Data Final/i), {
      target: { value: '2023-02-28' }
    });
    
    // Submeter o formulário
    const submitButton = screen.getByText(/Salvar/i);
    fireEvent.click(submitButton);
    
    // Verificar se a mensagem de sucesso é exibida
    await waitFor(() => {
      expect(screen.getByText(/Valor PMPF criado com sucesso/i)).toBeInTheDocument();
    });
    
    // Verificar se o novo valor é exibido na tabela
    expect(screen.getByText('Etanol')).toBeInTheDocument();
    expect(screen.getByText('R$ 4,50')).toBeInTheDocument();
  });

  test('mostra erro ao criar valor PMPF com dados inválidos', async () => {
    // Configurar o mock para retornar erro
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Dados inválidos'
        }
      }
    });
    
    render(<PmpfManager />);
    
    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(screen.getByText('Gasolina')).toBeInTheDocument();
    });
    
    // Abrir o diálogo de criação
    const addButton = screen.getByText(/Adicionar Valor PMPF/i);
    fireEvent.click(addButton);
    
    // Tentar submeter o formulário vazio
    const submitButton = screen.getByText(/Salvar/i);
    fireEvent.click(submitButton);
    
    // Verificar se a mensagem de erro é exibida
    await waitFor(() => {
      expect(screen.getByText(/Dados inválidos/i)).toBeInTheDocument();
    });
  });

  test('exclui um valor PMPF com sucesso', async () => {
    // Configurar o mock para a exclusão
    mockedAxios.delete.mockResolvedValueOnce({});
    
    render(<PmpfManager />);
    
    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(screen.getByText('Gasolina')).toBeInTheDocument();
    });
    
    // Clicar no botão de excluir
    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);
    
    // Confirmar a exclusão
    const confirmButton = screen.getByText(/Confirmar/i);
    fireEvent.click(confirmButton);
    
    // Verificar se a mensagem de sucesso é exibida
    await waitFor(() => {
      expect(screen.getByText(/Valor PMPF excluído com sucesso/i)).toBeInTheDocument();
    });
    
    // Verificar se o valor foi removido da tabela
    expect(screen.queryByText('Gasolina')).not.toBeInTheDocument();
  });

  test('edita um valor PMPF com sucesso', async () => {
    // Configurar o mock para a edição
    mockedAxios.put.mockResolvedValueOnce({
      data: {
        id: 1,
        fuelTypeId: 1,
        fuelType: { name: 'Gasolina' },
        value: 6.0,
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      }
    });
    
    render(<PmpfManager />);
    
    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(screen.getByText('Gasolina')).toBeInTheDocument();
    });
    
    // Clicar no botão de editar
    const editButton = screen.getByTestId('edit-button-1');
    fireEvent.click(editButton);
    
    // Alterar o valor
    fireEvent.change(screen.getByLabelText(/Valor/i), {
      target: { value: '6.0' }
    });
    
    // Salvar as alterações
    const saveButton = screen.getByText(/Salvar/i);
    fireEvent.click(saveButton);
    
    // Verificar se a mensagem de sucesso é exibida
    await waitFor(() => {
      expect(screen.getByText(/Valor PMPF atualizado com sucesso/i)).toBeInTheDocument();
    });
    
    // Verificar se o novo valor é exibido na tabela
    expect(screen.getByText('R$ 6,00')).toBeInTheDocument();
  });
});

export {}; 