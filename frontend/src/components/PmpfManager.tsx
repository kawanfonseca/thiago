import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface FuelType {
  id: number;
  name: string;
  anpCode: string;
}

interface PmpfValue {
  id: number;
  fuelTypeId: number;
  value: number;
  startDate: string;
  endDate: string;
  fuelType: FuelType;
}

interface FormData {
  fuelTypeId: string;
  value: string;
  startDate: string;
  endDate: string;
}

const API_URL = 'http://localhost:3001/api';

const PmpfManager: React.FC = () => {
  const [pmpfValues, setPmpfValues] = useState<PmpfValue[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPmpfValue, setEditingPmpfValue] = useState<PmpfValue | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fuelTypeId: '',
    value: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchPmpfValues();
    fetchFuelTypes();
  }, []);

  const fetchPmpfValues = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/pmpf-values`);
      setPmpfValues(response.data);
    } catch (err) {
      setError('Erro ao carregar valores PMPF');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFuelTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/fuel-types`);
      setFuelTypes(response.data);
    } catch (err) {
      console.error('Erro ao carregar tipos de combustível:', err);
    }
  };

  const handleOpenDialog = (pmpfValue?: PmpfValue) => {
    if (pmpfValue) {
      setEditingPmpfValue(pmpfValue);
      setFormData({
        fuelTypeId: pmpfValue.fuelTypeId.toString(),
        value: pmpfValue.value.toString(),
        startDate: pmpfValue.startDate.split('T')[0],
        endDate: pmpfValue.endDate.split('T')[0]
      });
    } else {
      setEditingPmpfValue(null);
      setFormData({
        fuelTypeId: '',
        value: '',
        startDate: '',
        endDate: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPmpfValue(null);
    setFormData({
      fuelTypeId: '',
      value: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const data = {
        ...formData,
        value: parseFloat(formData.value),
        fuelTypeId: parseInt(formData.fuelTypeId)
      };

      if (editingPmpfValue) {
        await axios.put(`${API_URL}/pmpf-values/${editingPmpfValue.id}`, data);
        setSuccess('Valor PMPF atualizado com sucesso');
      } else {
        await axios.post(`${API_URL}/pmpf-values`, data);
        setSuccess('Valor PMPF criado com sucesso');
      }

      handleCloseDialog();
      fetchPmpfValues();
    } catch (err) {
      setError('Erro ao salvar valor PMPF');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este valor PMPF?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await axios.delete(`${API_URL}/pmpf-values/${id}`);
      setSuccess('Valor PMPF excluído com sucesso');
      fetchPmpfValues();
    } catch (err) {
      setError('Erro ao excluir valor PMPF');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Gerenciar Valores PMPF
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Valor
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo de Combustível</TableCell>
              <TableCell align="right">Valor (R$)</TableCell>
              <TableCell>Data Inicial</TableCell>
              <TableCell>Data Final</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : pmpfValues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhum valor PMPF cadastrado
                </TableCell>
              </TableRow>
            ) : (
              pmpfValues.map((pmpfValue) => (
                <TableRow key={pmpfValue.id}>
                  <TableCell>{pmpfValue.fuelType.name}</TableCell>
                  <TableCell align="right">
                    {pmpfValue.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>{formatDate(pmpfValue.startDate)}</TableCell>
                  <TableCell>{formatDate(pmpfValue.endDate)}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(pmpfValue)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(pmpfValue.id)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingPmpfValue ? 'Editar Valor PMPF' : 'Novo Valor PMPF'}
          </DialogTitle>
          <DialogContent>
            <TextField
              select
              autoFocus
              margin="dense"
              name="fuelTypeId"
              label="Tipo de Combustível"
              fullWidth
              value={formData.fuelTypeId}
              onChange={handleInputChange}
              required
            >
              {fuelTypes.map((fuelType) => (
                <MenuItem key={fuelType.id} value={fuelType.id}>
                  {fuelType.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="value"
              label="Valor (R$)"
              type="number"
              fullWidth
              value={formData.value}
              onChange={handleInputChange}
              required
              inputProps={{ step: '0.01', min: '0' }}
            />
            <TextField
              margin="dense"
              name="startDate"
              label="Data Inicial"
              type="date"
              fullWidth
              value={formData.startDate}
              onChange={handleInputChange}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="dense"
              name="endDate"
              label="Data Final"
              type="date"
              fullWidth
              value={formData.endDate}
              onChange={handleInputChange}
              required
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PmpfManager; 