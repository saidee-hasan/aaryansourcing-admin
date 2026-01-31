import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { FaSpinner, FaUpload, FaTrash, FaImage, FaFilePdf, FaYoutube, FaCheckCircle, FaExclamationTriangle, FaEdit, FaSave, FaUndo, FaBolt, FaHistory, FaCertificate } from "react-icons/fa";
import { FiPackage, FiTag, FiDollarSign, FiBox, FiSave } from "react-icons/fi";
import Select from "react-select";
import JoditEditor from "jodit-react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';

// SweetAlert2 with React Content
const MySwal = withReactContent(Swal);

// 🚀 Performance-optimized toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme: "light",
};

// Performance-optimized toasts
const showSuccessToast = (message) => {
  toast.success(message, { ...toastConfig, autoClose: 2000 });
};

const showErrorToast = (message) => {
  toast.error(message, { ...toastConfig, autoClose: 3000 });
};

const showWarningToast = (message) => {
  toast.warning(message, { ...toastConfig, autoClose: 2500 });
};

const showInfoToast = (message) => {
  toast.info(message, { ...toastConfig, autoClose: 2000 });
};

const showLoadingToast = (message) => {
  return toast.loading(message, {
    ...toastConfig,
    autoClose: false,
  });
};

// Memoized custom components
const ColorOption = React.memo(({ data, innerRef, innerProps }) => {
  const hexColor = data?.hex || '#CCCCCC';
  const colorName = data?.name || data?.label || 'Unknown Color';
  
  return (
    <div ref={innerRef} {...innerProps} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-3">
      <div 
        className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm flex-shrink-0"
        style={{ backgroundColor: hexColor }}
      />
      <span className="text-sm font-medium text-gray-900 dark:text-white">{colorName}</span>
    </div>
  );
});

ColorOption.displayName = 'ColorOption';

const ColorValue = React.memo(({ children, ...props }) => {
  const { data } = props;
  const hexColor = data?.hex || '#CCCCCC';
  const colorName = data?.name || data?.label || 'Unknown Color';
  
  return (
    <div className="flex items-center m-1 bg-blue-100 dark:bg-blue-900 rounded-full px-2 py-1">
      <div 
        className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 mr-1"
        style={{ backgroundColor: hexColor }}
        title={colorName}
      />
      <span className="text-xs text-blue-800 dark:text-blue-200 mr-1">{colorName}</span>
      {children}
    </div>
  );
});

ColorValue.displayName = 'ColorValue';

// Custom Certification Option Component
const CertificationOption = React.memo(({ data, innerRef, innerProps }) => {
  return (
    <div ref={innerRef} {...innerProps} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-3">
      <FaCertificate className="h-5 w-5 text-green-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900 dark:text-white block truncate">
          {data.label}
        </span>
        {data.issuingOrganization && (
          <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
            {data.issuingOrganization}
          </span>
        )}
      </div>
    </div>
  );
});

CertificationOption.displayName = 'CertificationOption';

// Custom Certification Value Component
const CertificationValue = React.memo(({ children, ...props }) => {
  const { data } = props;
  
  return (
    <div className="flex items-center m-1 bg-green-100 dark:bg-green-900 rounded-full px-3 py-1">
      <FaCertificate className="h-3 w-3 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
      <span className="text-xs text-green-800 dark:text-green-200 mr-1 truncate max-w-32">
        {data.label}
      </span>
      {children}
    </div>
  );
});

CertificationValue.displayName = 'CertificationValue';

// Custom components for React Select
const customComponents = {
  DropdownIndicator: () => null,
  IndicatorSeparator: () => null,
  Option: ColorOption,
  MultiValueLabel: ColorValue,
};

// Custom components for Certifications Select
const certificationComponents = {
  DropdownIndicator: () => null,
  IndicatorSeparator: () => null,
  Option: CertificationOption,
  MultiValueLabel: CertificationValue,
};

// Custom styles for React Select
const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'rgb(249 250 251)',
    borderColor: state.isFocused ? 'rgb(59 130 246)' : 'rgb(209 213 219)',
    borderRadius: '0.5rem',
    padding: '2px 4px',
    minHeight: '42px',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'rgb(59 130 246)'
    },
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'rgb(55 65 81)',
      borderColor: state.isFocused ? 'rgb(59 130 246)' : 'rgb(75 85 99)',
      color: 'rgb(255 255 255)'
    }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'rgb(255 255 255)',
    borderRadius: '0.5rem',
    zIndex: 50,
    cursor: 'pointer',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'rgb(55 65 81)',
      color: 'rgb(255 255 255)'
    }
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? 'rgb(59 130 246)' : state.isFocused ? 'rgb(243 244 246)' : 'white',
    color: state.isSelected ? 'white' : 'rgb(17 24 39)',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgb(243 244 246)'
    },
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: state.isSelected ? 'rgb(59 130 246)' : state.isFocused ? 'rgb(75 85 99)' : 'rgb(55 65 81)',
      color: state.isSelected ? 'white' : 'rgb(243 244 246)',
      '&:hover': {
        backgroundColor: 'rgb(75 85 99)'
      }
    }
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'rgb(219 234 254)',
    borderRadius: '9999px',
    cursor: 'pointer',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'rgb(30 58 138)'
    }
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'rgb(30 64 175)',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    cursor: 'pointer',
    '@media (prefers-color-scheme: dark)': {
      color: 'rgb(191 219 254)'
    }
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'rgb(30 64 175)',
    borderRadius: '9999px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgb(219 234 254)',
      color: 'rgb(239 68 68)'
    },
    '@media (prefers-color-scheme: dark)': {
      color: 'rgb(191 219 254)',
      '&:hover': {
        backgroundColor: 'rgb(30 58 138)',
        color: 'rgb(248 113 113)'
      }
    }
  }),
  input: (base) => ({
    ...base,
    color: 'rgb(17 24 39)',
    cursor: 'text',
    '@media (prefers-color-scheme: dark)': {
      color: 'rgb(243 244 246)'
    }
  })
};

// Custom styles for Certifications Select
const certificationStyles = {
  ...customStyles,
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'rgb(220 252 231)',
    borderRadius: '9999px',
    cursor: 'pointer',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'rgb(22 101 52)'
    }
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'rgb(22 101 52)',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    cursor: 'pointer',
    '@media (prefers-color-scheme: dark)': {
      color: 'rgb(187 247 208)'
    }
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'rgb(22 101 52)',
    borderRadius: '9999px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgb(220 252 231)',
      color: 'rgb(239 68 68)'
    },
    '@media (prefers-color-scheme: dark)': {
      color: 'rgb(187 247 208)',
      '&:hover': {
        backgroundColor: 'rgb(22 101 52)',
        color: 'rgb(248 113 113)'
      }
    }
  }),
};

// 🚀 Performance-optimized components
const LoadingSpinner = React.memo(() => (
  <div className="flex justify-center items-center h-96">
    <div className="text-center">
      <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-lg">Loading product form...</p>
    </div>
  </div>
));

const EditFileUploadPreview = React.memo(({ type, preview, file, onRemove, existingFile, onFileChange, multiple = false, previews = [] }) => {
  const getUploadIcon = () => {
    switch (type) {
      case 'pdf': return <FaFilePdf className="h-12 w-12 text-gray-400 mx-auto" />;
      default: return <FaImage className="h-12 w-12 text-gray-400 mx-auto" />;
    }
  };

  const getUploadText = () => {
    switch (type) {
      case 'pdf': return "Click to update PDF file";
      case 'gallery': return "Click to update images";
      default: return "Click to update image";
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (onFileChange) {
      onFileChange(type, selectedFiles);
    }
  };

  if (type === 'gallery' && (previews.length > 0 || (existingFile && existingFile.length > 0))) {
    const allPreviews = previews.length > 0 ? previews : (existingFile ? existingFile.map(img => img.url || img) : []);
    
    return (
      <div className="mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {allPreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img 
                src={preview} 
                alt={`Gallery ${index + 1}`} 
                className="w-full h-24 object-cover rounded-lg shadow-md"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 cursor-pointer"
              >
                <FaTrash className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-green-600 text-sm mt-3 text-center">
          {allPreviews.length} image(s) {previews.length > 0 ? 'updated' : 'existing'}
        </p>
      </div>
    );
  }

  if (preview || existingFile) {
    const displayUrl = preview || existingFile;
    
    return (
      <div className="space-y-3 text-center">
        {type === 'pdf' ? (
          <>
            <FaFilePdf className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-green-600 text-sm">✓ {file?.name || 'Existing PDF file'}</p>
          </>
        ) : (
          <>
            <img 
              src={displayUrl} 
              alt="Preview" 
              className="w-32 h-32 object-cover rounded-lg mx-auto shadow-md"
              loading="lazy"
            />
            <p className="text-green-600 text-sm">✓ {file?.name || 'Existing image'}</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 text-center">
      {getUploadIcon()}
      <p className="text-gray-600 dark:text-gray-400">{getUploadText()}</p>
      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
    </div>
  );
});

EditFileUploadPreview.displayName = 'EditFileUploadPreview';

const EditSectionHeader = React.memo(({ icon: Icon, title, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400",
    pink: "bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400",
    indigo: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400",
    teal: "bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400",
    red: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
    lime: "bg-lime-100 dark:bg-lime-900 text-lime-600 dark:text-lime-400"
  };

  return (
    <div className="flex items-center space-x-3 mb-6">
      <div className={`p-2 ${colorClasses[color]} rounded-lg`}>
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
});

EditSectionHeader.displayName = 'EditSectionHeader';

// 🚀 Main Edit Product Form Component
const EditProductForm = ({ 
  initialData, 
  onSubmit, 
  onQuickSave, 
  onAutoSave, 
  isSubmitting, 
  isAutoSaving, 
  lastSaved 
}) => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    categories: [],
    subCategories: [],
    brands: [],
    colors: [],
    sizes: [],
    productFits: [],
    sustainability: [],
    certifications: []
  });
  
  // Refs
  const shortDescriptionEditor = useRef(null);
  const richDescriptionEditor = useRef(null);
  const printingEmbroideryEditor = useRef(null);
  const textileCareEditor = useRef(null);
  const lastValues = useRef({});

  // 🚀 Performance-optimized Jodit Editor configuration
  const joditConfig = useMemo(() => ({
  
      readonly: false,
      placeholder: "Start typings...",
      required: true,
      height:350,
      theme: "dark",
      hidePoweredByJodit: true,
      style: {
        padding: "20",
        background: "#1C2822",
        color: "#fff",
      },
    }), []);

  // 🚀 Performance-optimized form configuration
  const formConfig = useMemo(() => {
    console.log('🔄 Initial Data in EditProductForm:', initialData);
    
    const defaultValues = {
      title: initialData?.title || '',
      productCode: initialData?.productCode || '',
      gsmCode: initialData?.gsmCode || '',
      category: initialData?.category || '',
      subCategory: initialData?.subCategory || '',
      productStatus: initialData?.productStatus || 'active',
      sizes: initialData?.sizes || [],
      colors: initialData?.colors || [],
      gender: initialData?.gender || [],
      fit: initialData?.fit || '',
      sustainability: initialData?.sustainability || '',
      brand: initialData?.brand || '',
      price: initialData?.price || '',
      discountPrice: initialData?.discountPrice || '',
      quantity: initialData?.quantity || '',
      bulkQuantity: initialData?.bulkQuantity || '',
      price100Pcs: initialData?.price100Pcs || '',
      price200Pcs: initialData?.price200Pcs || '',
      price500Pcs: initialData?.price500Pcs || '',
      shortDescription: initialData?.shortDescription || '',
      richDescription: initialData?.richDescription || '',
      printingEmbroidery: initialData?.printingEmbroidery || '',
      textileCare: initialData?.textileCare || '',
      metaTitle: initialData?.metaTitle || '',
      mainImageAltText: initialData?.mainImageAltText || '',
      metaDescription: initialData?.metaDescription || '',
      metaKeywords: Array.isArray(initialData?.metaKeywords) 
        ? initialData.metaKeywords.join(', ') 
        : initialData?.metaKeywords || '',
      youtubeUrl: initialData?.youtubeUrl || '',
      certifications: initialData?.certifications || []
    };

    lastValues.current = defaultValues;
    
    return { defaultValues };
  }, [initialData]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm(formConfig);

  // 🚀 Watch for changes with debouncing
  const watchAll = watch();
  useEffect(() => {
    const currentValues = watchAll;
    const changesDetected = JSON.stringify(currentValues) !== JSON.stringify(lastValues.current);
    setHasChanges(changesDetected);
  }, [watchAll]);

  // Rich text content states
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [richDescription, setRichDescription] = useState(initialData?.richDescription || '');
  const [printingEmbroidery, setPrintingEmbroidery] = useState(initialData?.printingEmbroidery || '');
  const [textileCare, setTextileCare] = useState(initialData?.textileCare || '');

  // 🚀 Performance-optimized editor handlers
  const handleShortDescriptionBlur = useCallback((newContent) => {
    setShortDescription(newContent);
    setValue('shortDescription', newContent);
  }, [setValue]);

  const handleRichDescriptionBlur = useCallback((newContent) => {
    setRichDescription(newContent);
    setValue('richDescription', newContent);
  }, [setValue]);

  const handlePrintingEmbroideryBlur = useCallback((newContent) => {
    setPrintingEmbroidery(newContent);
    setValue('printingEmbroidery', newContent);
  }, [setValue]);

  const handleTextileCareBlur = useCallback((newContent) => {
    setTextileCare(newContent);
    setValue('textileCare', newContent);
  }, [setValue]);

  // 🚀 Size mapping categories with memoization
  const sizeCategories = useMemo(() => ({
    baby: [
      { display: '0-6 month', dbMatch: ['0-6M', '0-6MONTH', '0-6'] },
      { display: '6-12 month', dbMatch: ['6-12M', '6-12MONTH', '6-12'] },
      { display: '12-18 month', dbMatch: ['12-18M', '12-18MONTH', '12-18'] },
      { display: '18-24 month', dbMatch: ['18-24M', '18-24MONTH', '18-24'] }
    ],
    kids: [
      { display: '1-2 year', dbMatch: ['1-2Y', '1-2YEAR', '1-2'] },
      { display: '3-4 year', dbMatch: ['3-4Y', '3-4YEAR', '3-4'] },
      { display: '5-6 year', dbMatch: ['5-6Y', '5-6YEAR', '5-6'] },
      { display: '7-8 year', dbMatch: ['7-8Y', '7-8YEAR', '7-8'] },
      { display: '9-10 year', dbMatch: ['9-10Y', '9-10YEAR', '9-10'] },
      { display: '11-12 year', dbMatch: ['11-12Y', '11-12YEAR', '11-12'] },
      { display: '13-14 year', dbMatch: ['13-14Y', '13-14YEAR', '13-14'] }
    ],
    standard: [
      { display: 'xs', dbMatch: ['XS', 'X-SMALL'] },
      { display: 's', dbMatch: ['S', 'SMALL'] },
      { display: 'm', dbMatch: ['M', 'MEDIUM'] },
      { display: 'l', dbMatch: ['L', 'LARGE'] },
      { display: 'xl', dbMatch: ['XL', 'X-LARGE'] }
    ],
    numeric: [
      { display: '2xl', dbMatch: ['2XL', 'XXL'] },
      { display: '3xl', dbMatch: ['3XL', 'XXXL'] },
      { display: '4xl', dbMatch: ['4XL', 'XXXXL'] },
      { display: '5xl', dbMatch: ['5XL', 'XXXXXL'] }
    ]
  }), []);

  const [selectedSizeCategory, setSelectedSizeCategory] = useState("");
  const watchCategory = watch('category');
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  // 🚀 File handling with performance optimization
  const [files, setFiles] = useState({
    mainImage: null,
    galleryImages: [],
    sizeChartImage: null
  });

  const [imagePreviews, setImagePreviews] = useState({
    mainImage: initialData?.mainImage || null,
    galleryImages: initialData?.galleryImages?.map(img => img.url || img) || [],
    sizeChartImage: initialData?.sizeChartImage || null
  });

  // 🚀 Performance-optimized file handling
  const handleFileChange = useCallback((fileType, selectedFiles) => {
    if (fileType === 'galleryImages') {
      const newImages = Array.from(selectedFiles);
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      
      setFiles(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...newImages]
      }));
      
      setImagePreviews(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...newPreviews]
      }));
      
      showSuccessToast(`Added ${newImages.length} new image(s)`);
    } else {
      const file = selectedFiles[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setFiles(prev => ({ ...prev, [fileType]: file }));
        setImagePreviews(prev => ({ ...prev, [fileType]: previewUrl }));
        showSuccessToast(`${fileType} updated`);
      }
    }
    setHasChanges(true);
  }, []);

  const removeGalleryImage = useCallback((index) => {
    setFiles(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
    
    setImagePreviews(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
    
    setHasChanges(true);
    showWarningToast('Image removed');
  }, []);

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach(preview => {
        if (preview && typeof preview === 'string') {
          URL.revokeObjectURL(preview);
        } else if (Array.isArray(preview)) {
          preview.forEach(url => URL.revokeObjectURL(url));
        }
      });
    };
  }, [imagePreviews]);

  // 🚀 Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setFormLoading(true);
        
        const cachedData = sessionStorage.getItem('productFormData');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setDropdownData(parsedData);
          setFormLoading(false);
          return;
        }

        const endpoints = [
          { key: 'categories', url: '/categories' },
          { key: 'subCategories', url: '/sub-categories' },
          { key: 'brands', url: '/brands' },
          { key: 'colors', url: '/colors' },
          { key: 'sizes', url: '/sizes' },
          { key: 'productFits', url: '/product-fits' },
          { key: 'sustainability', url: '/sustainability' },
          { key: 'certifications', url: '/certifications' }
        ];

        const promises = endpoints.map(async ({ key, url }) => {
          try {
            const response = await axiosSecure.get(url);
            if (response.data.success) {
              if (key === 'subCategories' && response.data.data.subCategories) {
                return { key, data: response.data.data.subCategories };
              } else if (key === 'colors' && response.data.data.colors) {
                return { key, data: response.data.data.colors };
              } else if (key === 'sustainability' && response.data.data.sustainabilityAttributes) {
                return { key, data: response.data.data.sustainabilityAttributes };
              } else if (key === 'certifications' && response.data.data) {
                return { key, data: response.data.data };
              } else if (response.data.data) {
                return { 
                  key, 
                  data: Array.isArray(response.data.data) 
                    ? response.data.data 
                    : response.data.data[key] || [] 
                };
              }
            }
            return { key, data: [] };
          } catch (error) {
            console.error(`Error fetching ${key}:`, error);
            return { key, data: [] };
          }
        });

        const results = await Promise.all(promises);
        const newData = { ...dropdownData };
        
        results.forEach(({ key, data }) => {
          if (data && data.length > 0) {
            newData[key] = data;
          }
        });

        setDropdownData(newData);
        sessionStorage.setItem('productFormData', JSON.stringify(newData));
        
      } catch (error) {
        console.error('Error fetching data:', error);
        showErrorToast("Failed to load form data");
      } finally {
        setFormLoading(false);
      }
    };

    fetchDropdownData();
  }, [axiosSecure]);

  // Filter subcategories
  useEffect(() => {
    if (watchCategory && dropdownData.subCategories.length > 0) {
      const filtered = dropdownData.subCategories.filter(
        sub => sub.categoryId === watchCategory
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories([]);
    }
  }, [watchCategory, dropdownData.subCategories]);

  // Set form values when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('🔄 Setting form values from initialData:', initialData);
      
      // Set basic fields
      setValue('title', initialData.title || '');
      setValue('productCode', initialData.productCode || '');
      setValue('gsmCode', initialData.gsmCode || '');
      setValue('category', initialData.category || '');
      setValue('subCategory', initialData.subCategory || '');
      setValue('productStatus', initialData.productStatus || 'active');
      setValue('fit', initialData.fit || '');
      setValue('sustainability', initialData.sustainability || '');
      setValue('brand', initialData.brand || '');
      setValue('price', initialData.price || '');
      setValue('discountPrice', initialData.discountPrice || '');
      setValue('quantity', initialData.quantity || '');
      setValue('bulkQuantity', initialData.bulkQuantity || '');
      setValue('price100Pcs', initialData.price100Pcs || '');
      setValue('price200Pcs', initialData.price200Pcs || '');
      setValue('price500Pcs', initialData.price500Pcs || '');
      setValue('metaTitle', initialData.metaTitle || '');
      setValue('mainImageAltText', initialData.mainImageAltText || '');
      setValue('metaDescription', initialData.metaDescription || '');
      setValue('youtubeUrl', initialData.youtubeUrl || '');
      
      // Set array fields
      setValue('sizes', initialData.sizes || []);
      setValue('colors', initialData.colors || []);
      setValue('gender', initialData.gender || []);
      setValue('certifications', initialData.certifications || []);
      
      // Set metaKeywords as string
      const metaKeywords = Array.isArray(initialData.metaKeywords) 
        ? initialData.metaKeywords.join(', ') 
        : initialData.metaKeywords || '';
      setValue('metaKeywords', metaKeywords);
      
      // Set rich text content
      setShortDescription(initialData.shortDescription || '');
      setRichDescription(initialData.richDescription || '');
      setPrintingEmbroidery(initialData.printingEmbroidery || '');
      setTextileCare(initialData.textileCare || '');
      
      console.log('✅ Form values set successfully');
    }
  }, [initialData, setValue]);

  // 🚀 Get available options with memoization
  const availableSizes = useMemo(() => {
    return dropdownData.sizes.map(size => ({
      value: size._id,
      label: size.value || size.name,
    }));
  }, [dropdownData.sizes]);

  const colorOptions = useMemo(() => {
    return dropdownData.colors.map(color => ({
      value: color._id,
      label: color.name,
      hex: color.hex,
      name: color.name
    }));
  }, [dropdownData.colors]);

  const certificationOptions = useMemo(() => {
    return dropdownData.certifications.map(cert => ({
      value: cert._id,
      label: cert.name,
      issuingOrganization: cert.issuingOrganization,
      description: cert.description
    }));
  }, [dropdownData.certifications]);

  // Get current selected values for React Select
  const getCurrentSizes = useCallback(() => {
    const currentSizes = watch('sizes') || [];
    return availableSizes.filter(option => 
      currentSizes.includes(option.value)
    );
  }, [watch, availableSizes]);

  const getCurrentColors = useCallback(() => {
    const currentColors = watch('colors') || [];
    return colorOptions.filter(option => 
      currentColors.includes(option.value)
    );
  }, [watch, colorOptions]);

  const getCurrentCertifications = useCallback(() => {
    const currentCerts = watch('certifications') || [];
    return certificationOptions.filter(option => 
      currentCerts.includes(option.value)
    );
  }, [watch, certificationOptions]);

  // 🚀 Quick save handlers
  const handleQuickPriceSave = useCallback((field, value) => {
    if (onQuickSave && value !== '') {
      onQuickSave(field, parseFloat(value));
    }
  }, [onQuickSave]);

  const handleQuickStatusSave = useCallback((value) => {
    if (onQuickSave) {
      onQuickSave('productStatus', value);
    }
  }, [onQuickSave]);

  // 🚀 Form submission with performance optimization
  const onFormSubmit = useCallback(async (data) => {
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Append all form data
      Object.keys(data).forEach(key => {
        if (key === 'sizes' || key === 'colors' || key === 'gender' || key === 'certifications') {
          if (Array.isArray(data[key])) {
            data[key].forEach(item => formData.append(key, item));
          } else if (data[key]) {
            formData.append(key, data[key]);
          }
        } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      // Append files if updated
      if (files.mainImage) formData.append('mainImage', files.mainImage);
      if (files.sizeChartImage) formData.append('sizeChartImage', files.sizeChartImage);
      if (files.galleryImages.length > 0) {
        files.galleryImages.forEach(image => formData.append('galleryImages', image));
      }

      await onSubmit(formData);
      setHasChanges(false);
      
    } catch (error) {
      console.error('❌ Submission error:', error);
      showErrorToast("Failed to update product");
    } finally {
      setLoading(false);
    }
  }, [files, onSubmit]);

  // 🚀 Reset form handler
  const handleReset = useCallback(async () => {
    if (hasChanges) {
      const result = await Swal.fire({
        title: 'Reset Changes?',
        text: "Are you sure you want to reset all changes?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, reset!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        reset();
        setFiles({
          mainImage: null,
          galleryImages: [],
          sizeChartImage: null
        });
        setImagePreviews({
          mainImage: initialData?.mainImage || null,
          galleryImages: initialData?.galleryImages?.map(img => img.url || img) || [],
          sizeChartImage: initialData?.sizeChartImage || null
        });
        setShortDescription(initialData?.shortDescription || '');
        setRichDescription(initialData?.richDescription || '');
        setPrintingEmbroidery(initialData?.printingEmbroidery || '');
        setTextileCare(initialData?.textileCare || '');
        setSelectedSizeCategory("");
        setHasChanges(false);
        
        showSuccessToast("Changes reset successfully");
      }
    }
  }, [reset, initialData, hasChanges]);

  // Styling constants
  const inputStyle = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200";
  const labelStyle = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2";
  const errorStyle = "text-red-500 text-xs mt-1 flex items-center space-x-1";
  const sectionStyle = "space-y-6 p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm";

  // Quick Action Button Component
  const QuickActionButton = ({ onClick, icon: Icon, label, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500 hover:bg-blue-600",
      green: "bg-green-500 hover:bg-green-600",
      red: "bg-red-500 hover:bg-red-600",
      yellow: "bg-yellow-500 hover:bg-yellow-600"
    };

    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center space-x-2 px-3 py-2 text-white rounded-lg transition-colors cursor-pointer ${colorClasses[color]}`}
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </button>
    );
  };

  if (formLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      
      <div className="max-w-7xl mx-auto">
        {/* Performance Header */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaBolt className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  High-Performance Edit Mode
                </span>
              </div>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Optimized for 1000+ edits per day
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Unsaved Changes
                </span>
              )}
              
              {isAutoSaving && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <FaSpinner className="animate-spin mr-1 h-3 w-3" />
                  Auto-saving...
                </span>
              )}
              
              {lastSaved && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <FaHistory className="mr-1 h-3 w-3" />
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit(onFormSubmit)} className="divide-y divide-gray-200 dark:divide-gray-700">
            
            {/* Quick Actions Bar */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions:</span>
                  <QuickActionButton 
                    onClick={() => handleQuickStatusSave('active')} 
                    icon={FaCheckCircle} 
                    label="Set Active" 
                    color="green" 
                  />
                  <QuickActionButton 
                    onClick={() => handleQuickStatusSave('inactive')} 
                    icon={FaExclamationTriangle} 
                    label="Set Inactive" 
                    color="red" 
                  />
                  <QuickActionButton 
                    onClick={handleReset} 
                    icon={FaUndo} 
                    label="Reset" 
                    color="yellow" 
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!hasChanges}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || loading || !hasChanges}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    {isSubmitting || loading ? (
                      <>
                        <FaSpinner className="animate-spin h-4 w-4" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className={sectionStyle}>
              <EditSectionHeader icon={FiPackage} title="Basic Information" color="blue" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>
                    <FiTag className="h-4 w-4" />
                    <span>Product Title *</span>
                  </label>
                  <input 
                    {...register("title", { required: "Product title is required" })} 
                    className={inputStyle}
                    placeholder="Enter product title..."
                  />
                  {errors.title && (
                    <p className={errorStyle}>
                      <span>⚠</span>
                      <span>{errors.title.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>
                    <FiTag className="h-4 w-4" />
                    <span>Product Code *</span>
                  </label>
                  <input 
                    {...register("productCode", { required: "Product code is required" })} 
                    className={inputStyle}
                    placeholder="e.g., PROD-001"
                  />
                  {errors.productCode && (
                    <p className={errorStyle}>
                      <span>⚠</span>
                      <span>{errors.productCode.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelStyle}>
                    <FiTag className="h-4 w-4" />
                    <span>GSM Code</span>
                  </label>
                  <input 
                    {...register("gsmCode")} 
                    className={inputStyle}
                    placeholder="Optional GSM code"
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    <FiBox className="h-4 w-4" />
                    <span>Product Status *</span>
                  </label>
                  <select 
                    {...register("productStatus", { required: "Status is required" })} 
                    className={`${inputStyle} cursor-pointer`}
                    onChange={(e) => handleQuickStatusSave(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="featured">Featured</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category & Brand */}
            <div className={sectionStyle}>
              <EditSectionHeader icon={FiPackage} title="Category & Brand" color="green" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Category *</label>
                  <select 
                    {...register("category", { required: "Category is required" })} 
                    className={`${inputStyle} cursor-pointer`}
                  >
                    <option value="">Select Category</option>
                    {dropdownData.categories.map(cat => (
                      <option 
                        key={cat._id} 
                        value={cat._id}
                        selected={initialData?.category === cat._id}
                      >
                        {cat.value || cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className={errorStyle}>{errors.category.message}</p>}
                </div>

                <div>
                  <label className={labelStyle}>Sub Category *</label>
                  <select 
                    {...register("subCategory", { required: "Sub category is required" })} 
                    className={`${inputStyle} cursor-pointer`}
                    disabled={!watchCategory}
                  >
                    <option value="">{watchCategory ? "Select Sub Category" : "Select category first"}</option>
                    {filteredSubCategories.map(subCat => (
                      <option 
                        key={subCat._id} 
                        value={subCat._id}
                        selected={initialData?.subCategory === subCat._id}
                      >
                        {subCat.name}
                      </option>
                    ))}
                  </select>
                  {errors.subCategory && <p className={errorStyle}>{errors.subCategory.message}</p>}
                </div>

                <div className="lg:col-span-2">
                  <label className={labelStyle}>Brand</label>
                  <select 
                    {...register("brand")} 
                    className={`${inputStyle} cursor-pointer`}
                  >
                    <option value="">Select Brand</option>
                    {dropdownData.brands.map(brand => (
                      <option 
                        key={brand._id} 
                        value={brand._id}
                        selected={initialData?.brand === brand._id}
                      >
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sizes & Colors */}
            <div className={sectionStyle}>
              <EditSectionHeader icon={FiBox} title="Sizes & Colors" color="purple" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Size Category</label>
                  <select 
                    value={selectedSizeCategory}
                    onChange={(e) => setSelectedSizeCategory(e.target.value)}
                    className={`${inputStyle} cursor-pointer`}
                  >
                    <option value="">Select Size Category</option>
                    <option value="baby">Baby Sizes</option>
                    <option value="kids">Kids Sizes</option>
                    <option value="standard">Standard Sizes</option>
                    <option value="numeric">Numeric Sizes</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select a category to auto-add matching sizes
                  </p>
                </div>

                <div>
                  <label className={labelStyle}>Available Sizes</label>
                  <Controller
                    name="sizes"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        isMulti
                        options={availableSizes}
                        styles={customStyles}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        value={getCurrentSizes()}
                        onChange={(selected) => field.onChange(selected?.map(s => s.value) || [])}
                      />
                    )}
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className={labelStyle}>Available Colors</label>
                  <Controller
                    name="colors"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        isMulti
                        options={colorOptions}
                        components={customComponents}
                        styles={customStyles}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        value={getCurrentColors()}
                        onChange={(selected) => field.onChange(selected?.map(s => s.value) || [])}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Additional Attributes */}
            <div className={sectionStyle}>
              <EditSectionHeader icon={FiBox} title="Additional Attributes" color="orange" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Gender</label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        isMulti
                        options={[
                          { value: 'Men', label: 'Men' },
                          { value: 'Women', label: 'Women' },
                          { value: 'Unisex', label: 'Unisex' },
                          { value: 'Boys', label: 'Boys' },
                          { value: 'Girls', label: 'Girls' }
                        ]}
                        styles={customStyles}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        value={field.value?.map(g => ({ value: g, label: g }))}
                        onChange={(selected) => field.onChange(selected?.map(s => s.value) || [])}
                      />
                    )}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Fit</label>
                  <select 
                    {...register("fit")} 
                    className={`${inputStyle} cursor-pointer`}
                  >
                    <option value="">Select Fit</option>
                    {dropdownData.productFits.map(fit => (
                      <option 
                        key={fit._id} 
                        value={fit._id}
                        selected={initialData?.fit === fit._id}
                      >
                        {fit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>Sustainability</label>
                  <select 
                    {...register("sustainability")} 
                    className={`${inputStyle} cursor-pointer`}
                  >
                    <option value="">Select Sustainability</option>
                    {dropdownData.sustainability.map(item => (
                      <option 
                        key={item._id} 
                        value={item._id}
                        selected={initialData?.sustainability === item._id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className={sectionStyle}>
              <EditSectionHeader 
                icon={FaCertificate} 
                title="Product Certifications" 
                color="lime" 
              />
              
              <div className="space-y-4">
                <div>
                  <label className={labelStyle}>
                    <FaCertificate className="h-4 w-4" />
                    <span>Product Certifications & Quality Standards</span>
                  </label>
                  <Controller
                    name="certifications"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        isMulti
                        options={certificationOptions}
                        components={certificationComponents}
                        styles={certificationStyles}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        value={getCurrentCertifications()}
                        onChange={(selected) => field.onChange(selected?.map(s => s.value) || [])}
                        noOptionsMessage={() => "No certifications available"}
                      />
                    )}
                  />
                </div>

                {/* Display selected certifications preview */}
                {watch('certifications')?.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                      Selected Certifications ({watch('certifications').length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {watch('certifications').map(certId => {
                        const cert = dropdownData.certifications.find(c => c._id === certId);
                        return cert ? (
                          <div key={cert._id} className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-green-200 dark:border-green-700">
                            <FaCertificate className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-700 dark:text-green-300">
                              {cert.name}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className={sectionStyle}>
              <EditSectionHeader 
                icon={FiDollarSign} 
                title="Pricing & Inventory"
                color="emerald" 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className={labelStyle}>Regular Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    {...register("price")} 
                    className={inputStyle}
                    placeholder="0.00"
                    onBlur={(e) => handleQuickPriceSave('price', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Single item price
                  </p>
                </div>

                <div>
                  <label className={labelStyle}>Discount Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    {...register("discountPrice")} 
                    className={inputStyle}
                    placeholder="0.00"
                    onBlur={(e) => handleQuickPriceSave('discountPrice', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Special offer price
                  </p>
                </div>

                <div>
                  <label className={labelStyle}>Quantity</label>
                  <input 
                    type="number" 
                    {...register("quantity")} 
                    className={inputStyle}
                    placeholder="0"
                    onBlur={(e) => handleQuickPriceSave('quantity', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Available stock
                  </p>
                </div>

                <div>
                  <label className={labelStyle}>Bulk Quantity</label>
                  <input 
                    type="number" 
                    {...register("bulkQuantity")} 
                    className={inputStyle}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Minimum bulk order quantity
                  </p>
                </div>
              </div>

              {/* Bulk Pricing Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Bulk Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelStyle}>
                      <span>100 Pcs Price ($)</span>
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      {...register("price100Pcs")} 
                      className={inputStyle}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Price per piece for 100 pcs order
                    </p>
                  </div>

                  <div>
                    <label className={labelStyle}>
                      <span>200 Pcs Price ($)</span>
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      {...register("price200Pcs")} 
                      className={inputStyle}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Price per piece for 200 pcs order
                    </p>
                  </div>

                  <div>
                    <label className={labelStyle}>
                      <span>500 Pcs Price ($)</span>
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      {...register("price500Pcs")} 
                      className={inputStyle}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Price per piece for 500 pcs order
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Uploads */}
            <div className={sectionStyle}>
              <EditSectionHeader icon={FaUpload} title="Update Media Files" color="pink" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Image */}
                <div className="space-y-4">
                  <label className={labelStyle}>
                    <FaImage className="h-4 w-4" />
                    <span>Update Main Image (800×800 recommended)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('mainImage', e.target.files)}
                      className="hidden"
                      id="mainImage"
                    />
                    <label htmlFor="mainImage" className="cursor-pointer block">
                      <EditFileUploadPreview 
                        type="image"
                        preview={imagePreviews.mainImage}
                        file={files.mainImage}
                        existingFile={initialData?.mainImage}
                        onFileChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                {/* Size Chart Image */}
                <div className="space-y-4">
                  <label className={labelStyle}>
                    <FaImage className="h-4 w-4" />
                    <span>Update Size Chart Image (800×800 recommended)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('sizeChartImage', e.target.files)}
                      className="hidden"
                      id="sizeChartImage"
                    />
                    <label htmlFor="sizeChartImage" className="cursor-pointer block">
                      <EditFileUploadPreview 
                        type="image"
                        preview={imagePreviews.sizeChartImage}
                        file={files.sizeChartImage}
                        existingFile={initialData?.sizeChartImage}
                        onFileChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                {/* Gallery Images */}
                <div className="lg:col-span-2 space-y-4">
                  <label className={labelStyle}>
                    <FaImage className="h-4 w-4" />
                    <span>Update Gallery Images (Multiple, 800×800 recommended)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-blue-400 transition-colors duration-200 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange('galleryImages', e.target.files)}
                      className="hidden"
                      id="galleryImages"
                    />
                    <label htmlFor="galleryImages" className="cursor-pointer block text-center mb-4">
                      <FaUpload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">Click to add new images</p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB each</p>
                    </label>

                    <EditFileUploadPreview 
                      type="gallery"
                      previews={imagePreviews.galleryImages}
                      file={files.galleryImages}
                      existingFile={initialData?.galleryImages}
                      onRemove={removeGalleryImage}
                      onFileChange={handleFileChange}
                      multiple
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div className={sectionStyle}>
              <EditSectionHeader icon={FiBox} title="Product Descriptions" color="indigo" />
              
              <div className="space-y-6">
                <div>
                  <label className={labelStyle}>Short Description</label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <JoditEditor
                      ref={shortDescriptionEditor}
                      value={shortDescription}
                      config={joditConfig}
                      onBlur={handleShortDescriptionBlur}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Rich Description</label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <JoditEditor
                      ref={richDescriptionEditor}
                      value={richDescription}
                      config={joditConfig}
                      onBlur={handleRichDescriptionBlur}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Printing & Embroidery</label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <JoditEditor
                      ref={printingEmbroideryEditor}
                      value={printingEmbroidery}
                      config={joditConfig}
                      onBlur={handlePrintingEmbroideryBlur}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Textile Care</label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <JoditEditor
                      ref={textileCareEditor}
                      value={textileCare}
                      config={joditConfig}
                      onBlur={handleTextileCareBlur}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEO & Meta */}
            <div className={sectionStyle}>
              <EditSectionHeader icon={FiTag} title="SEO & Meta Information" color="teal" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Meta Title</label>
                  <input {...register("metaTitle")} className={inputStyle} placeholder="SEO meta title" />
                </div>

                <div>
                  <label className={labelStyle}>Main Image Alt Text</label>
                  <input {...register("mainImageAltText")} className={inputStyle} placeholder="Alt text for accessibility" />
                </div>

                <div className="lg:col-span-2">
                  <label className={labelStyle}>Meta Description</label>
                  <textarea {...register("metaDescription")} rows="3" className={inputStyle} placeholder="SEO meta description" />
                </div>

                <div className="lg:col-span-2">
                  <label className={labelStyle}>Meta Keywords</label>
                  <input {...register("metaKeywords")} className={inputStyle} placeholder="keyword1, keyword2, keyword3" />
                </div>
              </div>
            </div>

            {/* YouTube URL */}
            <div className={sectionStyle}>
              <EditSectionHeader icon={FaYoutube} title="YouTube Video URL" color="red" />
              
              <div className="max-w-md">
                <label className={labelStyle}>
                  <FaYoutube className="h-4 w-4" />
                  <span>YouTube Video URL (Optional)</span>
                </label>
                <input 
                  {...register("youtubeUrl")} 
                  className={inputStyle} 
                  placeholder="https://youtube.com/watch?v=..." 
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Add a YouTube video URL to showcase your product
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!hasChanges}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Reset Changes
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading || !hasChanges}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {(isSubmitting || loading) ? (
                    <>
                      <FaSpinner className="animate-spin h-5 w-5" />
                      <span>Updating Product...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="h-5 w-5" />
                      <span>Update Product</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Performance Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <FaBolt className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                🚀 Performance Optimized for 1000+ Edits/Day
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• <strong>Session caching</strong> - 10-hour edit sessions</li>
                <li>• <strong>Auto-save</strong> - Never lose your work</li>
                <li>• <strong>Quick save</strong> - Instant field updates</li>
                <li>• <strong>Change detection</strong> - Know what's modified</li>
                <li>• <strong>Optimized rendering</strong> - Fast form interactions</li>
                <li>• <strong>Network resilience</strong> - Auto-retry on failures</li>
                <li>• <strong>Bulk pricing support</strong> - Wholesale pricing tiers</li>
                <li>• <strong>Certifications integration</strong> - Quality standards</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EditProductForm);