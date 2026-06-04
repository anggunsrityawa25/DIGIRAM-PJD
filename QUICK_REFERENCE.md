# DIGIRAM Features - Quick Reference & Testing Guide

## 🚀 Quick Start

### Feature 1: Data Faskes Regional - Edit & Add Facility

**Location:** `Beranda > Data Faskes Regional`

**For Dinkes Users:**
1. ✅ Click **"+ Tambah Faskes Baru"** button to add new facility
2. ✅ Click **"Edit"** button in any row to modify facility details
3. ✅ All changes saved to database automatically

**Supported Fields:**
- Nama Faskes (Facility Name)
- Alamat (Address)
- Kota/Kabupaten (City/District)
- Provinsi (Province)
- Jenis RS (Hospital Type)
- Kapasitas Tempat Tidur (Bed Capacity)

---

### Feature 2: Assessment Evidence - Upload & View

**For Hospital Staff (During Audit):**

Location: `Beranda > Instrumen Audit RME`

1. Start audit and answer indicators
2. For each indicator, scroll to "**Bukti Validasi**" section
3. Click "**↑ Unggah Dokumen Bukti**" to upload:
   - Photos (JPG, PNG, GIF)
   - Documents (PDF, Word, Excel)
   - Up to 10MB per file
4. Add description notes
5. Files upload immediately
6. Submit assessment with evidence

**For Dinkes Staff (During Verification):**

Location: `Beranda > Antrian Verifikasi`

1. Select assessment from queue
2. Click **"▶ Lihat Bukti & Detail"** button
3. See all uploaded evidence grouped by indicator
4. **Click images** to preview in modal
5. **Click documents** to download
6. Read evidence notes for context
7. Make verification decision based on evidence

---

## 📂 File Structure

### Backend Changes
```
digiram-backend/
├── app/Models/
│   └── AssessmentEvidence.php          [✅ Evidence model]
├── app/Http/Controllers/
│   └── EmramAssessmentController.php   [✅ Evidence methods]
├── database/migrations/
│   └── 2026_06_01_500000_*             [✅ Evidence table]
└── routes/
    └── api.php                         [✅ Evidence endpoints]
```

### Frontend Changes
```
digiram-frontend/src/
├── components/
│   ├── AnalisisKematangan.tsx          [✅ Fixed add button]
│   ├── VerifikasiDinkes.tsx            [✅ Added evidence viewer]
│   └── InstrumentEMRAM.tsx             [✅ Already has upload]
└── services/
    └── api.ts                          [✅ Evidence functions]
```

---

## 🧪 Testing Scenarios

### Scenario 1: Add New Facility

**Steps:**
1. Login as Dinkes user
2. Go to "Data Faskes Regional"
3. Click "+ Tambah Faskes Baru"
4. Fill form:
   - Nama: "Rumah Sakit Baru Jakarta"
   - Alamat: "Jl. Sudirman No. 1"
   - Kota: "Jakarta"
   - Provinsi: "DKI Jakarta"
   - Jenis: "RS Umum"
   - Kapasitas: 200
5. Click "Tambah"
6. Verify success message
7. New facility appears in table

**Expected Result:** ✅ Facility created, visible in table

---

### Scenario 2: Edit Facility

**Steps:**
1. In "Data Faskes Regional" table
2. Click "Edit" on any facility row
3. Modal opens with pre-filled data
4. Change bed capacity from 200 → 250
5. Click "Simpan"
6. Verify success message
7. Refresh page - check data persists

**Expected Result:** ✅ Facility updated, changes persist

---

### Scenario 3: Upload Evidence During Audit

**Steps:**
1. Login as Hospital staff
2. Start new audit: "Mulai Audit"
3. Fill PIC information
4. Go to first indicator (S0I1)
5. Select answer: "Ya"
6. Scroll to "Bukti Validasi"
7. Enter note: "Screenshot konfigurasi lab"
8. Click "↑ Unggah Dokumen Bukti"
9. Select image file (e.g., lab_screenshot.jpg)
10. File uploads (see loading indicator)
11. File appears in list with delete button
12. Save draft - file persists

**Expected Result:** ✅ File uploaded, visible in evidence list

---

### Scenario 4: Upload Multiple Files

**Steps:**
1. Same as Scenario 3, indicator S0I2
2. Click "↑ Unggah Dokumen Bukti"
3. Select multiple files at once (Ctrl+Click)
4. Click "Unggah"
5. All files upload (show loading while uploading)
6. All files appear in list

**Expected Result:** ✅ Multiple files uploaded simultaneously

---

### Scenario 5: View Evidence During Verification

**Steps:**
1. Hospital submits assessment with evidence
2. Login as Dinkes user
3. Go to "Antrian Verifikasi"
4. Click on assessment to select it
5. Click "▶ Lihat Bukti & Detail"
6. Expand evidence section
7. See evidence grouped by indicator
8. **Click image file** → Preview modal opens
9. **Click document file** → Download starts
10. Read evidence notes
11. Make verification decision
12. Submit verification

**Expected Result:** ✅ Evidence viewed, verification completed

---

### Scenario 6: Image Preview Modal

**Steps:**
1. In verification, expand evidence
2. For image evidence (JPG, PNG, etc.)
3. Click on image filename
4. Modal opens showing image preview
5. See filename at bottom
6. Click X button to close modal
7. Click outside modal to close

**Expected Result:** ✅ Image preview works, modal closes properly

---

## ⚡ Common Tasks

### Upload Evidence File
```
✅ Location: Instrumen Audit > Any Indicator > Bukti Validasi
✅ Max size: 10MB per file
✅ Formats: JPG, PNG, PDF, DOC, XLSX
✅ Multiple files: Upload in one action
```

### View All Evidence
```
✅ Location: Antrian Verifikasi > Assessment > Lihat Bukti & Detail
✅ Grouped by: Indicator ID
✅ Actions: Preview images, Download docs, Read notes
```

### Download Evidence Document
```
✅ In: Verification interface
✅ Click: Document filename
✅ Result: Browser downloads file with original name
```

### Delete Evidence File
```
✅ Location: During audit (Instrumen Audit)
✅ Click: × button on file
✅ Note: Cannot delete from locked assessments
```

---

## 🔐 Access Control

### Who Can Upload Evidence?
- **Hospital Staff**: Own assessment only
- **Dinkes Staff**: Cannot upload (read-only)

### Who Can View Evidence?
- **Hospital Staff**: Their own assessments
- **Dinkes Staff**: All submitted assessments (read-only)

### Who Can Delete Evidence?
- **Hospital Staff**: Their own files (before locked)
- **Dinkes Staff**: Cannot delete

### Locked Assessments
- After Dinkes approves assessment → **locked**
- No new evidence can be uploaded
- No evidence can be deleted
- Evidence is read-only

---

## 📊 Database Queries

### View All Evidence for Assessment
```sql
SELECT * FROM assessment_evidence 
WHERE assessment_id = {id}
ORDER BY indicator_id, created_at;
```

### Check Total Evidence Uploaded
```sql
SELECT COUNT(*) as total_files
FROM assessment_evidence 
WHERE assessment_id = {id};
```

### Get Evidence by Indicator
```sql
SELECT * FROM assessment_evidence
WHERE assessment_id = {id} AND indicator_id = 's0i1';
```

### Storage Usage
```sql
SELECT SUM(file_size) as total_bytes
FROM assessment_evidence
WHERE assessment_id = {id};
```

---

## 🐛 Troubleshooting

### Upload Fails
```
❌ "File terlalu besar"
   → Check file size (max 10MB)
   → Compress image or document

❌ "Tipe file tidak didukung"
   → Use: JPG, PNG, PDF, DOC, XLSX only
   → Check file extension

❌ "Gagal unggah"
   → Check internet connection
   → Check authentication token
   → Try again in 30 seconds
```

### Can't See Evidence in Verification
```
❌ "Tidak ada bukti"
   → Assessment must be submitted/reviewed
   → Check hospital uploaded files
   → Refresh page

❌ "Evidence tidak load"
   → Check network connection
   → Check if logged in correctly
   → Check browser console for errors
```

### File Download Fails
```
❌ "File tidak ditemukan"
   → File may have been deleted
   → Check in upload directory
   → Contact IT support

❌ Download starts but opens wrong file
   → Browser cache issue
   → Clear cache and try again
   → Try different browser
```

---

## 📞 Support

| Issue | Resolution |
|-------|-----------|
| Can't see "+ Tambah Faskes" button | Ensure logged in as Dinkes user |
| Edit button doesn't work | Check hospital permissions |
| Upload very slow | Check file size, internet speed |
| Evidence disappears | Check if assessment locked |
| Image won't preview | Supported formats: JPG, PNG, GIF only |
| Document won't download | Try different browser, clear cache |

---

## 📋 Verification Checklist

Before going live, verify:

- [ ] Hospital staff can upload files
- [ ] Files persist after save
- [ ] Dinkes can view all evidence
- [ ] Images preview correctly
- [ ] Documents download correctly
- [ ] Cannot edit locked assessments
- [ ] All file types supported
- [ ] File size limit enforced
- [ ] Evidence notes display
- [ ] Facilities can be created
- [ ] Facilities can be edited
- [ ] Facilities display correctly

---

## 🎯 Performance Notes

### File Upload Performance
- Single file: ~1-3 seconds
- Multiple files: Queued sequentially
- Large files (>5MB): May take 5-10 seconds

### Evidence Retrieval
- First load: Fetches from server
- Cached in browser state
- Refresh to reload latest

### Storage Usage
- Average image: 500KB - 2MB
- Average document: 100KB - 1MB
- Per assessment (typical): 10-20MB
- Total system: Monitor as grows

---

**Version:** 1.0
**Last Updated:** June 3, 2026
**Status:** ✅ Ready for Testing

---

## 📝 Change Log

### Version 1.0 (June 3, 2026)
- ✅ Feature 1: Data Faskes Regional CRUD
- ✅ Feature 2: Assessment Evidence Management
- ✅ Image preview capability
- ✅ Document download support
- ✅ Evidence notes system
- ✅ Full access control

---
