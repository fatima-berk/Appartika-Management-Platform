<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApartmentController extends Controller
{
    public function index(Request $request)
    {
        // Récupérer tous les appartements avec leurs images
        $query = Apartment::with('images');
        
        // Filtrer par disponibilité si demandé
        if ($request->has('available')) {
            $available = filter_var($request->available, FILTER_VALIDATE_BOOLEAN);
            $query->where('available', $available);
        }
        
        // Filtrer par ville si demandé
        if ($request->has('city') && $request->city) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }
        
        // Filtrer par prix maximum si demandé
        if ($request->has('max_price') && $request->max_price) {
            $query->where('price_per_month', '<=', $request->max_price);
        }
        
        $apartments = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $apartments,
            'count' => $apartments->count()
        ]);
    }

    public function getByOwner($ownerId)
    {
        try {
            // Vérifiez d'abord si l'utilisateur existe
            $userExists = DB::table('users')->where('id', $ownerId)->exists();
            
            if (!$userExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Récupérez tous les appartements de cet owner, avec les images
            $apartments = Apartment::with('images')
                ->where('owner_id', $ownerId)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $apartments,
                'count' => $apartments->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des appartements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $apartment = Apartment::with('images')->find($id);
            
            if (!$apartment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appartement non trouvé'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $apartment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'appartement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'owner_id' => 'required|exists:users,id',
                'title' => 'required|string|max:150',
                'description' => 'nullable|string',
                'address' => 'required|string|max:255',
                'city' => 'required|string|max:100',
                'price_per_month' => 'required|numeric|min:0',
                'price_per_day' => 'nullable|numeric|min:0',
                'surface' => 'required|integer|min:1',
                'rooms' => 'required|integer|min:1',
                'image' => 'nullable|url',
                'available' => 'nullable|boolean'
            ]);

            // Valeurs par défaut
            $validated['available'] = $validated['available'] ?? true;

            $apartment = Apartment::create($validated);

            // Rechargez l'appartement avec les relations
            $apartment = Apartment::with('images')->find($apartment->id);

            return response()->json([
                'success' => true,
                'message' => 'Appartement créé avec succès',
                'data' => $apartment
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'appartement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $apartment = Apartment::find($id);

            if (!$apartment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appartement non trouvé'
                ], 404);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:150',
                'description' => 'nullable|string',
                'address' => 'sometimes|string|max:255',
                'city' => 'sometimes|string|max:100',
                'price_per_month' => 'sometimes|numeric|min:0',
                'price_per_day' => 'nullable|numeric|min:0',
                'surface' => 'sometimes|integer|min:1',
                'rooms' => 'sometimes|integer|min:1',
                'image' => 'nullable|url',
                'available' => 'sometimes|boolean'
            ]);

            $apartment->update($validated);

            // Rechargez l'appartement avec les relations
            $apartment = Apartment::with('images')->find($apartment->id);

            return response()->json([
                'success' => true,
                'message' => 'Appartement mis à jour avec succès',
                'data' => $apartment
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'appartement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $apartment = Apartment::find($id);

            if (!$apartment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appartement non trouvé'
                ], 404);
            }

            $apartment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Appartement supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'appartement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}