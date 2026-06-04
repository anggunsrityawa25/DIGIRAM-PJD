<?php
namespace App\Http\Controllers;

use App\Models\EmramStage;
use App\Models\EmramIndicator;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EmramInstrumentController extends Controller
{
    // ── GET /emram-instrument
    // Kembalikan semua stage beserta indikator-indikatornya.
    // Dipakai oleh Dinkes (semua indikator) dan RS (hanya is_active=true).
    public function index(Request $request)
    {
        $onlyActive = $request->boolean('active_only', false);

        $stages = EmramStage::with([
            $onlyActive ? 'activeIndicators' : 'indicators',
        ])
        ->orderBy('stage')
        ->get();

        // Normalise relationship key agar selalu 'indicators'
        $result = $stages->map(function ($stage) use ($onlyActive) {
            $stageArr = $stage->toArray();
            if ($onlyActive) {
                $stageArr['indicators'] = $stageArr['active_indicators'] ?? [];
                unset($stageArr['active_indicators']);
            }
            return $stageArr;
        });

        return response()->json(['data' => $result]);
    }

    // ── POST /emram-instrument/indicators
    // Tambah indikator baru pada suatu stage.
    public function storeIndicator(Request $request)
    {
        $this->authorizeHealthOffice();

        $data = $request->validate([
            'stage'          => 'required|integer|between:0,7',
            'indicator_code' => 'required|string|max:20',
            'text'           => 'required|string',
            'bukti_hint'     => 'nullable|string',
            'sort_order'     => 'nullable|integer',
            'is_active'      => 'nullable|boolean',
        ]);

        // Pastikan stage master sudah ada
        EmramStage::firstOrCreate(
            ['stage' => $data['stage']],
            ['title' => "Stage {$data['stage']}", 'sort_order' => $data['stage']]
        );

        // Auto sort_order: taruh di akhir stage jika tidak disebutkan
        if (!isset($data['sort_order'])) {
            $data['sort_order'] = EmramIndicator::where('stage', $data['stage'])->max('sort_order') + 1;
        }
        $data['is_active'] = $data['is_active'] ?? true;

        $indicator = EmramIndicator::create($data);
        return response()->json(['data' => $indicator], 201);
    }

    // ── PUT /emram-instrument/indicators/{id}
    // Edit teks / hint / aktif-nonaktif suatu indikator.
    public function updateIndicator(Request $request, int $id)
    {
        $this->authorizeHealthOffice();

        $indicator = EmramIndicator::findOrFail($id);

        $data = $request->validate([
            'text'       => 'sometimes|required|string',
            'bukti_hint' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'nullable|boolean',
        ]);

        $indicator->update($data);
        return response()->json(['data' => $indicator]);
    }

    // ── DELETE /emram-instrument/indicators/{id}
    // Hapus indikator (hard delete).
    public function destroyIndicator(int $id)
    {
        $this->authorizeHealthOffice();

        $indicator = EmramIndicator::findOrFail($id);
        $indicator->delete();
        return response()->json(['message' => 'Indikator berhasil dihapus.']);
    }

    // ── PUT /emram-instrument/stages/{stage}
    // Edit judul / deskripsi master stage.
    public function updateStage(Request $request, int $stage)
    {
        $this->authorizeHealthOffice();

        $stageModel = EmramStage::findOrFail($stage);

        $data = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'nullable|boolean',
        ]);

        $stageModel->update($data);
        return response()->json(['data' => $stageModel]);
    }

    // ── POST /emram-instrument/bulk-reorder
    // Ubah urutan indikator dalam satu stage.
    // Body: { "stage": 3, "order": [5, 2, 8, 11] }   (array of indicator IDs)
    public function bulkReorder(Request $request)
    {
        $this->authorizeHealthOffice();

        $request->validate([
            'stage' => 'required|integer|between:0,7',
            'order' => 'required|array',
            'order.*' => 'integer',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->order as $pos => $indicatorId) {
                EmramIndicator::where('id', $indicatorId)
                    ->where('stage', $request->stage)
                    ->update(['sort_order' => $pos + 1]);
            }
        });

        return response()->json(['message' => 'Urutan berhasil disimpan.']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    private function authorizeHealthOffice(): void
    {
        /** @var \App\Models\User|null $user */
        $user = request()->user();
        if (!$user || $user->role !== 'health_office') {
            abort(403, 'Hanya Dinas Kesehatan yang dapat mengelola instrumen EMRAM.');
        }
    }
}