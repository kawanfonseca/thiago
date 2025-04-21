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
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface FuelType {
  id: number;
  name: string;
  anpCode: string;
  icmsRate: number;
}

const API_URL = 'http://localhost:3001/api';

const FuelTypeManager: React.FC = () => {
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFuelType, setEditingFuelType] = useState<FuelType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    anpCode: '',
    icmsRate: ''
  });

  useEffect(() => {
    fetchFuelTypes();
  }, []);

  const fetchFuelTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/fuel-types`);
      setFuelTypes(response.data);
    } catch (err) {
      setError('Erro ao carregar tipos de combustível');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (fuelType?: FuelType) => {
    if (fuelType) {
      setEditingFuelType(fuelType);
      setFormData({
        name: fuelType.name,
        anpCode: fuelType.anpCode,
        icmsRate: fuelType.icmsRate.toString()
      });
    } else {
      setEditingFuelType(null);
      setFormData({
        name: '',
        anpCode: '',
        icmsRate: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFuelType(null);
    setFormData({
      name: '',
      anpCode: '',
      icmsRate: ''
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
        icmsRate: parseFloat(formData.icmsRate)
      };

      if (editingFuelType) {
        await axios.put(`${API_URL}/fuel-types/${editingFuelType.id}`, data);
        setSuccess('Tipo de combustível atualizado com sucesso');
      } else {
        await axios.post(`${API_URL}/fuel-types`, data);
        setSuccess('Tipo de combustível criado com sucesso');
      }

      handleCloseDialog();
      fetchFuelTypes();
    } catch (err) {
      setError('Erro ao salvar tipo de combustível');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este tipo de combustível?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await axios.delete(`${API_URL}/fuel-types/${id}`);
      setSuccess('Tipo de combustível excluído com sucesso');
      fetchFuelTypes();
    } catch (err) {
      setError('Erro ao excluir tipo de combustível');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Gerenciar Tipos de Combustível
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Tipo
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
              <TableCell>Nome</TableCell>
              <TableCell>Código ANP</TableCell>
              <TableCell align="right">Alíquota ICMS (%)</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : fuelTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhum tipo de combustível cadastrado
                </TableCell>
              </TableRow>
            ) : (
              fuelTypes.map((fuelType) => (
                <TableRow key={fuelType.id}>
                  <TableCell>{fuelType.name}</TableCell>
                  <TableCell>{fuelType.anpCode}</TableCell>
                  <TableCell align="right">
                    {fuelType.icmsRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(fuelType)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(fuelType.id)}
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
            {editingFuelType ? 'Editar Tipo de Combustível' : 'Novo Tipo de Combustível'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Nome"
              type="text"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="anpCode"
              label="Código ANP"
              type="text"
              fullWidth
              value={formData.anpCode}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="icmsRate"
              label="Alíquota ICMS (%)"
              type="number"
              fullWidth
              value={formData.icmsRate}
              onChange={handleInputChange}
              required
              inputProps={{ step: '0.01', min: '0', max: '100' }}
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

export default FuelTypeManager; 