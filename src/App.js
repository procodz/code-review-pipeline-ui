import React, { useState } from 'react';
import axios from 'axios';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { 
  Box, 
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './App.css';

function App() {
  const [code, setCode] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/review', { code });
      setResults(response.data.results);
    } catch (error) {
      console.error('Error reviewing code:', error);
      setError('Error reviewing code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const sections = results.split('###').filter(Boolean);
    
    return sections.map((section, index) => {
      const [title, ...content] = section.split('\n').filter(Boolean);
      return (
        <Accordion key={index} defaultExpanded>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#eeeeee',
              }
            }}
          >
            <Typography variant="h6">{title.trim()}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ p: 2 }}>
              {content.map((line, lineIndex) => {
                if (line.startsWith('Severity:')) {
                  const severity = line.split(':')[1].trim();
                  const color = {
                    'HIGH': 'error',
                    'MEDIUM': 'warning',
                    'LOW': 'success'
                  }[severity] || 'info';
                  
                  return (
                    <Alert key={lineIndex} severity={color} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        <strong>{line}</strong>
                      </Typography>
                    </Alert>
                  );
                } else if (line.startsWith('-')) {
                  return (
                    <Typography key={lineIndex} component="li" sx={{ ml: 2, mb: 1 }}>
                      {line.replace('- ', '')}
                    </Typography>
                  );
                } else if (line.trim()) {
                  return (
                    <Typography key={lineIndex} variant="body1" sx={{ mb: 1 }}>
                      {line}
                    </Typography>
                  );
                }
                return null;
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      );
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            textAlign: 'center',
            color: '#1976d2',
            fontWeight: 'bold',
            mb: 4
          }}
        >
          Code Review Pipeline
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={10}
              variant="outlined"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace'
                }
              }}
            />
            <Button 
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !code.trim()}
              sx={{ 
                minWidth: 200,
                height: 48
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Review Code'}
            </Button>
          </form>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {results && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Review Results
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {renderResults()}
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default App;
