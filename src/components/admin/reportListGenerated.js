import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Backdrop
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns/format';
import { es } from 'date-fns/locale/es';
import adminService from '../../services/admin.service';
import { useGlobalNotification } from '../GlobalNotification';

const ReportListGenerated = () => {
  const notify=useGlobalNotification();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(()=>{
          switch (message?.type) {
              case 'error':
                  notify.warning(message?.text)
                  break;
              case 'success' || 'succes':
                  notify.success(message?.text)
                  break;
              default:
                  message.text!=''?notify.error(message?.text || 'error'):'';
          }
      },[message])

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await adminService.getReports();
        setReports(response);
      } catch (error) {
        console.error('Error al obtener reportes:', error);
        setMessage({ text: 'Error al cargar los reportes', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleDownload = async (report) => {
    setLoading(true);
    try {
      const response = await adminService.downloadReport(report.id);
      
      const fileExtension = report.file_name.split('.').pop().toLowerCase();
      let mimeType = 'application/octet-stream';
      
      switch (fileExtension) {
        case 'xlsx':
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'pdf':
          mimeType = 'application/pdf';
          break;
        case 'json':
          mimeType = 'application/json';
          break;
        default:
          mimeType = 'application/octet-stream';
      }

      const blob = new Blob([response], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', report.file_name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage({ text: 'Reporte descargado con éxito', type: 'success' });
    } catch (error) {
      console.error('Error al descargar el reporte:', error);
      setMessage({ text: 'Error al descargar el reporte', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (report) => {
    setLoading(true);
    try {
      const response = await adminService.deleteReport(report.id);
      if(response.success) {
        setReports(reports.filter(r => r.id !== report.id));
        setMessage({ text: 'Reporte eliminado con éxito', type: 'success' });
      }
    } catch (error) {
      console.error('Error al eliminar el reporte:', error);
      setMessage({ text: 'Error al eliminar el reporte', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'processing':
        return 'Procesando';
      case 'error':
        return 'Error';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 2 }}
          onClose={() => setMessage({ text: '', type: 'success' })}
        >
          {message.text}
        </Alert>
      )}
      
      <Typography variant="h5" gutterBottom>
        Reportes Generados
      </Typography>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre de Reporte</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Fecha de Generación</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.file_name || 'report'}</TableCell>
                <TableCell>{report.nombre}</TableCell>
                <TableCell>
                  {report.uploaded_at ? format(new Date(report.uploaded_at), 'PPP p', { locale: es }) : 'Fecha no disponible'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(report.status)}
                    color={getStatusColor(report.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleDownload(report)}
                    disabled={loading}
                    title="Descargar reporte"
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(report)}
                    disabled={loading}
                    color="error"
                    title="Eliminar reporte"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ReportListGenerated;