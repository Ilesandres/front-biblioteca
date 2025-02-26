import api from './api';

const templateService = {
    // Download template for a specific entity type
    downloadTemplate: async (entityType) => {
        try {
            const response = await api.get(`/admin/template?entity=${entityType}`, {
                responseType: 'blob'
            });
            
            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `plantilla_${entityType}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error downloading template:', error);
            throw error;
        }
    },

    // Import data from file
    importData: async (file, entities) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('entities', JSON.stringify(entities));

            const response = await api.post('/admin/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    },

    // Export data
    exportData: async (entities, format = 'excel') => {
        try {
            const response = await api.post('/admin/export', 
                { entities, format },
                { responseType: 'blob' }
            );

            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Set appropriate file extension based on format
            const extension = format === 'excel' ? 'xlsx' :
                            format === 'pdf' ? 'pdf' :
                            format === 'csv' ? 'csv' : 'sql';
            
            link.setAttribute('download', `biblioteca_export.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }
};

export default templateService;