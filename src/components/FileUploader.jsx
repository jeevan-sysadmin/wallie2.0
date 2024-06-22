// src/components/FileUploader.jsx
import { useState } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { Storage } from '@aws-amplify/storage';
import '@/amplifyconfiguration.json';  // Ensure this import is present

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const fileName = file.name;

    setUploading(true);

    try {
      // Upload file to S3 using Amplify Storage
      const result = await Storage.put(fileName, file, {
        contentType: file.type,
      });

      console.log('File uploaded successfully to S3:', result.key);

      // Optionally, if you want to call another API after the upload
      // const response = await axios.post('/api/upload', { key: result.key });
      // console.log('API response:', response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        File Upload
      </Typography>
      <TextField
        type="file"
        onChange={handleFileChange}
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>
    </Box>
  );
};

export default FileUploader;
