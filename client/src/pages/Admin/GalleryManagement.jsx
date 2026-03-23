import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/apiConfig';
import toast from 'react-hot-toast';

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', display_order: 0, image: null });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/gallery/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Error fetching images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setFormData({ ...formData, image: file }); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.image) return toast.error('Please select an image');
    setUploading(true);
    const token = localStorage.getItem('adminToken');
    const data = new FormData();
    data.append('image', formData.image);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('display_order', formData.display_order);
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
      if (res.ok) {
        toast.success('Image uploaded');
        setFormData({ title: '', description: '', display_order: 0, image: null });
        setPreviewUrl(null);
        fetchImages();
      } else toast.error('Upload failed');
    } catch { toast.error('Error uploading image'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/admin/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { toast.success('Image deleted'); fetchImages(); }
      else toast.error('Delete failed');
    } catch { toast.error('Error deleting image'); }
  };

  const toggleActive = async (id, currentStatus) => {
    const token = localStorage.getItem('adminToken');
    const image = images.find(img => img.id === id);
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/admin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: image.title, description: image.description, display_order: image.display_order, is_active: currentStatus ? 0 : 1 })
      });
      if (res.ok) { toast.success('Status updated'); fetchImages(); }
    } catch { toast.error('Error updating status'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
      <p className="text-[#243670] text-sm">Loading gallery...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#243670] p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(#243670 0.5px, transparent 0.5px), radial-gradient(#243670 0.5px, #F0F4F8 0.5px)',
        backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px'
      }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-widest uppercase text-[#243670]">Gallery</h1>
            <p className="text-gray-400 text-xs mt-0.5">Upload and manage gallery images</p>
          </div>
          <span className="text-xs text-gray-400">{images.length} image{images.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Upload Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 mb-4 border border-[#243670]/10">
          <h2 className="text-sm font-semibold text-[#243670] mb-3 flex items-center gap-2">
            <span>📸</span> Upload New Image
          </h2>
          <form onSubmit={handleUpload}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-[#243670] mb-1">Image File *</label>
                  <input type="file" accept="image/*" onChange={handleFileChange}
                    className="w-full border border-[#243670]/20 rounded-lg p-2 text-xs focus:border-[#F59E0B] focus:outline-none bg-white" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#243670] mb-1">Title</label>
                  <input type="text" value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-[#243670]/20 rounded-lg p-2 text-xs focus:border-[#F59E0B] focus:outline-none"
                    placeholder="Image title" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#243670] mb-1">Description</label>
                  <textarea value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-[#243670]/20 rounded-lg p-2 text-xs focus:border-[#F59E0B] focus:outline-none resize-none"
                    rows="2" placeholder="Image description" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#243670] mb-1">Display Order</label>
                  <input type="number" value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full border border-[#243670]/20 rounded-lg p-2 text-xs focus:border-[#F59E0B] focus:outline-none"
                    placeholder="0" />
                </div>
                <button type="submit" disabled={uploading}
                  className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-5 py-2 rounded-lg text-xs font-semibold hover:shadow-md disabled:opacity-50 transition-all">
                  {uploading ? 'Uploading...' : '⬆️ Upload Image'}
                </button>
              </div>
              <div>
                {previewUrl && (
                  <div className="border border-[#243670]/20 rounded-lg overflow-hidden h-full max-h-52">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Images Grid */}
        <h2 className="text-sm font-semibold text-[#243670] mb-3">Gallery Images ({images.length})</h2>

        {images.length === 0 ? (
          <div className="bg-white/80 rounded-xl p-8 text-center border border-[#243670]/10">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-gray-400 text-sm">No images yet. Upload your first image above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {images.map((image) => (
              <div key={image.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border border-[#243670]/10 hover:border-[#F59E0B] transition-all duration-200 group">
                <div className="relative h-28 overflow-hidden">
                  <img src={image.image_url} alt={image.title} className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 right-1.5">
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${image.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {image.is_active ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  <p className="font-semibold text-xs text-[#243670] truncate">{image.title || 'Untitled'}</p>
                  <p className="text-[10px] text-gray-500 truncate mb-2">{image.description || 'No description'}</p>
                  <div className="flex items-center justify-between gap-1">
                    <button
                      onClick={() => toggleActive(image.id, image.is_active)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${image.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                      title={image.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${image.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <button onClick={() => handleDelete(image.id)}
                      className="text-red-500 hover:text-red-700 text-xs px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors">
                      🗑️
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
