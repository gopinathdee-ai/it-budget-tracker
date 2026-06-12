import { useState } from 'react';
import { Box, Button, Typography, Dialog, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import GACostsTable from '../components/GACosts/GACostsTable.jsx';
import GACostsForm from '../components/GACosts/GACostsForm.jsx';
import GACostsDashboard from '../components/GACosts/GACostsDashboard.jsx';

export default function GACostsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCost, setSelectedCost] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (cost) => {
    setSelectedCost(cost);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedCost(null);
    setRefreshKey(k => k + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCost(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            G&A Costs Management
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Manage and track all G&A costs across your organization
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedCost(null);
            setShowForm(true);
          }}
          sx={{ fontWeight: 600 }}
        >
          New G&A Cost
        </Button>
      </Box>

      {/* Dashboard */}
      <GACostsDashboard refreshTrigger={refreshKey} />

      {/* Form Modal */}
      <Dialog
        open={showForm}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
      >
        <GACostsForm
          cost={selectedCost}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Dialog>

      {/* Table */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          G&A Costs List
        </Typography>
        <GACostsTable
          onEdit={handleEdit}
          refreshTrigger={refreshKey}
        />
      </Box>
    </Box>
  );
}
