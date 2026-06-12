export function validateInput(validationType) {
  return (req, res, next) => {
    const errors = [];

    switch (validationType) {
      case 'createGACost':
        if (!req.body.year) errors.push({ field: 'year', message: 'Year is required' });
        if (!req.body.category) errors.push({ field: 'category', message: 'Category is required' });
        if (!req.body.costType) errors.push({ field: 'costType', message: 'Cost Type is required' });
        if (!req.body.serviceSoftware) errors.push({ field: 'serviceSoftware', message: 'Service/Software is required' });
        if (!req.body.vendor) errors.push({ field: 'vendor', message: 'Vendor is required' });
        break;

      case 'updateGACost':
        break;

      default:
        break;
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors
        },
        meta: { timestamp: new Date().toISOString() }
      });
    }

    next();
  };
}
