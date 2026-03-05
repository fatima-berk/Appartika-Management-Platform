<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            Log::info('🔐 Tentative d\'inscription:', $request->all());

            // Validation des données
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'password_confirmation' => 'required|string|same:password',
                'role' => 'required|in:owner,client'
            ]);
 if ($request->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'La création de compte administrateur n\'est pas autorisée via l\'inscription.'
            ], 403);
        }
            Log::info('✅ Validation réussie');

            // Création de l'utilisateur
            $user = User::create([
                'name' => trim($validated['name']),
                'email' => strtolower(trim($validated['email'])),
                'password' => Hash::make($validated['password']),
                'role' => $validated['role']
            ]);

            Log::info('✅ Utilisateur créé avec ID: ' . $user->id);

            // Création du token
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('✅ Token créé pour l\'utilisateur');

            return response()->json([
                'success' => true,
                'message' => 'Inscription réussie',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                ],
                'token' => $token
            ], 201);

        } catch (ValidationException $e) {
            Log::error('❌ Erreur de validation inscription:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation des données',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('💥 Erreur critique inscription:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur lors de l\'inscription',
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur interne du serveur'
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            Log::info('🔐 Tentative de connexion:', $request->all());

            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
                'role' => 'required|in:admin,owner,client'
            ]);

            Log::info('✅ Validation connexion réussie');

            // Recherche de l'utilisateur
            $user = User::where('email', strtolower(trim($validated['email'])))->first();

            if (!$user) {
                Log::warning('❌ Utilisateur non trouvé: ' . $validated['email']);
                throw ValidationException::withMessages([
                    'email' => ['Aucun compte trouvé avec cet email.'],
                ]);
            }

            // Vérification du mot de passe
            if (!Hash::check($validated['password'], $user->password)) {
                Log::warning('❌ Mot de passe incorrect pour: ' . $validated['email']);
                throw ValidationException::withMessages([
                    'password' => ['Le mot de passe est incorrect.'],
                ]);
            }

            // Vérification du rôle
            if ($user->role !== $validated['role']) {
                Log::warning('❌ Rôle incorrect pour: ' . $validated['email'] . ' - Attendu: ' . $validated['role'] . ', Trouvé: ' . $user->role);
                throw ValidationException::withMessages([
                    'role' => ['Ce compte n\'a pas le rôle sélectionné.'],
                ]);
            }

            // Régénération du token
            $user->tokens()->delete(); // Supprime les anciens tokens
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('✅ Connexion réussie pour: ' . $user->email);

            return response()->json([
                'success' => true,
                'message' => 'Connexion réussie',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                ],
                'token' => $token
            ]);

        } catch (ValidationException $e) {
            Log::error('❌ Erreur validation connexion:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Erreur d\'authentification',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('💥 Erreur critique connexion:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur lors de la connexion',
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur interne du serveur'
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user) {
                // Suppression de tous les tokens de l'utilisateur
                $user->tokens()->delete();
                Log::info('✅ Déconnexion réussie pour: ' . $user->email);
            }

            return response()->json([
                'success' => true,
                'message' => 'Déconnexion réussie'
            ]);

        } catch (\Exception $e) {
            Log::error('💥 Erreur déconnexion:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la déconnexion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function user(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('💥 Erreur récupération utilisateur:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifie si l'email existe déjà
     */
    public function checkEmail(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email'
            ]);

            $exists = User::where('email', strtolower(trim($request->email)))->exists();

            return response()->json([
                'success' => true,
                'exists' => $exists,
                'message' => $exists ? 'Email déjà utilisé' : 'Email disponible'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification de l\'email',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Route de test de l'API
     */
    public function test()
    {
        try {
            // Test de connexion à la base de données
            DB::connection()->getPdo();
            $dbStatus = 'Connected';
            $dbName = DB::connection()->getDatabaseName();
        } catch (\Exception $e) {
            $dbStatus = 'Error: ' . $e->getMessage();
            $dbName = 'Unknown';
        }

        return response()->json([
            'message' => 'API Laravel est opérationnelle! 🚀',
            'timestamp' => now()->toDateTimeString(),
            'timezone' => config('app.timezone'),
            'environment' => config('app.env'),
            'database' => [
                'status' => $dbStatus,
                'name' => $dbName
            ],
            'services' => [
                'sanctum' => 'Active',
                'cors' => 'Configured'
            ]
        ]);
    }
    // Ajoutez ces méthodes dans AuthController.php

/**
 * Récupérer le profil utilisateur
 */
public function getUserProfile($id)
{
    try {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('💥 Erreur récupération profil:', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération du profil',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Mettre à jour le profil utilisateur
 */
public function updateProfile(Request $request, $id)
{
    try {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Vérifier que l'utilisateur ne modifie que son propre profil
        if ($request->user()->id != $id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à modifier ce profil'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'sometimes|string|max:20|nullable',
            'address' => 'sometimes|string|max:500|nullable'
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ]
        ]);

    } catch (ValidationException $e) {
        Log::error('❌ Erreur validation mise à jour profil:', $e->errors());
        return response()->json([
            'success' => false,
            'message' => 'Erreur de validation des données',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        Log::error('💥 Erreur mise à jour profil:', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour du profil',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Changer le mot de passe
 */
public function changePassword(Request $request, $id)
{
    try {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Vérifier que l'utilisateur ne modifie que son propre mot de passe
        if ($request->user()->id != $id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à modifier ce mot de passe'
            ], 403);
        }

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
            'new_password_confirmation' => 'required|string'
        ]);

        // Vérifier le mot de passe actuel
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Le mot de passe actuel est incorrect'
            ], 422);
        }

        // Mettre à jour le mot de passe
        $user->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe changé avec succès'
        ]);

    } catch (ValidationException $e) {
        Log::error('❌ Erreur validation changement mot de passe:', $e->errors());
        return response()->json([
            'success' => false,
            'message' => 'Erreur de validation des données',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        Log::error('💥 Erreur changement mot de passe:', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors du changement de mot de passe',
            'error' => $e->getMessage()
        ], 500);
    }
}
}