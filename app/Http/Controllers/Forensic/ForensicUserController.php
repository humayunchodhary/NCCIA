<?php

namespace App\Http\Controllers\Forensic;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ForensicUserController extends Controller
{
    private function generateStrongPassword(): string
    {
        $upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lower = 'abcdefghijklmnopqrstuvwxyz';
        $digits = '0123456789';
        $special = '@$!%*#?&';
        $all = $upper . $lower . $digits . $special;
        $password = $upper[random_int(0, 25)]
            . $lower[random_int(0, 25)]
            . $digits[random_int(0, 9)]
            . $special[random_int(0, 7)];
        for ($i = 0; $i < 6; $i++) {
            $password .= $all[random_int(0, strlen($all) - 1)];
        }

        return str_shuffle($password);
    }

    private function forensicRoles(): array
    {
        return User::FORENSIC_ROLES;
    }

    public function index(Request $request)
    {
        $users = User::with('roles', 'permissions')
            ->whereHas('roles', fn ($q) => $q->whereIn('name', $this->forensicRoles()))
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    public function show(User $user)
    {
        $this->authorizeForensic($user);
        return response()->json($user->load('roles', 'permissions'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'required|email|unique:users,email',
            'password'         => ['nullable', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])/'],
            'generate_password'=> 'sometimes|boolean',
            'role'             => ['required', Rule::in($this->forensicRoles())],
            'designation'      => 'nullable|string|max:255',
        ], [
            'password.regex' => 'Password must include uppercase, lowercase, a number, and a special character (@$!%*#?&).',
        ]);

        $generated = !empty($data['generate_password']) || empty($data['password']);
        $password = $generated ? $this->generateStrongPassword() : $data['password'];

        $user = User::create([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'password'    => Hash::make($password),
            'designation' => $data['designation'] ?? null,
        ]);

        $user->assignRole($data['role']);

        $payload = [
            'message' => 'Forensic user created successfully',
            'user' => $user->load('roles', 'permissions'),
        ];

        // Credentials are shown only once so the admin can hand them to the user
        if ($generated) {
            $payload['credentials'] = [
                'email'    => $user->email,
                'password' => $password,
            ];
        }

        return response()->json($payload, 201);
    }

    public function update(Request $request, User $user)
    {
        $this->authorizeForensic($user);

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password'    => ['nullable', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])/'],
            'role'        => ['required', Rule::in($this->forensicRoles())],
            'designation' => 'nullable|string|max:255',
        ]);

        $updateData = [
            'name'        => $data['name'],
            'email'       => $data['email'],
            'designation' => $data['designation'] ?? null,
        ];

        if (!empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);
        $user->syncRoles([$data['role']]);

        return response()->json([
            'message' => 'Forensic user updated successfully',
            'user' => $user->fresh()->load('roles', 'permissions'),
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 422);
        }

        $this->authorizeForensic($user);

        $user->delete();

        return response()->json(['message' => 'Forensic user deleted successfully']);
    }

    public function resetPassword(Request $request, User $user)
    {
        $this->authorizeForensic($user);

        $data = $request->validate([
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])/'],
        ], [
            'password.regex' => 'Password must include uppercase, lowercase, a number, and a special character (@$!%*#?&).',
        ]);

        $user->password = Hash::make($data['password']);
        $user->save();

        return response()->json(['message' => "Password reset successfully for {$user->name}"]);
    }

    public function generatePassword(Request $request, User $user)
    {
        $this->authorizeForensic($user);

        $password = $this->generateStrongPassword();
        $user->password = Hash::make($password);
        $user->save();

        return response()->json([
            'message' => "New credentials generated for {$user->name}",
            'credentials' => [
                'email'    => $user->email,
                'password' => $password,
            ],
        ]);
    }

    public function stats()
    {
        $roles = $this->forensicRoles();
        $users = User::whereHas('roles', fn ($q) => $q->whereIn('name', $roles));
        $total = (clone $users)->count();
        $byRole = [];

        foreach ($roles as $role) {
            $byRole[$role] = (clone $users)->whereHas('roles', fn ($q) => $q->where('name', $role))->count();
        }

        return response()->json([
            'total_users' => $total,
            'by_role'     => $byRole,
            'roles'       => $roles,
        ]);
    }

    private function authorizeForensic(User $user): void
    {
        if (!$user->isForensic()) {
            abort(404);
        }
    }

    public function rolesList()
    {
        return response()->json([
            'roles' => $this->forensicRoles(),
        ]);
    }
}
