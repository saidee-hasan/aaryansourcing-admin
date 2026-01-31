import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip, 
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { CloudUpload, Save, ArrowBack } from '@mui/icons-material';

const AddProductForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    productCode: '',
    gsmCode: '',
    
    // Category & Classification
    category: '',
    subCategory: '',
    
    // Multi-select fields
    sizes: [],
    colors: [],
    gender: [],
    
    // Single select fields
    fit: '',
    sustainability: '',
    brand: '',
    
    // Pricing
    price: '',
    discountPrice: '',
    
    // Product Status
    productStatus: 'draft',
    
    // Descriptions
    shortDescription: '',
    richDescription: '',
    
    // SEO
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    
    // Social Media
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    youtubeUrl: ''
  });

  // Dropdown data state
  const [dropdownData, setDropdownData] = useState({
    categories: [],
    subCategories: [],
    sizes: [],
    colors: [],
    fits: [],
    sustainability: [],
    brands: []
  });

  const genderOptions = [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'unisex', label: 'Unisex' },
    { value: 'boys', label: 'Boys' },
    { value: 'girls', label: 'Girls' },
    { value: 'kids', label: 'Kids' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out-of-stock', label: 'Out of Stock' }
  ];

  // Fetch dropdown data
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      fetchSubCategories(formData.category);
    } else {
      setDropdownData(prev => ({ ...prev, subCategories: [] }));
      setFormData(prev => ({ ...prev, subCategory: '' }));
    }
  }, [formData.category]);

  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      
      const endpoints = [
        { key: 'categories', url: '/api/v1/categories' },
        { key: 'sizes', url: '/api/v1/sizes/active' },
        { key: 'colors', url: '/api/v1/colors/data?limit=100' },
        { key: 'fits', url: '/api/v1/product-fits/active' },
        { key: 'sustainability', url: '/api/v1/sustainability' },
        { key: 'brands', url: '/api/v1/brands/active' }
      ];

      const promises = endpoints.map(async ({ key, url }) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${key}`);
        const data = await response.json();
        return { key, data: data.data || data };
      });

      const results = await Promise.all(promises);
      
      const newData = {};
      results.forEach(({ key, data }) => {
        newData[key] = data;
      });

      setDropdownData(prev => ({ ...prev, ...newData }));
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setError('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await fetch(`/api/v1/sub-categories/category/${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch sub-categories');
      const data = await response.json();
      setDropdownData(prev => ({ ...prev, subCategories: data.data || data }));
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      setError('Failed to load sub-categories');
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelectChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare form data for submission
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          formData[key].forEach(item => {
            submitData.append(key, item);
          });
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // TODO: Append image files when implemented

      const response = await fetch('/api/v1/products', {
        method: 'POST',
        body: submitData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      const result = await response.json();
      setSuccess('Product created successfully!');
      
      // Reset form after successful submission
      setFormData({
        title: '',
        productCode: '',
        gsmCode: '',
        category: '',
        subCategory: '',
        sizes: [],
        colors: [],
        gender: [],
        fit: '',
        sustainability: '',
        brand: '',
        price: '',
        discountPrice: '',
        productStatus: 'draft',
        shortDescription: '',
        richDescription: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: [],
        facebookUrl: '',
        twitterUrl: '',
        instagramUrl: '',
        linkedinUrl: '',
        youtubeUrl: ''
      });
      setActiveStep(0);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Basic Information', 'Classification & Pricing', 'Media & SEO', 'Review & Submit'];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Title *"
                value={formData.title}
                onChange={handleInputChange('title')}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Code *"
                value={formData.productCode}
                onChange={handleInputChange('productCode')}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="GSM Code"
                value={formData.gsmCode}
                onChange={handleInputChange('gsmCode')}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleInputChange('category')}
                  label="Category *"
                >
                  {dropdownData.categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.value || category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Sub Category *</InputLabel>
                <Select
                  value={formData.subCategory}
                  onChange={handleInputChange('subCategory')}
                  label="Sub Category *"
                  disabled={!formData.category}
                >
                  {dropdownData.subCategories.map((subCategory) => (
                    <MenuItem key={subCategory._id} value={subCategory._id}>
                      {subCategory.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {!formData.category ? 'Select a category first' : ''}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Classification & Pricing
              </Typography>
            </Grid>
            
            {/* Sizes */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Sizes</InputLabel>
                <Select
                  multiple
                  value={formData.sizes}
                  onChange={handleMultiSelectChange('sizes')}
                  input={<OutlinedInput label="Select Sizes" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const size = dropdownData.sizes.find(s => s._id === value);
                        return <Chip key={value} label={size?.value || value} />;
                      })}
                    </Box>
                  )}
                >
                  {dropdownData.sizes.map((size) => (
                    <MenuItem key={size._id} value={size._id}>
                      <Checkbox checked={formData.sizes.indexOf(size._id) > -1} />
                      <ListItemText primary={size.value} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Colors */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Colors</InputLabel>
                <Select
                  multiple
                  value={formData.colors}
                  onChange={handleMultiSelectChange('colors')}
                  input={<OutlinedInput label="Select Colors" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const color = dropdownData.colors.find(c => c._id === value);
                        return (
                          <Chip 
                            key={value} 
                            label={color?.name || value}
                            style={{ 
                              backgroundColor: color?.hex || '#ccc',
                              color: color?.hex ? '#fff' : '#000'
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {dropdownData.colors.map((color) => (
                    <MenuItem key={color._id} value={color._id}>
                      <Checkbox checked={formData.colors.indexOf(color._id) > -1} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: color.hex || '#ccc',
                            border: '1px solid #ccc',
                            borderRadius: 1
                          }}
                        />
                        <ListItemText 
                          primary={color.name} 
                          secondary={color.hex} 
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Gender */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Gender</InputLabel>
                <Select
                  multiple
                  value={formData.gender}
                  onChange={handleMultiSelectChange('gender')}
                  input={<OutlinedInput label="Select Gender" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Checkbox checked={formData.gender.indexOf(option.value) > -1} />
                      <ListItemText primary={option.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Fit */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Fit</InputLabel>
                <Select
                  value={formData.fit}
                  onChange={handleInputChange('fit')}
                  label="Select Fit"
                >
                  {dropdownData.fits.map((fit) => (
                    <MenuItem key={fit._id} value={fit._id}>
                      {fit.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sustainability */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Sustainability</InputLabel>
                <Select
                  value={formData.sustainability}
                  onChange={handleInputChange('sustainability')}
                  label="Select Sustainability"
                >
                  {dropdownData.sustainability.map((item) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.name} - {item.impactLevel}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Brand */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Brand</InputLabel>
                <Select
                  value={formData.brand}
                  onChange={handleInputChange('brand')}
                  label="Select Brand"
                >
                  {dropdownData.brands.map((brand) => (
                    <MenuItem key={brand._id} value={brand._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {brand.logo && (
                          <img 
                            src={brand.logo} 
                            alt={brand.name}
                            style={{ width: 30, height: 30, objectFit: 'contain' }}
                          />
                        )}
                        <span>{brand.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Pricing */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price *"
                type="number"
                value={formData.price}
                onChange={handleInputChange('price')}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Discount Price"
                type="number"
                value={formData.discountPrice}
                onChange={handleInputChange('discountPrice')}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Product Status</InputLabel>
                <Select
                  value={formData.productStatus}
                  onChange={handleInputChange('productStatus')}
                  label="Product Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Descriptions & SEO
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Description"
                multiline
                rows={3}
                value={formData.shortDescription}
                onChange={handleInputChange('shortDescription')}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rich Description"
                multiline
                rows={6}
                value={formData.richDescription}
                onChange={handleInputChange('richDescription')}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Meta Title"
                value={formData.metaTitle}
                onChange={handleInputChange('metaTitle')}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Meta Description"
                multiline
                rows={2}
                value={formData.metaDescription}
                onChange={handleInputChange('metaDescription')}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Keywords (comma separated)"
                value={formData.metaKeywords.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  metaKeywords: e.target.value.split(',').map(k => k.trim())
                }))}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review & Submit
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Please review all information before submitting the product.
              </Alert>
            </Grid>
            
            {/* Summary of all entered data */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Product Summary</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Title:</Typography>
                      <Typography variant="body1">{formData.title}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Product Code:</Typography>
                      <Typography variant="body1">{formData.productCode}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Category:</Typography>
                      <Typography variant="body1">
                        {dropdownData.categories.find(c => c._id === formData.category)?.value || 'Not selected'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Sub Category:</Typography>
                      <Typography variant="body1">
                        {dropdownData.subCategories.find(s => s._id === formData.subCategory)?.name || 'Not selected'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Sizes:</Typography>
                      <Typography variant="body1">
                        {formData.sizes.map(sizeId => 
                          dropdownData.sizes.find(s => s._id === sizeId)?.value
                        ).join(', ') || 'None selected'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Colors:</Typography>
                      <Typography variant="body1">
                        {formData.colors.map(colorId => 
                          dropdownData.colors.find(c => c._id === colorId)?.name
                        ).join(', ') || 'None selected'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Price:</Typography>
                      <Typography variant="body1">${formData.price}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Status:</Typography>
                      <Typography variant="body1">
                        {statusOptions.find(s => s.value === formData.productStatus)?.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  if (loading && dropdownData.categories.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBack />} sx={{ mb: 2 }}>
          Back to Products
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Product
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Create a new product with advanced specifications and categorization
        </Typography>
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

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>

              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  >
                    {loading ? 'Creating Product...' : 'Create Product'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AddProductForm;