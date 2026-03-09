import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';
import toast from 'react-hot-toast';

const GalleryManagement = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    display_order: 0,
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/gallery/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Error fetching images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      toast.error('Please select an image');
      return;
    }

    setUploading(true);
    const token = localStorage.getItem('adminToken');
    const data = new FormData();
    data.append('image', formData.image);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('display_order', formData.display_order);

    try {
      const response = await fetch(`${API_BASE_URL}/gallery/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });

      if (response.ok) {
        toast.success('Image uploaded successfully');
        setFormData({ title: '', description: '', display_order: 0, image: null });
        setPreviewUrl(null);
        fetchImages();
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/gallery/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Image deleted');
        fetchImages();
      } else {
        toast.error('Delete failed');
      }
    } catch (error) {
      toast.error('Error deleting image');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    const token = localStorage.getItem('adminToken');
    const image = images.find(img => img.id === id);
    
    try {
      const response = await fetch(`${API_BASE_URL}/gallery/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: image.title,
          description: image.description,
          display_order: image.display_order,
          is_active: currentStatus ? 0 : 1
        })
      });

      if (response.ok) {
        toast.success('Status updated');
        fetchImages();
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-[#243670] text-xl">Loading gallery...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#243670] p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(#243670 0.5px, transparent 0.5px), radial-gradient(#243670 0.5px, #F0F4F8 0.5px)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px'
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-light tracking-widest uppercase text-[#243670] mb-2">
            Gallery Management
          </h1>
          <p className="text-gray-500">Upload and manage your gallery images</p>
        </div>

        {/* Upload Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border-2 border-[#243670]/10">
          <h2 className="text-2xl font-semibold text-[#243670] mb-6 flex items-center gap-3">
            <span className="text-3xl">📸</span>
            Upload New Image
          </h2>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#243670] mb-2">Image File *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border-2 border-[#243670]/20 rounded-lg p-3 focus:border-[#F59E0B] focus:outline-none transition-colors bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#243670] mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border-2 border-[#243670]/20 rounded-lg p-3 focus:border-[#F59E0B] focus:outline-none transition-colors"
                    placeholder="Enter image title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#243670] mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border-2 border-[#243670]/20 rounded-lg p-3 focus:border-[#F59E0B] focus:outline-none transition-colors"
                    rows="3"
                    placeholder="Enter image description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#243670] mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full border-2 border-[#243670]/20 rounded-lg p-3 focus:border-[#F59E0B] focus:outline-none transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                {previewUrl && (
                  <div className="border-2 border-[#243670]/20 rounded-lg overflow-hidden h-full">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#F59E0B]/30 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              {uploading ? 'Uploading...' : '⬆️ Upload Image'}
            </button>
          </form>
        </div>

        {/* Images Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#243670] mb-6">Gallery Images ({images.length})</h2>
        </div>
        
        {images.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border-2 border-[#243670]/10">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-gray-500 text-lg">No images uploaded yet. Upload your first image above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border-2 border-[#243670]/10 hover:border-[#F59E0B] transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden">
                  <img src={image.image_url} alt={image.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${image.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {image.is_active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-[#243670] mb-2 truncate">{image.title || 'Untitled'}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{image.description || 'No description'}</p>
                  <div className="flex items-center justify-between gap-4">
                    {/* Toggle Switch */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#243670]">Status:</span>
                      <button
                        onClick={() => toggleActive(image.id, image.is_active)}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 ${
                          image.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                            image.is_active ? 'translate-x-8' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryManagement;
