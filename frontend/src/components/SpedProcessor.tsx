import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import axios from 'axios';

// URL da API do arquivo .env
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface SpedResult {
  id: number;
  fileName: string;
  processedAt: string;
  totalRefund: number;
  details: {
    fuelType: string;
    referenceMonth: string;
    pmpfValue: number;
    quantity: number;
    totalSaleValue: number;
    unitSaleValue: number;
    difference: number;
    refund: number;
  }[];
}

const SpedProcessor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SpedResult | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Por favor, selecione um arquivo SPED');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/sped/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setError('Erro ao processar arquivo SPED. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!result) return;

    const headers = [
      'Combustível',
      'Mês de Referência',
      'Valor PMPF (R$)',
      'Quantidade (L)',
      'Valor Total Venda (R$)',
      'Valor Unitário Venda (R$)',
      'Diferença (R$)',
      'Restituição (R$)'
    ];
    
    const data = result.details.map(detail => [
      detail.fuelType,
      detail.referenceMonth,
      detail.pmpfValue.toFixed(2),
      detail.quantity.toFixed(2),
      detail.totalSaleValue.toFixed(2),
      detail.unitSaleValue.toFixed(2),
      detail.difference.toFixed(2),
      detail.refund.toFixed(2),
    ]
  );
  console.log(data)

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(',')),
      '',
      `Total a Restituir,${result.totalRefund.toFixed(2)}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sped_result_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Processamento de Arquivo SPED
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <input
            accept=".txt"
            style={{ display: 'none' }}
            id="sped-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="sped-file">
            <Button variant="contained" component="span">
              Selecionar Arquivo
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Arquivo selecionado: {file.name}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2, ml: 2 }}
            disabled={!file || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Processar'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {result && result.details && result.details.length > 0 ? (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Resultado do Processamento
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Arquivo: {result.fileName} | Processado em: {new Date(result.processedAt).toLocaleString()}
            </Typography>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Combustível</TableCell>
                    <TableCell>Mês de Referência</TableCell>
                    <TableCell align="right">Valor PMPF (R$)</TableCell>
                    <TableCell align="right">Quantidade (L)</TableCell>
                    <TableCell align="right">Valor Total Venda (R$)</TableCell>
                    <TableCell align="right">Valor Unitário Venda (R$)</TableCell>
                    <TableCell align="right">Diferença (R$)</TableCell>
                    <TableCell align="right">Restituição (R$)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.details.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>{detail.fuelType}</TableCell>
                      <TableCell>{detail.referenceMonth}</TableCell>
                      <TableCell align="right">{detail.pmpfValue.toFixed(2)}</TableCell>
                      <TableCell align="right">{detail.quantity.toFixed(2)}</TableCell>
                      <TableCell align="right">{detail.totalSaleValue.toFixed(2)}</TableCell>
                      <TableCell align="right">{detail.unitSaleValue.toFixed(2)}</TableCell>
                      <TableCell align="right">{detail.difference.toFixed(2)}</TableCell>
                      <TableCell align="right">{detail.refund.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={7} align="right">
                      <strong>Total a Restituir:</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{result.totalRefund.toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleExportCSV}
              >
                Exportar para CSV
              </Button>
            </Box>
          </Box>
        ) : result && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Nenhum registro de combustível encontrado no arquivo SPED.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default SpedProcessor; 