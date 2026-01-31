import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { FiEdit2, FiTrash2, FiUpload, FiX, FiCheck } from 'react-icons/fi';

const CLOUD_NAME = 'dfmivfkum';
const UPLOAD_PRESET = 'devnasa';

function AddMembers() {
  const axiosSecure = useAxiosSecure();
  const [member, setMember] = useState({
    name: "",
    role: "",
    image: ""
  });
  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axiosSecure.get('/member');
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      setUploading(true);
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            toast.info(`Uploading: ${percentCompleted}%`, {
              autoClose: 1500,
              hideProgressBar: false
            });
          }
        }
      );
      
      setMember(prev => ({
        ...prev,
        image: response.data.secure_url
      }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!member.name || !member.role) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        // Update existing member
        await axiosSecure.patch(`/member/${editingId}`, member);
        toast.success(`Member ${member.name} updated successfully!`);
      } else {
        // Add new member
        await axiosSecure.post('/member', member);
        toast.success(`Member ${member.name} added successfully!`);
      }
      
      // Reset form and refresh list
      resetForm();
      fetchMembers();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(`Failed to ${editingId ? 'update' : 'add'} member`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (memberToEdit) => {
    setMember(memberToEdit);
    setEditingId(memberToEdit._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        setLoading(true);
        await axiosSecure.delete(`/member/${id}`);
        toast.success(`${name} deleted successfully!`);
        fetchMembers();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(`Failed to delete ${name}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setMember({
      name: "",
      role: "",
      image: ""
    });
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="p-6 sm:p-8 rounded-xl shadow-lg dark:bg-gray-800 bg-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                Team Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {editingId ? 'Edit existing team member' : 'Add new team members to your organization'}
              </p>
            </div>
          </div>

          {/* Member Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="p-6 rounded-lg border dark:border-gray-700 dark:bg-gray-800 border-gray-200 bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  {editingId ? 'Edit Member' : 'Add New Member'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={member.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      maxLength={100}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Role/Position <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={member.role}
                      onChange={handleChange}
                      placeholder="e.g. Chief Executive Officer"
                      maxLength={100}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Profile Image
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        id="image"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border dark:border-gray-600 dark:hover:bg-gray-700 border-gray-300 hover:bg-gray-50 transition ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <FiUpload />
                        {uploading ? 'Uploading...' : 'Choose Image'}
                      </button>
                    </div>
                    
                    {member.image && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Selected Image:
                          </span>
                          <button
                            type="button"
                            onClick={() => setMember(prev => ({ ...prev, image: "" }))}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                        <div className="relative">
                          <img 
                            src={member.image} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
                              e.target.className = 'w-full h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 p-4';
                            }}
                          />
                          {uploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={uploading || loading}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition ${(uploading || loading) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          {editingId ? <><FiCheck size={18} /> Update Member</> : 'Add Member'}
                        </>
                      )}
                    </button>
                    
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Members List */}
            <div className="lg:col-span-2">
              <div className="p-6 rounded-lg border dark:border-gray-700 dark:bg-gray-800 border-gray-200 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Team Members ({members.length})
                  </h2>
                  <button
                    onClick={fetchMembers}
                    disabled={loading}
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>

                {loading && members.length === 0 ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="mx-auto w-24 h-24 text-gray-400 dark:text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No team members</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by adding your first team member.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Member
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {members.map((member) => (
                          <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img 
                                    className="h-10 w-10 rounded-full object-cover" 
                                    src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                                    alt={member.name}
                                    onError={(e) => {
                                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
                                    }}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {member.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-300">{member.role}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() => handleEdit(member)}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                  title="Edit"
                                >
                                  <FiEdit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(member._id, member.name)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                  title="Delete"
                                >
                                  <FiTrash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMembers;