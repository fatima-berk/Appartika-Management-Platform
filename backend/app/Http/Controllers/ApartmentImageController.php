<?php

namespace App\Http\Controllers;

use App\Models\ApartmentImage;
use App\Models\Apartment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ApartmentImageController extends Controller
{
    public function index($apartmentId)
    {
        try {
            Log::info('Récupération des images pour appartement:', ['apartment_id' => $apartmentId]);
            
            $apartment = Apartment::find($apartmentId);
            
            if (!$apartment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appartement non trouvé'
                ], 404);
            }

            // Vérifier que l'utilisateur peut voir les images
            $user = auth()->user();
            if (!$user || $user->id !== $apartment->owner_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $images = ApartmentImage::where('apartment_id', $apartmentId)->get();

            return response()->json([
                'success' => true,
                'data' => $images
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération images:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des images',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request, $apartmentId)
    {
        try {
            Log::info('Upload image pour appartement:', ['apartment_id' => $apartmentId]);
            
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120' // 5MB max
            ]);

            $apartment = Apartment::find($apartmentId);
            
            if (!$apartment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appartement non trouvé'
                ], 404);
            }

            // Vérifier que l'utilisateur est le propriétaire
            $user = auth()->user();
            if (!$user || $user->id !== $apartment->owner_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seul le propriétaire peut ajouter des images'
                ], 403);
            }

            // Stocker l'image
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                Log::info('Fichier reçu:', [
                    'name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime' => $file->getMimeType()
                ]);
                
                $path = $file->store('apartment-images', 'public');
                Log::info('Fichier stocké:', ['path' => $path]);
                
                $imageUrl = Storage::url($path);
                Log::info('URL générée:', ['url' => $imageUrl]);
                
                // Créer l'entrée dans la base de données
                $imageData = [
                    'apartment_id' => $apartmentId,
                    'image_url' => $imageUrl,
                ];
                
                // Ajouter file_path seulement si la colonne existe dans la table
                $columns = Schema::getColumnListing('apartment_images');
                if (in_array('file_path', $columns)) {
                    $imageData['file_path'] = $path;
                    Log::info('Colonne file_path trouvée, ajout du chemin');
                } else {
                    Log::warning('Colonne file_path non trouvée dans la table, utilisation sans file_path');
                }
                
                $image = ApartmentImage::create($imageData);

                Log::info('Image uploadée avec succès:', [
                    'image_id' => $image->id,
                    'apartment_id' => $apartmentId
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Image ajoutée avec succès',
                    'data' => $image
                ], 201);
            }

            return response()->json([
                'success' => false,
                'message' => 'Aucun fichier image fourni'
            ], 400);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur validation upload image:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur upload image:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout de l\'image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($imageId)
    {
        try {
            Log::info('Suppression image:', ['image_id' => $imageId]);
            
            $image = ApartmentImage::with('apartment')->find($imageId);
            
            if (!$image) {
                return response()->json([
                    'success' => false,
                    'message' => 'Image non trouvée'
                ], 404);
            }

            // Vérifier que l'utilisateur est le propriétaire
            $user = auth()->user();
            if (!$user || !$image->apartment || $user->id !== $image->apartment->owner_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seul le propriétaire peut supprimer des images'
                ], 403);
            }
        
            // Supprimer le fichier physique
            if (!empty($image->file_path)) {
                if (Storage::disk('public')->exists($image->file_path)) {
                    Storage::disk('public')->delete($image->file_path);
                }
            } elseif (!empty($image->image_url)) {
                // Fallback: essayer de supprimer via l'URL
                $path = str_replace('/storage/', '', $image->image_url);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }

            // Supprimer l'entrée de la base de données
            $image->delete();

            Log::info('Image supprimée avec succès:', ['image_id' => $imageId]);

            return response()->json([
                'success' => true,
                'message' => 'Image supprimée avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur suppression image:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}