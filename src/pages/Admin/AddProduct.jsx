import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { FaSpinner, FaUpload, FaTrash, FaImage, FaYoutube, FaCheckCircle, FaExclamationTriangle, FaCertificate } from "react-icons/fa";
import { FiPackage, FiTag, FiDollarSign, FiBox } from "react-icons/fi";
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

// 🚀 FAST Toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme: "light",
};

// 🚀 FAST Success Toast
const showSuccessToast = (message) => {
  toast.success(message, { ...toastConfig, autoClose: 1500 });
};

// 🚀 FAST Error Toast
const showErrorToast = (message) => {
  toast.error(message, { ...toastConfig, autoClose: 2000 });
};

// 🚀 FAST Loading Toast
const showLoadingToast = (message) => {
  return toast.loading(message, {
    ...toastConfig,
    autoClose: false,
  });
};

// 🚀 FAST Success Alert
const showSuccessAlert = (title, message, timer = 1500) => {
  showSuccessToast(message);
  return MySwal.fire({
    title: <div className="flex items-center space-x-2">
      <FaCheckCircle className="h-8 w-8 text-green-500" />
      <span className="text-2xl font-bold text-gray-900">{title}</span>
    </div>,
    html: <p className="text-gray-600 text-lg">{message}</p>,
    icon: 'success',
    timer: timer,
    timerProgressBar: true,
    showConfirmButton: false,
    background: '#f9fafb',
    color: '#374151',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-gray-200',
      timerProgressBar: 'bg-green-500'
    }
  });
};

// 🚀 FAST Error Alert Component
const showErrorAlert = (title, message) => {
  showErrorToast(message);
  return MySwal.fire({
    title: <div className="flex items-center space-x-2">
      <FaExclamationTriangle className="h-8 w-8 text-red-500" />
      <span className="text-2xl font-bold text-gray-900">{title}</span>
    </div>,
    html: <p className="text-gray-600 text-lg">{message}</p>,
    icon: 'error',
    background: '#f9fafb',
    color: '#374151',
    confirmButtonText: 'Try Again',
    confirmButtonColor: '#ef4444',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-gray-200',
      confirmButton: 'px-6 py-2 rounded-lg font-semibold'
    }
  });
};

// 🚀 FAST Loading Alert Component
const showLoadingAlert = (title, message) => {
  return MySwal.fire({
    title: <div className="flex items-center space-x-2">
      <FaSpinner className="h-8 w-8 text-blue-500 animate-spin" />
      <span className="text-2xl font-bold text-gray-900">{title}</span>
    </div>,
    html: <p className="text-gray-600 text-lg">{message}</p>,
    background: '#f9fafb',
    color: '#374151',
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-gray-200'
    },
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// 🚀 FAST Confirmation Alert Component
const showConfirmationAlert = (title, message, confirmText = "Yes, proceed", cancelText = "Cancel") => {
  return MySwal.fire({
    title: <div className="flex items-center space-x-2">
      <FaExclamationTriangle className="h-8 w-8 text-yellow-500" />
      <span className="text-2xl font-bold text-gray-900">{title}</span>
    </div>,
    html: <p className="text-gray-600 text-lg">{message}</p>,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    background: '#f9fafb',
    color: '#374151',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-gray-200',
      confirmButton: 'px-6 py-2 rounded-lg font-semibold',
      cancelButton: 'px-6 py-2 rounded-lg font-semibold'
    },
    reverseButtons: true
  });
};

// 🚀 OPTIMIZED: Image Compression Function
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    if (file.size < 102400) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      if (width > height && width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else if (height > maxWidth) {
        width = Math.round((width * maxWidth) / height);
        height = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          
          const compressedFile = new File([blob], 
            file.name.replace(/\.[^/.]+$/, "") + ".webp", 
            {
              type: 'image/webp',
              lastModified: Date.now(),
            }
          );
          
          console.log(`🖼️ Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };
    
    img.onerror = () => {
      resolve(file);
    };
    
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  });
};

// 🚀 OPTIMIZED: Fast File Validation
const validateFile = (file, type) => {
  const maxSizes = {
    image: 5 * 1024 * 1024,
  };

  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  };

  const fileType = 'image';
  
  if (!allowedTypes[fileType].includes(file.type)) {
    throw new Error(`Please upload JPEG, PNG, or WebP files only`);
  }

  if (file.size > maxSizes[fileType]) {
    throw new Error(`File too large! Max ${maxSizes[fileType] / 1024 / 1024}MB for image files`);
  }

  return true;
};

// Memoized custom components to prevent unnecessary re-renders
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

// 🚀 OPTIMIZED: Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-96">
    <div className="text-center">
      <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-lg">Loading product form...</p>
    </div>
  </div>
);

// 🚀 OPTIMIZED: File Upload Preview Component
const FileUploadPreview = React.memo(({ type, preview, file, onRemove, multiple = false, previews = [] }) => {
  const getUploadIcon = () => {
    return <FaImage className="h-12 w-12 text-gray-400 mx-auto" />;
  };

  const getUploadText = () => {
    switch (type) {
      case 'gallery': return "Click to upload multiple images";
      default: return "Click to upload image";
    }
  };

  const getFileInfo = () => {
    switch (type) {
      case 'gallery': return "PNG, JPG, WEBP up to 5MB each";
      default: return "PNG, JPG, WEBP up to 5MB";
    }
  };

  if (type === 'gallery' && previews.length > 0) {
    return (
      <div className="mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {previews.map((preview, index) => (
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
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                {file[index]?.name}
              </div>
            </div>
          ))}
        </div>
        <p className="text-green-600 text-sm mt-3 text-center">
          {previews.length} image(s) selected
        </p>
      </div>
    );
  }

  if (preview) {
    return (
      <div className="space-y-3">
        <img 
          src={preview} 
          alt="Preview" 
          className="w-32 h-32 object-cover rounded-lg mx-auto shadow-md"
          loading="lazy"
        />
        <p className="text-green-600 text-sm">✓ {file.name}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {getUploadIcon()}
      <p className="text-gray-600 dark:text-gray-400">{getUploadText()}</p>
      <p className="text-xs text-gray-500">{getFileInfo()}</p>
    </div>
  );
});

FileUploadPreview.displayName = 'FileUploadPreview';

// Section Header Component
const SectionHeader = React.memo(({ icon: Icon, title, color = "blue" }) => {
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

SectionHeader.displayName = 'SectionHeader';

// 🚀 OPTIMIZED: Progress Bar Component
const ProgressBar = ({ progress, message }) => (
  <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex justify-between items-center mb-3">
      <span className="text-gray-700 dark:text-gray-300 font-medium">{message}</span>
      <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
      <div 
        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out shadow-lg"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
      Uploading optimized files for faster processing...
    </p>
  </div>
);

const AddProductForm = () => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  
  // Jodit Editor refs
  const shortDescriptionEditor = useRef(null);
  const richDescriptionEditor = useRef(null);
  const printingEmbroideryEditor = useRef(null);
  const textileCareEditor = useRef(null);

  // File input refs for fast reset
  const fileInputRefs = useRef({
    mainImage: null,
    galleryImages: null,
    sizeChartImage: null
  });

  // 🚀 OPTIMIZED: Jodit Editor configuration
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

  // 🚀 OPTIMIZED: Form configuration
  const formConfig = useMemo(() => ({
    defaultValues: {
      title: '',
      productCode: '',
      gsmCode: '',
      category: '',
      subCategory: '',
      productStatus: 'active',
      sizes: [],
      colors: [],
      gender: [],
      fit: '',
      sustainability: '',
      brand: '',
      price: '',
      discountPrice: '',
      quantity: '',
      shortDescription: '',
      richDescription: '',
      printingEmbroidery: '',
      textileCare: '',
      metaTitle: '',
      mainImageAltText: '',
      metaDescription: '',
      metaKeywords: '',
      youtubeUrl: '',
      certifications: [],
      // Bulk pricing fields
      price100Pcs: '',
      price200Pcs: '',
      price500Pcs: ''
    },
    mode: 'onChange',
  }), []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm(formConfig);

  // Rich text content states
  const [shortDescription, setShortDescription] = useState('');
  const [richDescription, setRichDescription] = useState('');
  const [printingEmbroidery, setPrintingEmbroidery] = useState('');
  const [textileCare, setTextileCare] = useState('');

  // Jodit editor handlers with useCallback
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

  // Size mapping categories with memoization
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
      { display: '5xl', dbMatch: ['5XL', 'XXXXXL'] },
      { display: '30', dbMatch: ['30'] },
      { display: '32', dbMatch: ['32'] },
      { display: '34', dbMatch: ['34'] },
      { display: '36', dbMatch: ['36'] },
      { display: '38', dbMatch: ['38'] },
      { display: '40', dbMatch: ['40'] },
      { display: '42', dbMatch: ['42'] },
      { display: '44', dbMatch: ['44'] },
      { display: '46', dbMatch: ['46'] },
      { display: '48', dbMatch: ['48'] },
      { display: '50', dbMatch: ['50'] },
      { display: '52', dbMatch: ['52'] }
    ]
  }), []);

  const [selectedSizeCategory, setSelectedSizeCategory] = useState("");
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

  const watchCategory = watch('category');
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  // File handling with image preview
  const [files, setFiles] = useState({
    mainImage: null,
    galleryImages: [],
    sizeChartImage: null
  });

  const [imagePreviews, setImagePreviews] = useState({
    mainImage: null,
    galleryImages: [],
    sizeChartImage: null
  });

  // 🚀 OPTIMIZED: Fast file upload with compression
  const handleFileChange = useCallback(async (e, fileType) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles.length) return;

    try {
      if (fileType === 'galleryImages') {
        setIsCompressing(true);
        const newImages = Array.from(selectedFiles);
        
        newImages.forEach(file => validateFile(file, 'image'));
        
        showLoadingToast(`Compressing ${newImages.length} images...`);
        
        const processingPromises = newImages.map(file => 
          compressImage(file, 800, 0.7).catch(() => file)
        );
        
        const processedImages = await Promise.all(processingPromises);
        const newPreviews = processedImages.map(file => URL.createObjectURL(file));
        
        setFiles(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, ...processedImages]
        }));
        
        setImagePreviews(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, ...newPreviews]
        }));
        
        toast.dismiss();
        showSuccessToast(`Added ${newImages.length} optimized image(s)`);
      } else {
        const file = selectedFiles[0];
        validateFile(file, fileType);
        
        setIsCompressing(true);
        showLoadingToast("Optimizing image...");
        const processedFile = await compressImage(file, 800, 0.8).catch(() => file);
        toast.dismiss();

        const previewUrl = URL.createObjectURL(processedFile);
        setFiles(prev => ({ ...prev, [fileType]: processedFile }));
        setImagePreviews(prev => ({ ...prev, [fileType]: previewUrl }));
        
        showSuccessToast(`${fileType} optimized and ready`);
      }
    } catch (error) {
      showErrorToast(error.message);
      e.target.value = '';
    } finally {
      setIsCompressing(false);
    }
  }, []);

  // 🚀 OPTIMIZED: Fast gallery image removal
  const removeGalleryImage = useCallback((index) => {
    if (imagePreviews.galleryImages[index]) {
      URL.revokeObjectURL(imagePreviews.galleryImages[index]);
    }
    
    setFiles(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
    
    setImagePreviews(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
    
    showSuccessToast("Image removed");
  }, [imagePreviews.galleryImages]);

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

  // Find matching database sizes for a category
  const findMatchingDBSizes = useCallback((category) => {
    if (!category || !sizeCategories[category]) return [];
    
    const categorySizes = sizeCategories[category];
    const allDBSizes = dropdownData.sizes;
    
    const matchedSizes = [];
    
    categorySizes.forEach(catSize => {
      const foundSize = allDBSizes.find(dbSize => {
        const dbValue = (dbSize.value || dbSize.name || '').toUpperCase().trim();
        return catSize.dbMatch.some(match => 
          dbValue === match.toUpperCase().trim()
        );
      });
      
      if (foundSize) {
        matchedSizes.push(foundSize._id);
      }
    });
    
    return matchedSizes;
  }, [sizeCategories, dropdownData.sizes]);

  // Handle size category change - Auto add matching sizes
  const handleSizeCategoryChange = useCallback((category) => {
    setSelectedSizeCategory(category);
    if (category && dropdownData.sizes.length > 0) {
      const matchedSizeIds = findMatchingDBSizes(category);
      const currentSizes = watch("sizes") || [];
      const newSizes = [...new Set([...currentSizes, ...matchedSizeIds])];
      setValue("sizes", newSizes);
      showSuccessToast(`Added ${matchedSizeIds.length} ${category} sizes automatically`);
    }
  }, [dropdownData.sizes, findMatchingDBSizes, setValue, watch]);

  // Get available sizes for display - memoized
  const availableSizes = useMemo(() => {
    return dropdownData.sizes.map(size => ({
      value: size._id,
      label: size.value || size.name,
    }));
  }, [dropdownData.sizes]);

  // Color options - memoized
  const colorOptions = useMemo(() => {
    return dropdownData.colors.map(color => ({
      value: color._id,
      label: color.name,
      hex: color.hex,
      name: color.name
    }));
  }, [dropdownData.colors]);

  // Certification options - memoized
  const certificationOptions = useMemo(() => {
    return dropdownData.certifications.map(cert => ({
      value: cert._id,
      label: cert.name,
      issuingOrganization: cert.issuingOrganization,
      description: cert.description
    }));
  }, [dropdownData.certifications]);

  // 🚀 OPTIMIZED: Fast form data fetching with caching
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setFormLoading(true);
        
        const toastId = showLoadingToast("Loading product form data...");
        
        const cacheKey = 'productFormData';
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 30 * 60 * 1000) {
            setDropdownData(data);
            setFormLoading(false);
            toast.dismiss(toastId);
            showSuccessToast("Form data loaded from cache");
            return;
          }
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
        
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: newData,
          timestamp: Date.now()
        }));
        
        toast.dismiss(toastId);
        showSuccessToast("Form data loaded successfully");
      } catch (error) {
        console.error('Error fetching data:', error);
        showErrorToast("Failed to load form data. Please try again.");
      } finally {
        setFormLoading(false);
      }
    };

    fetchAllData();
  }, [axiosSecure]);

  // Filter subcategories - optimized
  useEffect(() => {
    if (watchCategory && dropdownData.subCategories.length > 0) {
      const filtered = dropdownData.subCategories.filter(
        sub => sub.categoryId === watchCategory
      );
      setFilteredSubCategories(filtered);
      setValue('subCategory', '');
    } else {
      setFilteredSubCategories([]);
    }
  }, [watchCategory, dropdownData.subCategories, setValue]);

  // 🚀 OPTIMIZED: Super fast form submission with progress tracking
  const onSubmit = useCallback(async (data) => {
    if (!isValid) {
      showErrorToast("Please fill all required fields correctly");
      return;
    }

    if (!files.mainImage) {
      showErrorToast("Main image is required");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    
    const loadingAlert = showLoadingAlert("Creating Product", "Preparing upload...");

    try {
      const formData = new FormData();
      
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

      // Append files
      if (files.mainImage) formData.append('mainImage', files.mainImage);
      if (files.sizeChartImage) formData.append('sizeChartImage', files.sizeChartImage);
      if (files.galleryImages.length > 0) {
        files.galleryImages.forEach(image => formData.append('galleryImages', image));
      }

      const totalSize = Object.values(files).reduce((total, file) => {
        if (Array.isArray(file)) {
          return total + file.reduce((sum, f) => sum + (f?.size || 0), 0);
        }
        return total + (file?.size || 0);
      }, 0);

      console.log(`📤 Uploading ${(totalSize / 1024 / 1024).toFixed(2)}MB of optimized data`);

      const response = await axiosSecure.post('/products', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
        timeout: 45000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
            
            const uploadedMB = (progressEvent.loaded / 1024 / 1024).toFixed(1);
            const totalMB = (progressEvent.total / 1024 / 1024).toFixed(1);
            
            if (loadingAlert.isVisible()) {
              loadingAlert.update({
                html: `<p class="text-gray-600 text-lg">Uploading... ${percentCompleted}% (${uploadedMB}MB / ${totalMB}MB)</p>`
              });
            }
          }
        }
      });

      if (response.data.success) {
        loadingAlert.close();
        
        showSuccessToast("Product created successfully! 🎉");
        
        await showSuccessAlert(
          "Product Created!", 
          "Your product has been successfully created and is now live!",
          1500
        );
        
        // Reset form state
        reset();
        setFiles({
          mainImage: null,
          galleryImages: [],
          sizeChartImage: null
        });
        setImagePreviews({
          mainImage: null,
          galleryImages: [],
          sizeChartImage: null
        });
        setShortDescription('');
        setRichDescription('');
        setPrintingEmbroidery('');
        setTextileCare('');
        setSelectedSizeCategory("");
        setUploadProgress(0);
        
        Object.values(fileInputRefs.current).forEach(ref => {
          if (ref) ref.value = '';
        });
        
        sessionStorage.removeItem('productFormData');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      loadingAlert.close();
      
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      
      showErrorToast("Failed to create product");
      
      await showErrorAlert("Creation Failed", `Error: ${errorMessage}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }, [axiosSecure, files, reset, isValid]);

  // 🚀 OPTIMIZED: Fast form reset
  const handleReset = useCallback(async () => {
    const result = await showConfirmationAlert(
      "Reset Form?",
      "Are you sure you want to reset the form? All entered data will be lost.",
      "Yes, Reset Everything",
      "Cancel"
    );
    
    if (result.isConfirmed) {
      Object.values(imagePreviews).forEach(preview => {
        if (preview && typeof preview === 'string') {
          URL.revokeObjectURL(preview);
        } else if (Array.isArray(preview)) {
          preview.forEach(url => URL.revokeObjectURL(url));
        }
      });

      reset();
      setFiles({
        mainImage: null,
        galleryImages: [],
        sizeChartImage: null
      });
      setImagePreviews({
        mainImage: null,
        galleryImages: [],
        sizeChartImage: null
      });
      setShortDescription('');
      setRichDescription('');
      setPrintingEmbroidery('');
      setTextileCare('');
      setSelectedSizeCategory("");
      setUploadProgress(0);
      
      Object.values(fileInputRefs.current).forEach(ref => {
        if (ref) ref.value = '';
      });
      
      showSuccessToast("Form reset successfully");
    }
  }, [reset, imagePreviews]);

  // Styling constants
  const inputStyle = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 cursor-text";
  const labelStyle = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2 cursor-default";
  const errorStyle = "text-red-500 text-xs mt-1 flex items-center space-x-1 cursor-default";
  const sectionStyle = "space-y-6 p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200";

  if (formLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 cursor-default">
      {/* React Toastify Container */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        style={{
          zIndex: 9999
        }}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Add New Product
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Create a new product listing with all necessary details
          </p>
        </div>

        {/* 🚀 Upload Progress Bar */}
        {uploadProgress > 0 && (
          <ProgressBar 
            progress={uploadProgress} 
            message={`Uploading optimized files...`}
          />
        )}

        {/* 🚀 Compression Indicator */}
        {isCompressing && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <FaSpinner className="animate-spin h-5 w-5 text-blue-600" />
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                Optimizing images for faster upload...
              </span>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-gray-200 dark:divide-gray-700">
            
            {/* Basic Information */}
            <div className={sectionStyle}>
              <SectionHeader icon={FiPackage} title="Basic Information" color="blue" />
              
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
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="featured">Featured</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category & Brand */}
            <div className={sectionStyle}>
              <SectionHeader icon={FiPackage} title="Category & Brand" color="green" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Category *</label>
                  <select 
                    {...register("category", { required: "Category is required" })} 
                    className={`${inputStyle} cursor-pointer`}
                  >
                    <option value="">Select Category</option>
                    {dropdownData.categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
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
                    <option value="">Select Sub Category</option>
                    {filteredSubCategories.map(subCat => (
                      <option key={subCat._id} value={subCat._id}>
                        {subCat.name}
                      </option>
                    ))}
                  </select>
                  {errors.subCategory && <p className={errorStyle}>{errors.subCategory.message}</p>}
                </div>

                <div className="lg:col-span-2">
                  <label className={labelStyle}>Brand</label>
                  <select {...register("brand")} className={`${inputStyle} cursor-pointer`}>
                    <option value="">Select Brand</option>
                    {dropdownData.brands.map(brand => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sizes & Colors */}
            <div className={sectionStyle}>
              <SectionHeader icon={FiBox} title="Sizes & Colors" color="purple" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Size Category</label>
                  <select 
                    value={selectedSizeCategory}
                    onChange={(e) => handleSizeCategoryChange(e.target.value)}
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
                        value={availableSizes.filter(option => 
                          field.value?.includes(option.value)
                        )}
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
                        placeholder="Select colors..."
                        value={colorOptions.filter(option => 
                          field.value?.includes(option.value)
                        )}
                        onChange={(selected) => field.onChange(selected?.map(s => s.value) || [])}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Additional Attributes */}
            <div className={sectionStyle}>
              <SectionHeader icon={FiBox} title="Additional Attributes" color="orange" />
              
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
                  <select {...register("fit")} className={`${inputStyle} cursor-pointer`}>
                    <option value="">Select Fit</option>
                    {dropdownData.productFits.map(fit => (
                      <option key={fit._id} value={fit._id}>{fit.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>Sustainability</label>
                  <select {...register("sustainability")} className={`${inputStyle} cursor-pointer`}>
                    <option value="">Select Sustainability</option>
                    {dropdownData.sustainability.map(item => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className={sectionStyle}>
              <SectionHeader 
                icon={FaCertificate} 
                title="Product Certifications" 
                color="lime" 
              />
              
              <div className="space-y-4">
                <div>
                  <label className={labelStyle}>
                    <FaCertificate className="h-4 w-4" />
                    <span>Product Certifications  & Quality Standards</span>
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
                        placeholder="Select certifications..."
                        value={certificationOptions.filter(option => 
                          field.value?.includes(option.value)
                        )}
                        onChange={(selected) => field.onChange(selected?.map(s => s.value) || [])}
                        noOptionsMessage={() => "No certifications available"}
                      />
                    )}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Select relevant certifications and quality standards for your product
                  </p>
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
              <SectionHeader 
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
                  Bulk Pricing (Optional)
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
                
                {/* Bulk Pricing Info */}
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FiDollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        Bulk Pricing Information
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        Set wholesale prices for larger quantities. These prices will be shown to customers when they order in bulk.
                        Leave empty if not applicable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Uploads */}
            <div className={sectionStyle}>
              <SectionHeader icon={FaUpload} title="Media Uploads" color="pink" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Image */}
                <div className="space-y-4">
                  <label className={labelStyle}>
                    <FaImage className="h-4 w-4" />
                    <span>Main Image * (800×800 recommended)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'mainImage')}
                      className="hidden"
                      id="mainImage"
                      ref={el => fileInputRefs.current.mainImage = el}
                    />
                    <label htmlFor="mainImage" className="cursor-pointer block">
                      <FileUploadPreview 
                        type="image"
                        preview={imagePreviews.mainImage}
                        file={files.mainImage}
                      />
                    </label>
                  </div>
                </div>

                {/* Size Chart Image */}
                <div className="space-y-4">
                  <label className={labelStyle}>
                    <FaImage className="h-4 w-4" />
                    <span>Size Chart Image *(800×800 recommended)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'sizeChartImage')}
                      className="hidden"

                      id="sizeChartImage"
                      ref={el => fileInputRefs.current.sizeChartImage = el}
                    />
                    <label htmlFor="sizeChartImage" className="cursor-pointer block">
                      <FileUploadPreview 
                        type="image"
                        preview={imagePreviews.sizeChartImage}
                        file={files.sizeChartImage}
                      />
                    </label>
                  </div>
                </div>

                {/* Gallery Images */}
                <div className="lg:col-span-2 space-y-4">
                  <label className={labelStyle}>
                    <FaImage className="h-4 w-4" />
                    <span>Gallery Images *(Multiple, 800×800 recommended)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-blue-400 transition-colors duration-200 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      required
                      onChange={(e) => handleFileChange(e, 'galleryImages')}
                      className="hidden"
                      id="galleryImages"
                      ref={el => fileInputRefs.current.galleryImages = el}
                    />
                    <label htmlFor="galleryImages" className="cursor-pointer block text-center mb-4">
                      <FaUpload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">Click to upload multiple images</p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB each (auto-optimized)</p>
                    </label>

                    <FileUploadPreview 
                      type="gallery"
                      previews={imagePreviews.galleryImages}
                      file={files.galleryImages}
                      onRemove={removeGalleryImage}
                      multiple
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div className={sectionStyle}>
              <SectionHeader icon={FiBox} title="Product Descriptions" color="indigo" />
              
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
              <SectionHeader icon={FiTag} title="SEO & Meta Information" color="teal" />
              
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
              <SectionHeader icon={FaYoutube} title="YouTube Video URL" color="red" />
              
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

            {/* Submit Buttons */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  disabled={loading}
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid || !files.mainImage}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin h-5 w-5" />
                      <span>Creating Product...</span>
                    </>
                  ) : (
                    <>
                      <FiPackage className="h-5 w-5" />
                      <span>Create Product</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 🚀 Performance Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <FaCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                🚀 Super Fast Uploads Enabled
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• <strong>Automatic image compression</strong> - Files reduced by 60-80%</li>
                <li>• <strong>WebP conversion</strong> - Better quality with smaller size</li>
                <li>• <strong>Smart caching</strong> - Form data loads instantly</li>
                <li>• <strong>Progress tracking</strong> - Real-time upload status</li>
                <li>• <strong>Bulk pricing support</strong> - Wholesale pricing tiers</li>
                <li>• <strong>Certifications integration</strong> - Quality standards support</li>
                <li>• <strong>Optimized for mobile</strong> - Fast even on slow networks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AddProductForm);