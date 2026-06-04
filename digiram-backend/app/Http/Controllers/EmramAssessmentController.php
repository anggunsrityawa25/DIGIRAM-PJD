<?php
namespace App\Http\Controllers;

use App\Models\EmramAssessment;
use App\Models\Hospital;
use App\Models\AssessmentEvidence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class EmramAssessmentController extends Controller
{
    // READ ALL
    public function index()
    {
        $user = Auth::user();
        if ($user->role === 'health_office') {
            $data = EmramAssessment::with(['user.hospital', 'reviewer'])
                        ->whereIn('status', ['submitted', 'under_review', 'reviewed', 'validated', 'rejected'])
                        ->orderBy('submitted_at', 'desc')
                        ->get();
        } else {
            $data = EmramAssessment::where('user_id', $user->id)
                        ->with(['user.hospital', 'reviewer'])
                        ->orderBy('created_at', 'desc')
                        ->get();
        }
        return response()->json(['success' => true, 'data' => $data]);
    }

    // READ ONE
    public function show($id)
    {
        $assessment = EmramAssessment::with(['user.hospital', 'reviewer'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $assessment]);
    }

    // CREATE — simpan sebagai draft
    public function store(Request $request)
    {
        $request->validate([
            'pic_name'          => 'nullable|string|max:255',
            'pic_email'         => 'nullable|email|max:255',
            'koordinator_rme'   => 'nullable|string|max:255',
            'koordinator_email' => 'nullable|email|max:255',
            'vendor_simrs'      => 'nullable|string|max:255',
            'nama_sistem_rme'   => 'nullable|string|max:255',
            'periode'           => 'nullable|string|max:100',
            'answers'           => 'nullable',
        ]);

        $answers = $request->input('answers');
        if (is_string($answers)) {
            $answers = json_decode($answers, true) ?? [];
        }

        $assessment = EmramAssessment::create([
            'user_id'           => Auth::id(),
            'pic_name'          => $request->input('pic_name'),
            'pic_email'         => $request->input('pic_email'),
            'koordinator_rme'   => $request->input('koordinator_rme'),
            'koordinator_email' => $request->input('koordinator_email'),
            'vendor_simrs'      => $request->input('vendor_simrs'),
            'nama_sistem_rme'   => $request->input('nama_sistem_rme'),
            'periode'           => $request->input('periode'),
            'answers'           => $answers ?? [],
            'target_stage'      => $request->input('stage_result'), // stage yang RS targetkan
            'stage_result'      => null,  // diisi setelah verifikasi dinkes
            'status'            => 'draft',
            'tanggal_assessment' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Assessment berhasil disimpan sebagai draft!',
            'data'    => $assessment->fresh(['user.hospital', 'reviewer']),
        ], 201);
    }

    // UPDATE
    public function update(Request $request, $id)
    {
        $assessment = EmramAssessment::where('user_id', Auth::id())->findOrFail($id);

        // Prevent editing locked assessments
        if ($assessment->is_locked) {
            return response()->json([
                'success' => false,
                'message' => 'Assessment ini telah dikunci dan tidak dapat diubah. Buat assessment baru untuk stage berikutnya.',
            ], 422);
        }

        $answers = $request->input('answers');
        if (is_string($answers)) {
            $answers = json_decode($answers, true) ?? [];
        }

        $updateData = [];

        // Hanya update field yang dikirim
        if ($request->has('pic_name'))          $updateData['pic_name']          = $request->input('pic_name');
        if ($request->has('pic_email'))         $updateData['pic_email']         = $request->input('pic_email');
        if ($request->has('koordinator_rme'))   $updateData['koordinator_rme']   = $request->input('koordinator_rme');
        if ($request->has('koordinator_email')) $updateData['koordinator_email'] = $request->input('koordinator_email');
        if ($request->has('vendor_simrs'))      $updateData['vendor_simrs']      = $request->input('vendor_simrs');
        if ($request->has('nama_sistem_rme'))   $updateData['nama_sistem_rme']   = $request->input('nama_sistem_rme');
        if ($request->has('periode'))           $updateData['periode']           = $request->input('periode');
        if ($request->has('evidence_notes'))    $updateData['evidence_notes']    = $request->input('evidence_notes');
        if ($request->has('stage_result'))      $updateData['target_stage']      = $request->input('stage_result'); // RS update target
        if ($answers !== null)                  $updateData['answers']           = $answers;

        $assessment->update($updateData);

        // Mark as synced when RS updates draft
        $assessment->update(['is_synced' => true, 'synced_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Assessment berhasil diperbarui!',
            'data'    => $assessment->fresh(['user.hospital', 'reviewer']),
        ]);
    }


    // DELETE
    public function destroy($id)
    {
        $assessment = EmramAssessment::where('user_id', Auth::id())->findOrFail($id);
        $assessment->delete();
        return response()->json(['success' => true, 'message' => 'Assessment berhasil dihapus.']);
    }

    // SUBMIT ke Dinkes
    public function submit($id)
    {
        $assessment = EmramAssessment::where('user_id', Auth::id())->findOrFail($id);
        if ($assessment->status !== 'draft' && $assessment->status !== 'rejected') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya assessment berstatus draft atau rejected yang bisa disubmit.',
            ], 422);
        }
        $assessment->update([
            'status'       => 'submitted',
            'submitted_at' => now(),
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Assessment berhasil dikirim ke Dinkes!',
            'data'    => $assessment->fresh(['user.hospital', 'reviewer']),
        ]);
    }

    // VERIFIKASI oleh Dinkes (3 tahap, menerima submitted ATAU reviewed)
    public function verify(Request $request, $id)
    {
        $request->validate([
            'status'              => 'required|in:reviewed,rejected',
            'verification_notes'  => 'nullable|string',
            'tinjau_keputusan'    => 'nullable|string',
            'tinjau_catatan'      => 'nullable|string',
            'pic_dinkes'          => 'nullable|string',
            'tanggal_kunjungan'   => 'nullable|date',
            'temuan_per_stage'    => 'nullable|array',
            'keputusan_per_stage' => 'nullable|array',
            'catatan_kunjungan'   => 'nullable|string',
            'keputusan_akhir'     => 'nullable|string',
            'catatan_akhir'       => 'nullable|string',
            'stage_result'        => 'nullable|integer|min:0|max:7',
        ]);

        $assessment = EmramAssessment::with('user.hospital')->findOrFail($id);

        // Perbolehkan verifikasi dari status submitted atau reviewed (multi-tahap)
        $allowedStatuses = ['submitted', 'under_review', 'reviewed'];
        if (!in_array($assessment->status, $allowedStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Assessment dengan status "'.$assessment->status.'" tidak dapat diverifikasi.',
            ], 422);
        }

        // ── Hitung stage_result dari keputusan_per_stage ──────────────────────
        // Logika:
        //   1. Temukan stage tertinggi berurutan dari 0 yang SEMUANYA "sesuai"
        //      (jika 0,1,2 sesuai tapi 3 belum → stage valid tertinggi = 2)
        //   2. Skor = skor kumulatif stage tersebut / 39 * 100
        //   3. Tidak ada keputusan_per_stage (dikembalikan step 1) → null (strip)
        $stageCumulativeScores = [0 => 3, 1 => 6, 2 => 12, 3 => 18, 4 => 23, 5 => 27, 6 => 34, 7 => 39];
        $keputusanPerStage = $request->input('keputusan_per_stage', []);

        $computedStageResult = null;
        if (!empty($keputusanPerStage)) {
            // Temukan stage BERURUTAN dari 0 yang semuanya "sesuai"
            // JSON keys bisa string atau int, normalisasi ke int
            $keputusanNorm = [];
            foreach ($keputusanPerStage as $k => $v) {
                $keputusanNorm[(int)$k] = $v;
            }
            $highestValidStage = -1;
            for ($s = 0; $s <= 7; $s++) {
                if (isset($keputusanNorm[$s]) && $keputusanNorm[$s] === 'sesuai') {
                    $highestValidStage = $s;
                } else {
                    break; // Rantai berurutan putus — stage ini tidak memenuhi
                }
            }
            if ($highestValidStage >= 0) {
                // Skor = skor kumulatif stage tertinggi valid / 39 * 100
                $kumulatif = $stageCumulativeScores[$highestValidStage] ?? 0;
                $computedStageResult = (int) round(($kumulatif / 39) * 100);
            } else {
                // Ada keputusan tapi stage 0 sudah "belum" → skor 0%
                $computedStageResult = 0;
            }
        }
        // Jika tidak ada keputusan_per_stage → $computedStageResult tetap null (tampil strip)

        // Gunakan stage_result dari request jika dikirim eksplisit, fallback ke computed
        $stageResult = $request->has('stage_result')
            ? $request->input('stage_result')
            : ($computedStageResult !== null ? $computedStageResult : $assessment->stage_result);

        // Konversi skor persentase → nomor stage (0-7) untuk disimpan ke hospitals.current_emram_stage
        // Skor kumulatif: 0→3, 1→6, 2→12, 3→18, 4→23, 5→27, 6→34, 7→39
        // Kita cari stage tertinggi yang skor kumulatifnya ≤ stageResult * 39 / 100
        // Konversi persentase skor (0-100) → nomor stage tertinggi yang sudah terpenuhi (0-7)
        // Indikator kumulatif: stage 0→3, 1→6, 2→12, 3→18, 4→23, 5→27, 6→34, 7→39
        $stageFromPct = static function(?int $pct): int {
            if ($pct === null || $pct <= 0) return 0;
            $cumul = [0 => 3, 1 => 6, 2 => 12, 3 => 18, 4 => 23, 5 => 27, 6 => 34, 7 => 39];
            // Hitung jumlah indikator yang terpenuhi dari persentase
            $indicatorCount = (int) round($pct / 100 * 39);
            $stage = 0;
            foreach ($cumul as $idx => $c) {
                if ($indicatorCount >= $c) {
                    $stage = $idx;
                } else {
                    break;
                }
            }
            return $stage;
        };

        // Update hospital.current_emram_stage HANYA jika DISETUJUI (reviewed)
        // Jika dikembalikan (rejected), stage RS tidak berubah
        if ($request->status === 'reviewed' && $stageResult !== null) {
            $user = $assessment->user;
            if ($user && $user->hospital_id) {
                $stageNum = $stageFromPct($stageResult);
                Hospital::where('id', $user->hospital_id)->update([
                    'current_emram_stage'  => $stageNum,
                    'last_assessment_date' => now()->toDateString(),
                ]);
            }
        }

        $updateData = [
            'status'              => $request->status,
            'verification_notes'  => $request->verification_notes,
            'reviewer_id'         => Auth::id(),
            'verified_at'         => now(),
            'stage_result'        => $stageResult,
        ];

        // Add locking logic: Lock assessment when approved (reviewed status)
        if ($request->status === 'reviewed') {
            $updateData['is_locked'] = true;
            $updateData['locked_at'] = now();
        }

        // Update field opsional jika ada
        if ($request->has('tinjau_keputusan'))    $updateData['tinjau_keputusan']    = $request->tinjau_keputusan;
        if ($request->has('tinjau_catatan'))      $updateData['tinjau_catatan']      = $request->tinjau_catatan;
        if ($request->has('pic_dinkes'))          $updateData['pic_dinkes']          = $request->pic_dinkes;
        if ($request->has('tanggal_kunjungan'))   $updateData['tanggal_kunjungan']   = $request->tanggal_kunjungan;
        if ($request->has('temuan_per_stage'))    $updateData['temuan_per_stage']    = $request->temuan_per_stage ?? [];
        if ($request->has('keputusan_per_stage')) $updateData['keputusan_per_stage'] = $request->keputusan_per_stage ?? [];
        if ($request->has('catatan_kunjungan'))   $updateData['catatan_kunjungan']   = $request->catatan_kunjungan;
        if ($request->has('keputusan_akhir'))     $updateData['keputusan_akhir']     = $request->keputusan_akhir;
        if ($request->has('catatan_akhir'))       $updateData['catatan_akhir']       = $request->catatan_akhir;

        $assessment->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Verifikasi berhasil!',
            'data'    => $assessment->fresh(['user.hospital', 'reviewer']),
        ]);
    }


    // Khusus RS: hanya milik sendiri
    public function myAssessments()
    {
        $data = EmramAssessment::where('user_id', Auth::id())
                    ->with(['user.hospital', 'reviewer'])
                    ->orderBy('created_at', 'desc')
                    ->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    // UPLOAD EVIDENCE FILE
    public function uploadEvidence(Request $request, $id)
    {
        $request->validate([
            'indicator_id' => 'required|string',
            'file' => 'required|file|max:10240', // max 10MB
            'notes' => 'nullable|string|max:500',
        ]);

        $assessment = EmramAssessment::findOrFail($id);

        // Check authorization: only hospital user can upload to their own assessment
        if (Auth::user()->role === 'hospital' && Auth::id() !== $assessment->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk upload file assessment ini.',
            ], 403);
        }

        // Prevent upload to locked assessment
        if ($assessment->is_locked) {
            return response()->json([
                'success' => false,
                'message' => 'Assessment yang sudah dikunci tidak dapat ditambahkan file.',
            ], 422);
        }

        $file = $request->file('file');
        $indicatorId = $request->input('indicator_id');
        $notes = $request->input('notes', '');

        // Store file in storage/app/assessments/{assessment_id}/{indicator_id}/
        $path = "assessments/{$assessment->id}/{$indicatorId}";
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs($path, $fileName, 'local');

        // Create evidence record
        $evidence = AssessmentEvidence::create([
            'assessment_id' => $assessment->id,
            'indicator_id' => $indicatorId,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => Auth::id(),
            'notes' => $notes,
        ]);

        // Mark assessment as synced
        $assessment->update(['is_synced' => true, 'synced_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'File berhasil diunggah!',
            'data' => [
                'id' => $evidence->id,
                'name' => $evidence->file_name,
                'url' => route('assessment.evidence.show', $evidence->id),
                'type' => $evidence->file_type,
                'size' => $evidence->file_size,
            ],
        ], 201);
    }

    // GET EVIDENCE FILES FOR ASSESSMENT
    public function getEvidence($id)
    {
        $assessment = EmramAssessment::with('evidence.uploadedBy')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $assessment->evidence->map(function ($e) {
                return [
                    'id' => $e->id,
                    'indicator_id' => $e->indicator_id,
                    'name' => $e->file_name,
                    'url' => route('assessment.evidence.show', $e->id),
                    'type' => $e->file_type,
                    'size' => $e->file_size,
                    'notes' => $e->notes,
                    'uploaded_by' => $e->uploadedBy->name,
                    'created_at' => $e->created_at,
                ];
            }),
        ]);
    }

    // DOWNLOAD/SHOW EVIDENCE FILE
    public function showEvidence($id)
    {
        $evidence = AssessmentEvidence::findOrFail($id);
        $assessment = $evidence->assessment;

        // Authorization: Hospital user can view their own, Dinkes can view submitted assessments
        $user = Auth::user();
        if ($user->role === 'hospital' && $user->id !== $assessment->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke file ini.',
            ], 403);
        }

        if ($user->role === 'health_office' && !in_array($assessment->status, ['submitted', 'under_review', 'reviewed', 'validated', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'Assessment ini tidak dapat diakses.',
            ], 403);
        }

        // Check if file exists
        if (!Storage::disk('local')->exists($evidence->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan.',
            ], 404);
        }

        // Return file for download using full path
        $filePath = Storage::disk('local')->path($evidence->file_path);
        return response()->download($filePath, $evidence->file_name);
    }

    // DELETE EVIDENCE FILE
    public function deleteEvidence($id)
    {
        $evidence = AssessmentEvidence::findOrFail($id);
        $assessment = $evidence->assessment;

        // Only assessment owner can delete
        if (Auth::id() !== $assessment->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk menghapus file ini.',
            ], 403);
        }

        // Prevent deleting from locked assessment
        if ($assessment->is_locked) {
            return response()->json([
                'success' => false,
                'message' => 'Assessment yang sudah dikunci tidak dapat dihapus filenya.',
            ], 422);
        }

        // Delete file from storage
        if (Storage::disk('local')->exists($evidence->file_path)) {
            Storage::disk('local')->delete($evidence->file_path);
        }

        $evidence->delete();

        return response()->json([
            'success' => true,
            'message' => 'File berhasil dihapus.',
        ]);
    }
}