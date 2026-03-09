# Gallery & Settings Features - Setup Guide

## What Was Added

### 1. Gallery Feature
- **Backend**: Upload, manage, and display gallery images
- **Frontend**: Public gallery page with lightbox
- **Admin Panel**: Full CRUD operations for gallery images

### 2. Settings Management
- **Backend**: Store and manage application settings
- **Admin Panel**: Update Google Maps API key and other settings

## Database Setup

Run this SQL to create the required tables:

```sql
-- Run the migration file
source server/migrations/add_gallery_and_settings.sql
```

Or manually execute:
```sql
CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  image_id_imagekit VARCHAR(255),
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO settings (setting_key, setting_value, description) 
VALUES ('google_maps_api_key', '', 'Google Maps API Key for map components')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
```

## API Endpoints

### Gallery Endpoints
- `GET /api/gallery` - Get all active gallery images (public)
- `GET /api/gallery/admin/all` - Get all gallery images (admin)
- `POST /api/gallery/admin/upload` - Upload new image (admin)
- `PUT /api/gallery/admin/:id` - Update image details (admin)
- `DELETE /api/gallery/admin/:id` - Delete image (admin)

### Settings Endpoints
- `GET /api/settings/:key` - Get specific setting (public)
- `GET /api/settings` - Get all settings (admin)
- `PUT /api/settings/:key` - Update setting (admin)

## Frontend Routes

### Public Routes
- `/gallery` - View gallery images

### Admin Routes
- `/admin/gallery` - Manage gallery images
- `/admin/settings` - Manage application settings

## How to Use

### For Admins:

1. **Access Gallery Management**:
   - Login to admin panel
   - Click "📸 Gallery" button in dashboard header
   - Upload images with title, description, and display order
   - Toggle active/inactive status
   - Delete images

2. **Access Settings**:
   - Login to admin panel
   - Click "⚙️ Settings" button in dashboard header
   - Enter Google Maps API key
   - Save changes

3. **Get Google Maps API Key**:
   - Go to https://console.cloud.google.com/google/maps-apis
   - Create a project or select existing one
   - Enable Maps JavaScript API
   - Create credentials (API Key)
   - Copy and paste into Settings page

### For Users:
- Visit `/gallery` to view all active images
- Click on any image to view in lightbox mode
- Close lightbox by clicking X or clicking outside

## Files Created

### Backend
- `server/migrations/add_gallery_and_settings.sql`
- `server/src/controllers/galleryController.js`
- `server/src/controllers/settingsController.js`
- `server/src/routes/galleryRoutes.js`
- `server/src/routes/settingsRoutes.js`

### Frontend
- `client/src/pages/Gallery/Gallery.jsx`
- `client/src/pages/Admin/GalleryManagement.jsx`
- `client/src/pages/Admin/SettingsManagement.jsx`

### Modified Files
- `server/index.js` - Added new routes
- `client/src/App.jsx` - Added new routes
- `client/src/pages/Admin/AdminDashboard.jsx` - Added navigation buttons

## Next Steps

1. Run the database migration
2. Restart your backend server
3. Test gallery upload in admin panel
4. Add Google Maps API key in settings
5. Visit `/gallery` to see public gallery page

## Notes

- Images are stored in ImageKit under `/gallery` folder
- Gallery images can be reordered using display_order field
- Inactive images won't show on public gallery page
- Settings are stored in database and can be accessed via API
