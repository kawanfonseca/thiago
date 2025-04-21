import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { FuelType, PmpfValue } from '../types';

const API_URL = 'http://localhost:3001/api';

const PmpfManager: React.FC = () => {
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [pmpfValues, setPmpfValues] = useState<PmpfValue[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFuelType, setSelectedFuelType] = useState<number>(0);
  const [pmpfValue, setPmpfValue] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFuelTypes();
    loadPmpfValues();
  }, []);

  const loadFuelTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/fuel-types`);
      setFuelTypes(response.data);
    } catch (error) {
      console.error('Erro ao carregar tipos de combustível:', error);
      setError('Erro ao carregar tipos de combustível');
    }
  };

  const loadPmpfValues = async () => {
    try {
      const response = await axios.get(`${API_URL}/pmpf-values`);
      setPmpfValues(response.data);
    } catch (error) {
      console.error('Erro ao carregar valores PMPF:', error);
      setError('Erro ao carregar valores PMPF');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedFuelType || !pmpfValue || !startDate || !endDate) {
        setError('Todos os campos são obrigatórios');
        return;
      }

      await axios.post(`${API_URL}/pmpf-values`, {
        fuelTypeId: selectedFuelType,
        value: parseFloat(pmpfValue),
        startDate,
        endDate
      });

      setOpenDialog(false);
      clearForm();
      loadPmpfValues();
    } catch (error: any) {
      console.error('Erro ao cadastrar valor PMPF:', error);
      setError(error.response?.data?.error || 'Erro ao cadastrar valor PMPF');
    }
  };

  const clearForm = () => {
    setSelectedFuelType(0);
    setPmpfValue('');
    setStartDate('');
    setEndDate('');
    setError(null);
  };

  const handleClose = () => {
    setOpenDialog(false);
    clearForm();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Gerenciamento de Valores PMPF</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Novo Valor PMPF
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Combustível</TableCell>
              <TableCell>Valor PMPF</TableCell>
              <TableCell>Início Vigência</TableCell>
              <TableCell>Fim Vigência</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pmpfValues.map((pmpf) => (
              <TableRow key={pmpf.id}>
                <TableCell>{pmpf.fuelType.name}</TableCell>
                <TableCell>
                  {pmpf.value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </TableCell>
                <TableCell>
                  {new Date(pmpf.startDate).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  {new Date(pmpf.endDate).toLocaleDateString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>Novo Valor PMPF</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Combustível</InputLabel>
              <Select
                value={selectedFuelType}
                label="Tipo de Combustível"
                onChange={(e) => setSelectedFuelType(Number(e.target.value))}
              >
                <MenuItem value={0}>Selecione...</MenuItem>
                {fuelTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Valor PMPF"
              type="number"
              value={pmpfValue}
              onChange={(e) => setPmpfValue(e.target.value)}
              inputProps={{ step: '0.01' }}
            />

            <TextField
              label="Início da Vigência"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Fim da Vigência"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PmpfManager; 