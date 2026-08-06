<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles', 'permissions')->latest()->paginate(20);

        if (request()->expectsJson()) {
            return response()->json($users);
        }

        return view('users.index', compact('users'));
    }

    public function show(User $user)
    {
        $user->load('roles', 'permissions');
        return response()->json($user);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'password'   => ['required', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])/'],
            'role'       => 'required|string|exists:roles,name',
            'designation'=> 'nullable|string|max:255',
            'circle_id'  => 'nullable|exists:circles,id',
            'zone_id'    => 'nullable|exists:zones,id',
        ], [
            'password.regex' => 'Password must include uppercase, lowercase, a number, and a special character (@$!%*#?&).',
        ]);

        $user = User::create([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'password'    => Hash::make($data['password']),
            'designation' => $data['designation'] ?? null,
            'circle_id'   => $data['circle_id'] ?? null,
            'zone_id'     => $data['zone_id'] ?? null,
        ]);

        $user->assignRole($data['role']);

        return response()->json(['message' => 'User created successfully', 'user' => $user->load('roles', 'permissions')], 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password'   => ['nullable', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])/'],
            'role'       => 'required|string|exists:roles,name',
            'designation'=> 'nullable|string|max:255',
            'circle_id'  => 'nullable|exists:circles,id',
            'zone_id'    => 'nullable|exists:zones,id',
        ]);

        $updateData = [
            'name'        => $data['name'],
            'email'       => $data['email'],
            'designation' => $data['designation'] ?? null,
            'circle_id'   => $data['circle_id'] ?? null,
            'zone_id'     => $data['zone_id'] ?? null,
        ];

        if (!empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);
        $user->syncRoles([$data['role']]);

        return response()->json(['message' => 'User updated successfully', 'user' => $user->fresh()->load('roles', 'permissions')]);
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function grantPermission(Request $request, User $user)
    {
        try {
            $data = $request->validate([
                'permission' => 'required|string',
            ]);

            $permission = Permission::findByName($data['permission'], 'web');
            $user->givePermissionTo($permission);

            return response()->json([
                'message' => "Permission '{$data['permission']}' granted to {$user->name}",
                'user' => $user->fresh()->load('roles', 'permissions'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage(), 'line' => $e->getLine()], 500);
        }
    }

    public function revokePermission(Request $request, User $user)
    {
        try {
            $data = $request->validate([
                'permission' => 'required|string',
            ]);

            $permission = Permission::findByName($data['permission'], 'web');
            $user->revokePermissionTo($permission);

            return response()->json([
                'message' => "Permission '{$data['permission']}' revoked from {$user->name}",
                'user' => $user->fresh()->load('roles', 'permissions'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage(), 'line' => $e->getLine()], 500);
        }
    }

    public function resetPassword(Request $request, User $user)
    {
        $data = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user->password = Hash::make($data['password']);
        $user->save();

        return response()->json(['message' => "Password reset successfully for {$user->name}"]);
    }
}
