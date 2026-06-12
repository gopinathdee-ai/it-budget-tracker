import { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Grid, Select, MenuItem, Button, CircularProgress, Typography, Alert } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useApi } from '../../hooks/useApi.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';

const YEARS = [2024, 2025, 2026, 2027];

const SummaryCard = ({ title, value, icon: Icon, color = 'primary' }) => (
  <Card sx={{
    background: color === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                color === 'success' ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' :
                color === 'warning' ? 'linear-gradient(135deg, #eb5757 0%, #ff9f5a 100%)' :
                'linear-gradient(135deg, #9b59b6 0%, #c0392b 100%)',
    color: 'white',
    height: '100%',
  }}>
    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
          {value}
        </Typography>
      </Box>
      {Icon && <Icon sx={{ fontSize: 40, opacity: 0.8 }} />}
    </CardContent>
  </Card>
);

export default function GACostsDashboard({ refreshTrigger }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const { request, loading } = useApi();

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await request('GET', `/api/gacosts?year=${selectedYear}&pageSize=1000`);

      let totalBudget = 0;
      let totalActual = 0;
      const byCategory = {};

      (response.data || []).forEach(item => {
        totalBudget += item.budgetTotal || 0;
        totalActual += item.actualTotal || 0;

        if (!byCategory[item.category]) {
          byCategory[item.category] = { budget: 0, actual: 0 };
        }
        byCategory[item.category].budget += item.budgetTotal || 0;
        byCategory[item.category].actual += item.actualTotal || 0;
      });

      const variance = totalBudget - totalActual;
      const utilization = totalBudget > 0 ? (totalActual / totalBudget * 100) : 0;

      setSummary({
        totalBudget,
        totalActual,
        variance,
        utilization,
        byCategory
      });
    } catch (err) {
      setError('Failed to load G&A costs summary');
    }
  }, [selectedYear, request]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  if (loading && !summary) return <CircularProgress />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}

      {/* Header with controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>G&A Costs Summary</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            size="small"
            sx={{ minWidth: 120 }}
          >
            {YEARS.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
          </Select>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Total Budget"
              value={formatCurrency(summary.totalBudget)}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Total Actual"
              value={formatCurrency(summary.totalActual)}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Variance"
              value={formatCurrency(summary.variance)}
              color={summary.variance >= 0 ? 'success' : 'warning'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Utilization"
              value={formatPercent(summary.utilization)}
              color="primary"
            />
          </Grid>
        </Grid>
      )}

      {/* Category Breakdown */}
      {summary && Object.keys(summary.byCategory).length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>By Category</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Category</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Budget</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Actual</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Variance</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.byCategory).map(([category, data]) => {
                    const variance = data.budget - data.actual;
                    const utilization = data.budget > 0 ? (data.actual / data.budget * 100) : 0;
                    return (
                      <tr key={category} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px', fontWeight: 500 }}>{category}</td>
                        <td style={{ textAlign: 'right', padding: '12px' }}>{formatCurrency(data.budget)}</td>
                        <td style={{ textAlign: 'right', padding: '12px' }}>{formatCurrency(data.actual)}</td>
                        <td style={{ textAlign: 'right', padding: '12px', color: variance >= 0 ? '#10b981' : '#ef4444' }}>
                          {formatCurrency(variance)}
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px' }}>{formatPercent(utilization)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
      )}

      {summary && Object.keys(summary.byCategory).length === 0 && (
        <Alert severity="info">No G&A costs data for {selectedYear}</Alert>
      )}
    </Box>
  );
}
