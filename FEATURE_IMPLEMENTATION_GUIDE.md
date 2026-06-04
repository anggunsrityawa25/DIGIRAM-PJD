# DIGIRAM Feature Implementation Guide

## 📋 Overview

This document details the implementation of two major features for the DIGIRAM system:
1. **Data Faskes Regional** - Enhanced facility management with edit & add functionality
2. **Assessment Evidence Management** - Image and document upload/viewing system

**Implementation Date:** June 3, 2026
**Status:** ✅ Complete

---

## 🏥 Feature 1: Data Faskes Regional - Edit & Add Facility

### Purpose
Allow Dinkes (Provincial Health Office) users to manage facility (Faskes/RS) profiles directly from the regional data dashboard, including editing existing facilities and adding new ones.

### Key Components

#### Backend

**Models:**
- `Hospital.php` - Hospital/Facility data model
  - Fields: name, address, city, province, type, bed_capacity
  - current_emram_stage (latest verified stage)
  - last_assessment_date

**API Endpoints:**
- `GET /api/hospitals` - List all hospitals
- `GET /api/hospitals/{id}` - Get single hospital details
- `POST /api/hospitals` - Create new hospital
- `PUT /api/hospitals/{id}` - Update hospital profile
- `DELETE /api/hospitals/{id}` - Delete hospital

**Controller:** `HospitalController.php`

#### Frontend

**Components:**
- `AnalisisKematangan.tsx` - Regional data dashboard
  - Hospital data table with filters and sorting
  - Edit buttons for each facility
  - "Add Facility" button in toolbar
  - Expandable detail rows

- `FaskesModal.tsx` - Modal form for create/edit
  - Form validation
  - Input fields for all hospital attributes
  - Loading states
  - Error handling

**State Management:**
```typescript
const [editingId, setEditingId] = useState<number | null>(null);
const [modalOpen, setModalOpen] = useState(false);
const [isLoading, setIsLoading] = useState(false);
```

### User Workflow

#### For Dinkes Users:

1. **View Regional Facilities:**
   - Navigate to "Data Faskes Regional" menu
   - See table of all facilities with current data
   - Search, filter, and sort by stage, status, or name

2. **Edit Existing Facility:**
   - Click "Edit" button in table row
   - Modal opens with facility data pre-filled
   - Modify any fields (name, address, city, province, type, bed capacity)
   - Click "Simpan" to save changes

3. **Add New Facility:**
   - Click "+ Tambah Faskes Baru" button (top right)
   - Modal opens with empty form
   - Fill in all required fields
   - Click "Tambah" to create new facility

4. **View Facility Details:**
   - Click on any row to expand
   - See additional information: coordinates, bed count, stage
   - View target stage recommendations

### API Integration

**Edit Facility Request:**
```javascript
PUT /api/hospitals/{id}
{
  "name": "RSUD Central Updated",
  "address": "Jl. Merdeka No. 10",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "type": "RSUD",
  "bed_capacity": 250
}
```

**Create Facility Request:**
```javascript
POST /api/hospitals
{
  "name": "Rumah Sakit Baru",
  "address": "Jl. Sudirman",
  "city": "Bandung",
  "province": "Jawa Barat",
  "type": "RS Umum",
  "bed_capacity": 150
}
```

### Database Fields

```sql
hospitals.id              -- Primary key
hospitals.name           -- Facility name
hospitals.address        -- Physical address
hospitals.city           -- City/District
hospitals.province       -- Province
hospitals.type           -- Hospital type (RS Umum, RSUD, RS Khusus, etc.)
hospitals.bed_capacity   -- Number of beds
hospitals.current_emram_stage    -- Latest verified EMRAM stage (0-7)
hospitals.last_assessment_date   -- Date of last assessment
hospitals.created_at
hospitals.updated_at
```

---

## 📎 Feature 2: Assessment Evidence Management

### Purpose
Enable hospital staff to upload and submit images and documents as evidence during RME audits, and allow Dinkes staff to review this evidence during verification.

### Key Components

#### Backend

**Database Table:**
```sql
assessment_evidence
├── id (PK)
├── assessment_id (FK) → emram_assessments
├── indicator_id (string) -- Indicator ID (e.g., "s0i1", "s1i2")
├── file_name (string) -- Original file name
├── file_path (string) -- Path in storage/app/assessments/
├── file_type (string) -- MIME type (image/jpeg, application/pdf, etc.)
├── file_size (bigint) -- File size in bytes
├── uploaded_by (FK) → users
├── notes (text) -- Description/context for the evidence
├── created_at
└── updated_at
```

**Model:** `AssessmentEvidence.php`
```php
class AssessmentEvidence extends Model {
    protected $fillable = [
        'assessment_id', 'indicator_id', 'file_name',
        'file_path', 'file_type', 'file_size', 'uploaded_by', 'notes'
    ];
    
    public function assessment() -> belongsTo(EmramAssessment)
    public function uploadedBy() -> belongsTo(User)
    public function getFileUrl()
}
```

**Controller Methods:**

1. **uploadEvidence()** - Upload file for specific indicator
   - Validates file (max 10MB)
   - Stores file in: `storage/app/assessments/{assessment_id}/{indicator_id}/`
   - Creates AssessmentEvidence record
   - Marks assessment as synced
   - Returns file metadata (name, url, type, size)

2. **getEvidence()** - Retrieve all evidence for assessment
   - Returns evidence grouped by indicator_id
   - Includes file metadata and uploader info
   - Returns download URLs

3. **showEvidence()** - Download/view evidence file
   - Authorization checks (hospital user own, dinkes can view submitted)
   - Returns file for download
   - Handles file not found gracefully

4. **deleteEvidence()** - Remove evidence file
   - Only assessment owner can delete
   - Prevents deletion from locked assessments
   - Removes from storage

**API Endpoints:**
```
POST   /api/emram-assessment/{id}/upload-evidence
GET    /api/emram-assessment/{id}/evidence
GET    /api/assessment-evidence/{id}               [download]
DELETE /api/assessment-evidence/{id}
```

#### Frontend

**Components:**

1. **InstrumentEMRAM.tsx** - Audit form with evidence upload
   - `EvidencePanel` sub-component
   - Evidence display per indicator
   - File upload functionality (multi-file)
   - File preview/download
   - Notes/description field for evidence
   - Delete file button

2. **VerifikasiDinkes.tsx** - Verification interface with evidence viewer
   - Assessment expansion toggle
   - Evidence section displays all uploaded files
   - Evidence grouped by indicator
   - Image preview modal
   - Document download links
   - Evidence notes display

**State Management:**
```typescript
// In InstrumentEMRAM
const [evidences, setEvidences] = useState<Record<string, EvidenceData>>({});
const [openEvidence, setOpenEvidence] = useState<string | null>(null);

// In VerifikasiDinkes
const [expandedAssessmentId, setExpandedAssessmentId] = useState<number | null>(null);
const [evidence, setEvidence] = useState<Record<number, any>>({});
const [loadingEvidence, setLoadingEvidence] = useState<Record<number, boolean>>({});
const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
```

### User Workflow

#### For Hospital Staff (During Audit):

1. **Start Audit:**
   - Navigate to "Instrumen Audit RME"
   - Fill in assessment details
   - Begin answering indicators

2. **Upload Evidence Per Indicator:**
   - After answering indicator, scroll to "Bukti Validasi" section
   - Enter description/notes about the evidence
   - Click "↑ Unggah Dokumen Bukti" button
   - Select one or more files (images, PDFs, etc.)
   - Files upload immediately and appear in the list

3. **Evidence Management:**
   - View uploaded files with names
   - Delete files if needed
   - Update evidence notes with context

4. **Submit Assessment:**
   - Once all indicators answered with evidence
   - Click "Kirim ke Dinkes"
   - Assessment sent with all evidence

#### For Dinkes Staff (During Verification):

1. **View Assessment:**
   - Navigate to "Antrian Verifikasi"
   - Select assessment to verify
   - Click "▶ Lihat Bukti & Detail" to expand

2. **Review Evidence:**
   - See all uploaded evidence grouped by indicator
   - Click image files to preview in modal
   - Click document links to download and view
   - Read evidence descriptions/notes

3. **Make Verification Decision:**
   - Based on evidence and findings
   - Fill verification form
   - Accept or reject with notes

### File Storage

**Storage Structure:**
```
storage/app/assessments/
├── {assessment_id}/
│   ├── s0i1/
│   │   ├── 1717161234_document1.pdf
│   │   └── 1717161235_photo1.jpeg
│   ├── s0i2/
│   │   └── 1717161236_evidence.xlsx
│   └── s1i1/
│       ├── 1717161237_setup.jpg
│       └── 1717161238_screenshot.png
```

**File Naming:**
- Format: `{timestamp}_{original_filename}`
- Prevents conflicts and maintains original name for download

### API Integration

**Upload Evidence Request:**
```javascript
POST /api/emram-assessment/{id}/upload-evidence
Content-Type: multipart/form-data

FormData:
- file: <File object>
- indicator_id: "s0i1"
- notes: "Screenshot of laboratory module configuration"
```

**Get Evidence Response:**
```json
{
  "success": true,
  "data": {
    "s0i1": [
      {
        "id": 1,
        "indicator_id": "s0i1",
        "name": "lab_config.jpg",
        "url": "/api/assessment-evidence/1",
        "type": "image/jpeg",
        "size": 245230,
        "notes": "Laboratory module setup screen",
        "uploaded_by": "staff_name",
        "created_at": "2026-06-03 10:30:00"
      }
    ],
    "s0i2": [
      { ... }
    ]
  }
}
```

### Supported File Types

| Category | MIME Types | Max Size |
|----------|-----------|----------|
| Images | image/jpeg, image/png, image/gif, image/webp | 10MB |
| Documents | application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document | 10MB |
| Spreadsheets | application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | 10MB |

### Security Features

1. **Access Control:**
   - Hospital staff: Can only upload/delete own assessment evidence
   - Dinkes staff: Can view evidence from submitted assessments only
   - Authorization checks on all endpoints

2. **Locked Assessments:**
   - Cannot upload/delete evidence from locked assessments
   - Locks applied after Dinkes approval

3. **File Validation:**
   - File size limit: 10MB
   - MIME type validation on backend
   - Filename sanitization

### Error Handling

**Upload Failures:**
- File too large → "Gagal unggah: File terlalu besar"
- Invalid type → "Gagal unggah: Tipe file tidak didukung"
- Storage error → "Gagal unggah: Error dari server"

**Download Failures:**
- File not found → 404 with message
- Access denied → 403 with message
- Unauthorized → 401 error

---

## 🔄 Integration Points

### Verification Workflow Enhancement

The evidence system integrates seamlessly into the 3-stage verification process:

**Stage 1 (Desk Review):**
- Dinkes sees assessment details
- Can preview evidence before deciding

**Stage 2 (Field Visit):**
- Field officer reviews evidence
- Uses images/documents to validate claims
- Notes observations vs. evidence

**Stage 3 (Final Decision):**
- Based on evidence reviewed and findings
- Makes final approval/rejection

### Database Relationships

```
Users
  ├─ hasMany → EmramAssessments (user_id)
  └─ hasMany → AssessmentEvidence (uploaded_by)

EmramAssessments
  ├─ belongsTo → User (user_id)
  ├─ belongsTo → Hospital (via user.hospital_id)
  ├─ belongsTo → User (reviewer_id) [Dinkes reviewer]
  └─ hasMany → AssessmentEvidence

AssessmentEvidence
  ├─ belongsTo → EmramAssessment
  └─ belongsTo → User (uploaded_by)
```

---

## 📝 Implementation Details

### Changes Made

#### Backend Files Modified/Created:
- ✅ `app/Models/AssessmentEvidence.php` - Evidence model
- ✅ `app/Http/Controllers/EmramAssessmentController.php` - Evidence methods
- ✅ `database/migrations/2026_06_01_500000_create_assessment_evidence_table.php` - Evidence table
- ✅ `routes/api.php` - Evidence endpoints

#### Frontend Files Modified:
- ✅ `src/components/AnalisisKematangan.tsx` - Fixed add button, integrated CRUD
- ✅ `src/components/VerifikasiDinkes.tsx` - Added evidence viewing
- ✅ `src/components/InstrumentEMRAM.tsx` - Already had evidence upload
- ✅ `src/services/api.ts` - Evidence API functions

### Configuration

**Environment Variables:**
```env
# Storage
FILESYSTEM_DISK=local
STORAGE_PATH=storage/app

# File Upload
MAX_FILE_SIZE=10240  # 10MB in KB
UPLOAD_PATH=assessments
```

**Disk Configuration (`config/filesystems.php`):**
```php
'local' => [
    'driver' => 'local',
    'root' => storage_path('app'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'private',
],
```

---

## ✅ Testing Checklist

### Feature 1: Data Faskes Regional

- [ ] View all facilities in table
- [ ] Filter by stage
- [ ] Sort by name/stage
- [ ] Search for facility
- [ ] Click Edit button
- [ ] Edit modal opens with data
- [ ] Modify facility details
- [ ] Click Add Facility button
- [ ] Create new facility form opens
- [ ] Add new facility
- [ ] Verify data saved to database
- [ ] Refresh page - data persists

### Feature 2: Assessment Evidence

**Hospital Side:**
- [ ] Start new audit
- [ ] Answer indicator
- [ ] Upload single image file
- [ ] Upload multiple files
- [ ] Add evidence notes
- [ ] Delete uploaded file
- [ ] Save assessment as draft
- [ ] See files persist on reload
- [ ] Submit assessment with evidence
- [ ] Cannot upload to locked assessment

**Dinkes Side:**
- [ ] View assessment in queue
- [ ] Click expand evidence section
- [ ] See all evidence loaded
- [ ] Evidence grouped by indicator
- [ ] Click image - preview modal opens
- [ ] Click document - download works
- [ ] See evidence notes
- [ ] Verify and see evidence in record
- [ ] Rejected assessment - evidence preserved

---

## 🐛 Troubleshooting

### Evidence Not Uploading
1. Check file size (max 10MB)
2. Verify assessment exists
3. Check authentication token
4. Check storage disk permissions
5. Review Laravel logs

### Images Not Previewing
1. Verify file path in database
2. Check storage access permissions
3. Test direct file download first
4. Check CORS settings if remote storage

### Facilities Not Saving
1. Verify form validation passed
2. Check hospital_id foreign key constraint
3. Check database connection
4. Review API response errors

### Evidence Not Loading in Verification
1. Assessment must be in submitted status or later
2. Must be logged in as Dinkes user
3. Check network tab for API errors
4. Verify evidence records in database

---

## 📚 Related Documentation

- [Backend API Documentation](./digiram-backend/README.md)
- [Frontend Component Guide](./digiram-frontend/README.md)
- [Database Schema](./digiram-backend/database/migrations/)
- [EMRAM Indicators](./digiram-frontend/src/data/emramData.ts)

---

## 👥 Support & Contacts

For issues or questions:
- Development Team: [Contact info]
- Dinkes Support: [Contact info]
- Hospital IT Support: [Contact info]

---

**Version:** 1.0
**Last Updated:** June 3, 2026
**Status:** ✅ Production Ready
