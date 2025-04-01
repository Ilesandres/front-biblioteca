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
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Card,
  Divider,
  Grid,
  Avatar,
  useTheme,
  Fade,
  Badge
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataGrid } from '@mui/x-data-grid';
import { format } from 'date-fns/format';
import { es } from 'date-fns/locale/es';
import adminService from '../../services/admin.service';
import { useGlobalNotification } from '../GlobalNotification';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import NoDataIcon from '@mui/icons-material/SentimentDissatisfied';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// Función para obtener el tipo de icono según la extensión
const getFileIcon = (fileName) => {
  const extension = fileName?.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return <PictureAsPdfIcon sx={{ color: '#F44336' }} />;
    case 'csv':
      return <TableChartIcon sx={{ color: '#4CAF50' }} />;
    case 'xlsx':
      return <TableChartIcon sx={{ color: '#2196F3' }} />;
    case 'json':
      return <CodeIcon sx={{ color: '#FF9800' }} />;
    default:
      return <InsertDriveFileIcon sx={{ color: '#9E9E9E' }} />;
  }
};

// Función para obtener el color de fondo según la extensión
const getFileColor = (fileName) => {
  const extension = fileName?.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'rgba(244, 67, 54, 0.08)';
    case 'csv':
      return 'rgba(76, 175, 80, 0.08)';
    case 'xlsx':
      return 'rgba(33, 150, 243, 0.08)';
    case 'json':
      return 'rgba(255, 152, 0, 0.08)';
    default:
      return 'rgba(158, 158, 158, 0.08)';
  }
};

const ReportListGenerated = () => {
  const notify = useGlobalNotification();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const theme = useTheme();

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
        setMessage({ text: 'Error al cargar los reportes'+ error?.response?.data?.error, type: 'error'  });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleView = async (report) => {
    setLoading(true);
    try {
        const fileBlob = await adminService.viewReport(report.id);
      const fileExtension = report.file_name.split('.').pop().toLowerCase();
        let content = null;
      
      if (fileExtension === 'pdf') {
            const pdfBlob = new Blob([fileBlob], { type: 'application/pdf' });
            const url = URL.createObjectURL(pdfBlob);
            content = { url, type: 'pdf' };
            setFileContent(content);
      } else if (fileExtension === 'csv') {
            // Para archivos CSV, simplemente mostrar como texto sin procesar
            const text = await fileBlob.text();
            content = text;
            setFileContent(content);
      } else if (fileExtension === 'xlsx') {
              const arrayBuffer = await fileBlob.arrayBuffer();
              const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
          
              content = XLSX.utils.sheet_to_json(sheet, { 
                  header: 1,  
                  raw: false,       
                  defval: '',     
                  blankrows: false, 
                  dateNF: 'yyyy-mm-dd' 
              });
          
              // Filtrar filas vacías de manera más robusta
              content = content.filter(row => row.some(cell => cell && cell.toString().trim() !== ''));
              
              // Corregido: quitar el operador spread y simplemente asignar el array
              setFileContent(content);
      } else if (fileExtension === 'json') {
            const text = await fileBlob.text();
            content = JSON.parse(text);
            setFileContent(content);
      } else {
            const text = await fileBlob.text();
            content = text;
            setFileContent(content);
      }
      
      setSelectedReport(report);
      setViewDialogOpen(true);

    } catch (error) {
      console.error('Error al visualizar el reporte:', error);
        setMessage({ text: 'Error al visualizar el reporte: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
};

const handleCloseDialog = () => {
  try {
    if (selectedReport?.file_name?.endsWith('.pdf') && fileContent?.url) {
      URL.revokeObjectURL(fileContent.url);
    }
  } catch (error) {
    console.error('Error al cerrar el diálogo:', error);
  } finally {
    setFileContent(null);
    setSelectedReport(null);
    setViewDialogOpen(false);
    }
  };

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

  const handleTableChange = (index) => {
    if (fileContent?.tables && fileContent.tables[index]) {
      setCurrentTableIndex(index);
    }
  };

  const procesarCSVSimple = async (csvText) => {
    try {
      // Usar Papa Parse para analizar el texto CSV
      const resultado = Papa.parse(csvText, {
        delimiter: ',',
        header: false,
        skipEmptyLines: true,
        quoteChar: '"',
        escapeChar: '"'
      });
      
      // Crear el formato requerido: {fila1: [dato1, "dato2"], fila2: [dato1, "dato2"]}
      const datosFormateados = {};
      
      resultado.data.forEach((fila, indice) => {
        datosFormateados[`fila${indice + 1}`] = fila;
      });
      
      return datosFormateados;
    } catch (error) {
      console.error("Error al procesar el CSV:", error);
      throw error;
    }
  };

  const exportarFormatoSimple = async () => {
    try {
      setLoading(true);
      
      // Si ya tenemos el texto del CSV en fileContent, usarlo directamente
      if (typeof fileContent === 'string' && selectedReport?.file_name?.endsWith('.csv')) {
        const datosFormateados = await procesarCSVSimple(fileContent);
        
        // Convertir a JSON y crear blob para descarga
        const jsonString = JSON.stringify(datosFormateados, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Descargar el archivo
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${selectedReport.file_name.replace('.csv', '')}_simple.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setMessage({ text: 'Datos exportados con éxito en formato simple', type: 'success' });
      } else {
        // Si no tenemos el texto, obtenemos el archivo original y lo procesamos
        const fileBlob = await adminService.viewReport(selectedReport.id);
        const texto = await fileBlob.text();
        const datosFormateados = await procesarCSVSimple(texto);
        
        // Convertir a JSON y crear blob para descarga
        const jsonString = JSON.stringify(datosFormateados, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Descargar el archivo
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${selectedReport.file_name.replace('.csv', '')}_simple.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setMessage({ text: 'Datos exportados con éxito en formato simple', type: 'success' });
      }
    } catch (error) {
      console.error('Error al exportar en formato simple:', error);
      setMessage({ text: 'Error al exportar datos: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Método alternativo en caso de que el anterior no funcione bien
  const parseCSVLineAlternative = (line) => {
    if (!line || line.trim() === '') return [];
    
    // Implementación alternativa usando expresiones regulares
    // Esta regex busca: campos entre comillas con posibles comas dentro, o campos sin comillas separados por comas
    const regex = /("([^"]|"")*")|([^,]+)/g;
    const matches = line.match(regex) || [];
    
    // Limpiar los resultados (quitar comillas externas)
    return matches.map(match => {
        if (match.startsWith('"') && match.endsWith('"')) {
            // Quitar comillas externas y reemplazar dobles comillas internas por comillas simples
            return match.substring(1, match.length - 1).replace(/""/g, '"');
        }
        return match;
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card 
        elevation={3}
        sx={{ 
          p: 0, 
          mb: 4, 
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            p: 3,
            backgroundImage: 'linear-gradient(120deg, #3949AB, #1E88E5)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: 'white', 
                color: theme.palette.primary.main,
                width: 52,
                height: 52,
                boxShadow: 2,
                mr: 2
              }}
            >
              <AssessmentIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Informes y Reportes
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
                {reports.length} {reports.length === 1 ? 'informe disponible' : 'informes disponibles'}
              </Typography>
            </Box>
          </Box>
          
          <Chip 
            icon={<DownloadIcon />} 
            label="Reportes generados" 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.15)', 
              color: 'white',
              fontWeight: 600,
              '& .MuiChip-icon': { color: 'white' }
            }} 
          />
        </Box>

        <Box p={3}>
          {message.text && (
            <Alert 
              severity={message.type} 
              onClose={() => setMessage({text: '', type: 'info'})} 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}
              variant="filled"
            >
              {message.text}
            </Alert>
          )}

          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>

          {reports.length === 0 ? (
            <Fade in={true}>
              <Card 
                elevation={0} 
                sx={{ 
                  textAlign: 'center', 
                  py: 6, 
                  px: 2,
                  borderRadius: 3,
                  backgroundColor: '#f5f5f5',
                  border: '1px dashed #ccc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <NoDataIcon sx={{ fontSize: 70, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay reportes disponibles
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                  Aún no se han generado reportes en el sistema. Los reportes aparecerán aquí una vez creados.
                </Typography>
              </Card>
            </Fade>
          ) : (
            <Grid container spacing={3}>
              {reports.map((report, index) => (
                <Grid item xs={12} sm={6} md={4} key={report.id}>
                  <Fade in={true} timeout={300 + (index % 12) * 50}>
                    <Card 
                      elevation={2} 
                      sx={{ 
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          alignItems: 'center',
                          bgcolor: getFileColor(report.file_name),
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Avatar 
                          variant="rounded" 
                          sx={{ 
                            bgcolor: 'white',
                            boxShadow: 1,
                            width: 40,
                            height: 40
                          }}
                        >
                          {getFileIcon(report.file_name)}
                        </Avatar>
                        <Box sx={{ ml: 2, flex: 1, overflow: 'hidden' }}>
                          <Tooltip title={report.file_name || 'Reporte'}>
                            <Typography variant="subtitle1" sx={{ 
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {report.file_name || 'Reporte'}
                            </Typography>
                          </Tooltip>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            {report.uploaded_at ? format(new Date(report.uploaded_at), 'PPP', { locale: es }) : 'Fecha no disponible'}
                          </Typography>
                        </Box>
                        <Chip
                          label={getStatusLabel(report.status)}
                          color={getStatusColor(report.status)}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            ml: 1
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                          Responsable: <span style={{ fontWeight: 500, color: '#333' }}>{report.nombre}</span>
                        </Typography>
                          
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            size="small"
                            onClick={() => handleView(report)}
                            disabled={loading}
                            sx={{ 
                              borderRadius: 2,
                              flex: 1,
                              mr: 1,
                              textTransform: 'none'
                            }}
                          >
                            Ver
                          </Button>
                          
                          <Tooltip title="Descargar reporte">
                            <IconButton
                              onClick={() => handleDownload(report)}
                              disabled={loading}
                              color="primary"
                              size="small"
                              sx={{ 
                                mx: 0.5, 
                                bgcolor: 'rgba(25, 118, 210, 0.08)',
                                '&:hover': {
                                  bgcolor: 'rgba(25, 118, 210, 0.15)',
                                }
                              }}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Eliminar reporte">
                            <IconButton
                              onClick={() => handleDelete(report)}
                              disabled={loading}
                              color="error"
                              size="small"
                              sx={{ 
                                ml: 0.5, 
                                bgcolor: 'rgba(211, 47, 47, 0.08)',
                                '&:hover': {
                                  bgcolor: 'rgba(211, 47, 47, 0.15)',
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Card>

      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '75vh',
            maxHeight: '90vh',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          p: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              variant="rounded" 
              sx={{ 
                width: 40, 
                height: 40, 
                mr: 1.5, 
                bgcolor: getFileColor(selectedReport?.file_name) 
              }}
            >
              {getFileIcon(selectedReport?.file_name)}
            </Avatar>
            <Typography variant="h6" sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: '#3f51b5',
              fontWeight: 600
            }}>
              {selectedReport?.file_name}
            </Typography>
          </Box>
          
          {selectedReport?.file_name?.endsWith('.csv') && (
            <Button 
              variant="contained" 
              size="small"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={exportarFormatoSimple}
              disabled={loading}
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Exportar en formato simple
            </Button>
          )}
        </DialogTitle>
        <DialogContent 
          sx={{ 
            p: 0, 
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '70vh'
            }}>
              <CircularProgress />
            </Box>
          ) : selectedReport && (
            <Box sx={{ width: '100%', height: '100%', p: 2 }}>
              {selectedReport.file_name.endsWith('.pdf') && fileContent?.url ? (
                <Box sx={{ 
                  width: '100%', 
                  height: '70vh', 
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 1,
                  boxShadow: 3
                }}>
                  <iframe
                    src={fileContent.url}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      border: 'none' 
                    }}
                    title="PDF Viewer"
                    allow="fullscreen"
                  />
                </Box>
              ) : selectedReport.file_name.endsWith('.csv') ? (
                <Box 
                  sx={{ 
                    height: '68vh', 
                    overflowY: 'auto', 
                    backgroundColor: '#f8f9fa',
                    p: 3,
                    borderRadius: 1,
                    fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: '#212529',
                    border: '1px solid #dee2e6',
                    boxShadow: 1,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#c1c1c1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#a8a8a8',
                    },
                  }}
                >
                  {fileContent}
                </Box>
              ) : selectedReport.file_name.match(/\.(xlsx)$/) ? (
                <Card 
                  elevation={2} 
                  sx={{ 
                    height: '68vh', 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: 1
                  }}
                >
                  {/* Botones para navegar entre tablas, solo mostrar si hay múltiples tablas */}
                  {fileContent?.tables && fileContent.tables.length > 1 && (
                    <Box sx={{ 
                      p: 2, 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1,
                      borderBottom: '1px solid #e0e0e0',
                      backgroundColor: '#f5f5f5'
                    }}>
                      {fileContent.tables.map((tabla, idx) => (
                        <Button
                          key={idx}
                          variant={idx === currentTableIndex ? "contained" : "outlined"}
                          size="small"
                          onClick={() => handleTableChange(idx)}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: idx === currentTableIndex ? 600 : 400
                          }}
                        >
                          {tabla.nombre || `Tabla ${idx + 1}`}
                        </Button>
                      ))}
                    </Box>
                  )}
                  
                  {/* Mostrar el nombre e ID de la tabla actual */}
                  {fileContent?.tables && fileContent.tables[currentTableIndex] && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 2,
                      backgroundColor: '#f9f9f9',
                      borderBottom: '1px solid #eeeeee'
                    }}>
                      <Typography variant="h6" component="h2">
                        <span style={{ fontWeight: 600, color: '#3f51b5' }}>
                          Tabla: {fileContent.tables[currentTableIndex]?.nombre || 'Sin nombre'}
                        </span>
                        {fileContent.tables[currentTableIndex]?.id && (
                          <Typography component="span" variant="subtitle1" sx={{ 
                            ml: 1, 
                            color: 'text.secondary',
                            backgroundColor: '#e3f2fd',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.8rem'
                          }}>
                            ID: {fileContent.tables[currentTableIndex].id}
                          </Typography>
                        )}
                      </Typography>
                      
                      {fileContent.tables.length > 1 && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            onClick={() => setCurrentTableIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentTableIndex === 0}
                            size="small"
                            sx={{ 
                              color: currentTableIndex === 0 ? 'text.disabled' : 'primary.main',
                              backgroundColor: currentTableIndex === 0 ? 'transparent' : 'rgba(25, 118, 210, 0.08)'
                            }}
                          >
                            <NavigateBeforeIcon />
                          </IconButton>
                          
                          <Typography sx={{ 
                            mx: 2, 
                            backgroundColor: '#e3f2fd', 
                            px: 1.5, 
                            py: 0.5, 
                            borderRadius: 4,
                            minWidth: '60px',
                            textAlign: 'center',
                            fontWeight: 500
                          }}>
                            {currentTableIndex + 1} / {fileContent.tables.length}
                          </Typography>
                          
                          <IconButton 
                            onClick={() => setCurrentTableIndex(prev => Math.min(fileContent.tables.length - 1, prev + 1))}
                            disabled={currentTableIndex === fileContent.tables.length - 1}
                            size="small"
                            sx={{ 
                              color: currentTableIndex === fileContent.tables.length - 1 ? 'text.disabled' : 'primary.main',
                              backgroundColor: currentTableIndex === fileContent.tables.length - 1 ? 'transparent' : 'rgba(25, 118, 210, 0.08)'
                            }}
                          >
                            <NavigateNextIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    flex: 1, 
                    overflow: 'auto',
                    '& .MuiDataGrid-root': {
                      border: 'none'
                    }
                  }}>
                    <DataGrid
                      rows={(() => {
                        // Determinar los datos a mostrar según el tipo de fileContent
                        let datos = [];
                        let headers = [];
                        
                        if (fileContent?.tables && fileContent.tables[currentTableIndex]) {
                          // Si tenemos múltiples tablas
                          const tablaActual = fileContent.tables[currentTableIndex];
                          headers = tablaActual.columnas;
                          datos = tablaActual.datos;
                          
                          console.log('Renderizando tabla:', tablaActual.nombre);
                          console.log('Headers:', headers);
                          console.log('Total de filas de datos:', datos.length);
                          if (datos.length > 0) {
                            console.log('Primera fila de datos para DataGrid:', datos[0]);
                          }
                        } else if (Array.isArray(fileContent)) {
                          // Si tenemos un array simple (formato antiguo)
                          headers = fileContent[0] || [];
                          datos = fileContent.slice(1) || [];
                        }
                        
                        // Si no hay datos, devolver un array con un mensaje
                        if (!datos || datos.length === 0) {
                          console.log('No hay datos para mostrar en la tabla');
                          return [{ id: 0, col_0: 'No hay datos disponibles en esta tabla' }];
                        }
                        
                        // Mapear los datos para el DataGrid
                        return datos.map((row, index) => {
                          // Si no es un array, devolver un objeto con solo el ID
                          if (!Array.isArray(row)) {
                            console.error('Fila no es array:', row);
                            return { id: index + 1, col_0: 'Error: formato de fila inválido' };
                          }
                          
                          // Si todas las celdas están vacías, omitir esta fila
                          if (row.every(cell => !cell || cell.toString().trim() === '')) {
                            console.log(`Fila ${index + 1} está vacía, omitiendo`);
                            return null;
                          }
                          
                          // Si no hay headers, usar índices como headers
                          if (!Array.isArray(headers) || headers.length === 0) {
                            console.warn('No hay headers, usando índices');
                            headers = Array(row.length).fill().map((_, i) => `Columna ${i + 1}`);
                          }
                          
                          // Para debugging: mostrar el número de columnas vs. el número de valores
                          if (row.length !== headers.length) {
                            console.warn(`La fila ${index + 1} tiene ${row.length} valores pero hay ${headers.length} columnas`);
                          }
                    
                          // Crear el objeto de datos para la fila
                          const rowData = { id: index + 1 };
                    
                          // Procesar cada celda
                          // Usar el número máximo entre headers y row para no perder datos
                          const maxLength = Math.max(headers.length, row.length);
                          for (let idx = 0; idx < maxLength; idx++) {
                            // Asegurar que el nombre de la columna sea válido
                            const header = idx < headers.length ? headers[idx] : `Columna ${idx + 1}`;
                            const columnName = (header || '').toString().trim() || `Columna ${idx + 1}`;
                            // Crear el identificador de campo compatible con el DataGrid
                            const fieldIdentifier = `col_${idx}`; // Usar col_X para garantizar unicidad
                            
                            // Asegurar que no excedemos el índice de la fila
                            const cellValue = idx < row.length ? row[idx] : '';
                            
                            // Manejo de valores nulos y tipos de datos
                            if (cellValue === null || cellValue === undefined || cellValue === '') {
                              rowData[fieldIdentifier] = '-';
                            } else if (typeof cellValue === 'number') {
                              rowData[fieldIdentifier] = cellValue;
                            } else if (typeof cellValue === 'boolean') {
                              rowData[fieldIdentifier] = cellValue ? 'Sí' : 'No';
                            } else if (cellValue && !isNaN(Date.parse(cellValue))) {
                              try {
                                rowData[fieldIdentifier] = new Date(cellValue).toLocaleDateString();
                              } catch (e) {
                                rowData[fieldIdentifier] = cellValue.toString().trim() || '-';
                              }
                            } else {
                              rowData[fieldIdentifier] = cellValue.toString().trim() || '-';
                            }

                          }
                          
                          // Para debugging: mostrar la primera fila procesada
                          if (index === 0) {
                            console.log(`Primera fila procesada para DataGrid:`, rowData);
                          }
                    
                          return rowData;
                        }).filter(Boolean); // Filtrar valores nulos
                      })()}
                      columns={(() => {
                        // Determinar las columnas a mostrar
                        let headers = [];
                        
                        if (fileContent?.tables && fileContent.tables[currentTableIndex]) {
                          // Si tenemos múltiples tablas
                          const tablaActual = fileContent.tables[currentTableIndex];
                          headers = tablaActual.columnas;
                        } else if (Array.isArray(fileContent)) {
                          // Si tenemos un array simple (formato antiguo)
                          headers = fileContent[0] || [];
                        }
                        
                        // Si no hay datos, mostrar columna especial
                        if (!headers || headers.length === 0) {
                          console.log('No hay headers para mostrar en la tabla');
                          return [{ field: 'col_0', headerName: 'Mensaje', flex: 1 }];
                        }
                        
                        // Para debugging: mostrar las columnas que se van a renderizar
                        console.log('Columnas a renderizar para DataGrid:', headers);
                        
                        // Mapear las columnas para el DataGrid
                        return headers.map((header, index) => {
                          // Asegurar que el nombre de la columna sea válido y único
                          const headerName = (header || '').toString().trim() || `Columna ${index + 1}`;
                          const fieldIdentifier = `col_${index}`; // Usar col_X para garantizar unicidad
                          
                          console.log(`Header ${index + 1}: "${headerName}" -> fieldId: "${fieldIdentifier}"`);
                          
                          return {
                            field: fieldIdentifier,
                            headerName: headerName,
                            flex: 1,
                            minWidth: 150,
                            sortable: true,
                            filterable: true,
                            resizable: true,
                            renderCell: (params) => (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                padding: '8px',
                                whiteSpace: 'normal',
                                wordWrap: 'break-word',
                                lineHeight: '1.2',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                {params.value}
                              </div>
                            )
                          };
                        });
                      })()}
                      
                      noRowsOverlayText="No hay datos disponibles"
                      components={{
                        NoRowsOverlay: () => (
                          <Box sx={{ 
                            display: 'flex', 
                            height: '100%', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            p: 4
                          }}>
                            <Typography variant="body1" color="textSecondary" sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center'
                            }}>
                              <Box sx={{ mb: 2, color: 'text.secondary', opacity: 0.5 }}>
                                <VisibilityIcon sx={{ fontSize: 40 }} />
                              </Box>
                              No hay datos disponibles en esta tabla
                            </Typography>
                          </Box>
                        )
                      }}
                      
                      autoHeight
                      initialState={{
                        pagination: { pageSize: 10 },
                      }}
                      pageSizeOptions={[5, 10, 25, 50]}
                      disableSelectionOnClick
                      getRowHeight={() => 'auto'}
                      sx={{
                        '& .MuiDataGrid-cell': {
                          whiteSpace: 'normal',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          borderBottom: '1px solid #f0f0f0'
                        },
                        '& .MuiDataGrid-columnHeader': {
                          backgroundColor: '#f5f5f5',
                          fontWeight: 'bold',
                          color: '#3f51b5'
                        },
                        '& .MuiDataGrid-row:nth-of-type(odd)': {
                          backgroundColor: '#fafafa'
                        },
                        '& .MuiDataGrid-row:hover': {
                          backgroundColor: '#f0f7ff'
                        },
                        '& .MuiDataGrid-columnHeadersInner': {
                          backgroundColor: '#f5f5f5'
                        },
                        height: '100%',
                        border: 'none'
                      }}
                    />
                  </Box>
                </Card>
              ) : selectedReport.file_name.match(/\.(json)$/) ? (
                <Box 
                  sx={{ 
                    height: '68vh', 
                    overflowY: 'auto', 
                    backgroundColor: '#1e1e1e',
                    p: 3,
                    borderRadius: 1,
                    fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem',
                    color: '#cccccc',
                    boxShadow: 1,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#2c2c2c',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#555',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#777',
                    },
                  }}
                >
                  {typeof fileContent === 'object'
                    ? JSON.stringify(fileContent, null, 2)
                        .replace(/"([^"]+)":/g, '<span style="color: #569CD6;">"$1"</span>:')
                        .replace(/(true|false|null)/g, '<span style="color: #569CD6;">$1</span>')
                        .replace(/(\d+)/g, '<span style="color: #B5CEA8;">$1</span>')
                        .replace(/(".*?")/g, '<span style="color: #CE9178;">$1</span>')
                    : fileContent}
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    height: '68vh', 
                    overflowY: 'auto', 
                    backgroundColor: '#f8f9fa',
                    p: 3,
                    borderRadius: 1,
                    fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: '#212529',
                    border: '1px solid #dee2e6',
                    boxShadow: 1
                  }}
                >
                  {typeof fileContent === 'object'
                    ? JSON.stringify(fileContent, null, 2)
                    : fileContent}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
          justifyContent: 'space-between'
        }}>
          <Typography variant="body2" color="text.secondary">
            {selectedReport?.nombre && `Generado por: ${selectedReport.nombre}`}
          </Typography>
          
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportListGenerated;