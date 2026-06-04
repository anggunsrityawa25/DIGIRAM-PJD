<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::with('hospital')
                    ->where('email', $request->email)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.',
            ], 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success'      => true,
            'message'      => 'Login berhasil!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $this->buildUserResponse($user),
        ]);
    }

    // Update profil pengguna — disimpan ke DB dan dikembalikan ke frontend
    public function updateProfile(Request $request)
    {
        $user = $request->user()->load('hospital');

        $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|unique:users,email,' . $user->id,
            'jabatan' => 'nullable|string|max:255',
            'no_telp' => 'nullable|string|max:20',
        ]);

        $user->update([
            'name'  => $request->name,
            'email' => $request->email,
        ]);

        // Reload relasi setelah update
        $user->refresh();
        $user->load('hospital');

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui!',
            'user'    => $this->buildUserResponse($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Berhasil logout.']);
    }

    // Helper: bangun array user yang konsisten (dipakai login & updateProfile)
    private function buildUserResponse(User $user): array
    {
        return [
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'role'         => $user->role,
            'hospital_id'  => $user->hospital_id,
            'hospital'     => $user->hospital?->name,
            'hospital_data' => $user->hospital ? [
                'id'                   => $user->hospital->id,
                'name'                 => $user->hospital->name,
                'address'              => $user->hospital->address,
                'city'                 => $user->hospital->city,
                'province'             => $user->hospital->province,
                'type'                 => $user->hospital->type,
                'bed_capacity'         => $user->hospital->bed_capacity,
                'current_emram_stage'  => (int) ($user->hospital->current_emram_stage ?? 0),
                'last_assessment_date' => $user->hospital->last_assessment_date
                    ? $user->hospital->last_assessment_date->format('d/m/Y')
                    : null,
            ] : null,
        ];
    }
}
