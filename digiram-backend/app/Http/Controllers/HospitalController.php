<?php

namespace App\Http\Controllers;

use App\Models\Hospital;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HospitalController extends Controller
{
    // 1. READ ALL: Ambil semua data Rumah Sakit beserta info assessment terakhir
    public function index()
    {
        $hospitals = Hospital::withCount('users')
            ->get()
            ->map(function ($h) {
                return $h;
            });
        return response()->json(['success' => true, 'data' => $hospitals]);
    }

    // 2. READ ONE: Ambil satu Rumah Sakit berdasarkan ID
    public function show($id)
    {
        $hospital = Hospital::findOrFail($id);
        return response()->json(['success' => true, 'data' => $hospital]);
    }

    // 3. CREATE: Simpan Rumah Sakit baru (hanya Dinkes)
    public function store(Request $request)
    {
        // Only health_office users can create hospitals
        if (Auth::check() && Auth::user()->role !== 'health_office') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Dinas Kesehatan yang dapat menambahkan faskes baru.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'type' => 'nullable|string|max:50',
            'bed_capacity' => 'nullable|integer|min:0',
            'current_emram_stage' => 'nullable|integer|min:0|max:7',
        ]);

        $hospital = Hospital::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Faskes baru berhasil ditambahkan!',
            'data' => $hospital,
        ], 201);
    }

    // 4. UPDATE: Perbarui data Rumah Sakit (hanya Dinkes)
    public function update(Request $request, $id)
    {
        // Only health_office users can update hospitals
        if (Auth::check() && Auth::user()->role !== 'health_office') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Dinas Kesehatan yang dapat mengedit data faskes.',
            ], 403);
        }

        $hospital = Hospital::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'type' => 'nullable|string|max:50',
            'bed_capacity' => 'nullable|integer|min:0',
            'current_emram_stage' => 'nullable|integer|min:0|max:7',
        ]);

        $hospital->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data faskes berhasil diperbarui!',
            'data' => $hospital,
        ]);
    }

    // 5. DELETE: Hapus Rumah Sakit (hanya Dinkes)
    public function destroy($id)
    {
        // Only health_office users can delete hospitals
        if (Auth::check() && Auth::user()->role !== 'health_office') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Dinas Kesehatan yang dapat menghapus data faskes.',
            ], 403);
        }

        $hospital = Hospital::findOrFail($id);
        $hospital->delete();

        return response()->json([
            'success' => true,
            'message' => 'Faskes berhasil dihapus!',
        ]);
    }
}
