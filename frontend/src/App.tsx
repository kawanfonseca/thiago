import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';
import { RefundCalculation } from './types';
import PmpfManager from './components/PmpfManager';

const API_URL = 'http://localhost:3001/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [calculations, setCalculations] = useState<RefundCalculation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCalculations(response.data);
    } catch (err) {
      setError('Erro ao processar o arquivo. Por favor, tente novamente.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          ICMS-ST Combustíveis – Restituição 2017/2018
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Processamento SPED" />
            <Tab label="Valores PMPF" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
              >
                Selecionar Arquivo SPED
                <input
                  type="file"
                  hidden
                  accept=".txt"
                  onChange={handleFileChange}
                />
              </Button>
              <Typography>
                {file ? file.name : 'Nenhum arquivo selecionado'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Processar'}
              </Button>
            </Box>

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Paper>

          {calculations.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Combustível</TableCell>
                    <TableCell>Período</TableCell>
                    <TableCell align="right">Quantidade (L)</TableCell>
                    <TableCell align="right">Valor Total (R$)</TableCell>
                    <TableCell align="right">PMPF (R$)</TableCell>
                    <TableCell align="right">Alíquota ICMS (%)</TableCell>
                    <TableCell align="right">Restituição (R$)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calculations.map((calc, index) => (
                    <TableRow key={index}>
                      <TableCell>{calc.fuelType}</TableCell>
                      <TableCell>{calc.period}</TableCell>
                      <TableCell align="right">
                        {calc.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}
                      </TableCell>
                      <TableCell align="right">
                        {calc.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        {calc.pmpf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        {(calc.icmsRate * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell align="right">
                        {calc.refundAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <PmpfManager />
        </TabPanel>
      </Box>
    </Container>
  );
}

export default App;
