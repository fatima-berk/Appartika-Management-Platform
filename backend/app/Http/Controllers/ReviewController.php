<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Apartment;
use App\Models\Reservation;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Récupère les avis pour les appartements d'un propriétaire
     */
    public function getOwnerReviews($ownerId)
    {
        try {
            // Vérifier que le propriétaire existe
            $userExists = DB::table('users')->where('id', $ownerId)->exists();
            if (!$userExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Propriétaire non trouvé'
                ], 404);
            }

            // Récupérer tous les appartements du propriétaire
            $apartments = Apartment::where('owner_id', $ownerId)->pluck('id');
            
            if ($apartments->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'count' => 0,
                    'message' => 'Aucun appartement trouvé pour ce propriétaire'
                ]);
            }
            
            // Récupérer les avis pour ces appartements
            $reviews = Review::with([
                    'user:id,name,email',
                    'apartment:id,title,city,owner_id'
                ])
                ->whereIn('apartment_id', $apartments)
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $reviews,
                'count' => $reviews->count(),
                'message' => 'Avis récupérés avec succès'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des avis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les avis pour un appartement spécifique
     */
    /* public function getApartmentReviews($apartmentId)
    {
        try {
            // Vérifier que l'appartement existe
            $apartment = Apartment::find($apartmentId);
            if (!$apartment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appartement non trouvé'
                ], 404);
            }
            
            // Récupérer les avis avec les informations utilisateur
            $reviews = Review::with(['user:id,name,email'])
                ->where('apartment_id', $apartmentId)
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Calculer les statistiques
            $averageRating = $reviews->avg('rating');
            $totalReviews = $reviews->count();
            
            return response()->json([
                'success' => true,
                'data' => $reviews,
                'average_rating' => round($averageRating, 1),
                'total_reviews' => $totalReviews,
                'message' => 'Avis récupérés avec succès'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des avis: ' . $e->getMessage()
            ], 500);
        }
    }
 */



public function getApartmentReviews($apartmentId)
{
    try {
        \Log::info('🔍 Récupération des avis pour appartement ID: ' . $apartmentId);
        
        // Vérifier que l'appartement existe
        $apartment = Apartment::find($apartmentId);
        if (!$apartment) {
            \Log::warning('Appartement non trouvé: ' . $apartmentId);
            return response()->json([
                'success' => false,
                'message' => 'Appartement non trouvé'
            ], 404);
        }
        
        // Récupérer les avis avec les informations utilisateur
        $reviews = Review::with(['user:id,name,email', 'apartment:id,title'])
            ->where('apartment_id', $apartmentId)
            ->orderBy('created_at', 'desc')
            ->get();
        
        \Log::info('✅ Nombre d\'avis trouvés: ' . $reviews->count());
        
        // Calculer les statistiques
        $averageRating = $reviews->avg('rating');
        $totalReviews = $reviews->count();
        
        return response()->json([
            'success' => true,
            'data' => $reviews,
            'average_rating' => round($averageRating, 1),
            'total_reviews' => $totalReviews,
            'message' => 'Avis récupérés avec succès'
        ]);
        
    } catch (\Exception $e) {
        \Log::error('❌ Erreur récupération avis: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des avis: ' . $e->getMessage()
        ], 500);
    }
}    /**
     * Crée un nouvel avis
     */
    public function store(Request $request)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être connecté pour laisser un avis'
                ], 401);
            }

            $validated = $request->validate([
                'apartment_id' => 'required|exists:apartments,id',
                'reservation_id' => 'nullable|exists:reservations,id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|min:10|max:1000'
            ]);

            // Vérifier si l'utilisateur a déjà laissé un avis pour cet appartement
            $existingReview = Review::where('user_id', $user->id)
                ->where('apartment_id', $validated['apartment_id'])
                ->first();

            if ($existingReview) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà laissé un avis pour cet appartement'
                ], 422);
            }

            // Créer l'avis
            $review = Review::create([
                'user_id' => $user->id,
                'apartment_id' => $validated['apartment_id'],
                'reservation_id' => $validated['reservation_id'] ?? null,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
                'status' => 'published'
            ]);

            // Charger les relations pour la réponse
            $review->load(['user:id,name,email', 'apartment:id,title']);

            return response()->json([
                'success' => true,
                'message' => 'Votre avis a été publié avec succès',
                'data' => $review
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'avis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Met à jour un avis existant
     */
    public function update(Request $request, $id)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $review = Review::find($id);
            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Avis non trouvé'
                ], 404);
            }

            // Vérifier les permissions
            if ($review->user_id != $user->id && $user->role != 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à modifier cet avis'
                ], 403);
            }

            $validated = $request->validate([
                'rating' => 'sometimes|integer|min:1|max:5',
                'comment' => 'sometimes|string|min:10|max:1000',
                'status' => 'sometimes|in:pending,published,hidden'
            ]);

            $review->update($validated);
            $review->load(['user:id,name,email', 'apartment:id,title']);

            return response()->json([
                'success' => true,
                'message' => 'Avis mis à jour avec succès',
                'data' => $review
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'avis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime un avis
     */
    public function destroy($id)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $review = Review::find($id);
            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Avis non trouvé'
                ], 404);
            }

            // Vérifier les permissions
            if ($review->user_id != $user->id && $user->role != 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à supprimer cet avis'
                ], 403);
            }

            $review->delete();

            return response()->json([
                'success' => true,
                'message' => 'Avis supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'avis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les avis d'un utilisateur
     */
    public function getUserReviews($userId)
    {
        try {
            // Vérifier que l'utilisateur existe
            $userExists = DB::table('users')->where('id', $userId)->exists();
            if (!$userExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }
            
            $reviews = Review::with([
                    'apartment:id,title,city',
                    'apartment.images:id,apartment_id,image_url'
                ])
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $reviews,
                'count' => $reviews->count(),
                'message' => 'Avis récupérés avec succès'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des avis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifie si l'utilisateur peut laisser un avis pour une réservation
     */
    public function canUserReview($reservationId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être connecté'
                ], 401);
            }

            $reservation = Reservation::with('apartment')->find($reservationId);
            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation non trouvée'
                ], 404);
            }

            // Vérifier que la réservation appartient à l'utilisateur
            if ($reservation->user_id != $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette réservation ne vous appartient pas'
                ], 403);
            }

            // NOUVELLE LOGIQUE :
            // Le client peut laisser un avis dans tous les cas s'il le souhaite,
            // la seule limite est de ne pas dupliquer les avis pour le même appartement.

            $existingReview = Review::where('user_id', $user->id)
                ->where('apartment_id', $reservation->apartment_id)
                ->first();
                
            if ($existingReview) {
                return response()->json([
                    'success' => true,
                    'can_review' => false,
                    'canReview' => false,
                    'message' => 'Vous avez déjà laissé un avis pour cet appartement'
                ]);
            }

            return response()->json([
                'success' => true,
                'can_review' => true,
                'canReview' => true,
                'message' => 'Vous pouvez laisser un avis',
                'reservation' => [
                    'id' => $reservation->id,
                    'apartment_id' => $reservation->apartment_id,
                    'apartment_title' => $reservation->apartment->title ?? 'Appartement'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crée une réponse à un avis (pour le propriétaire)
     */
    public function createResponse(Request $request, $reviewId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $review = Review::with('apartment')->find($reviewId);
            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Avis non trouvé'
                ], 404);
            }

            // Vérifier que l'utilisateur est le propriétaire de l'appartement
            if ($review->apartment->owner_id != $user->id && $user->role != 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à répondre à cet avis'
                ], 403);
            }

            $validated = $request->validate([
                'response' => 'required|string|min:5|max:500'
            ]);

            $review->update([
                'response' => $validated['response'],
                'responded_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Réponse ajoutée avec succès',
                'data' => $review
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout de la réponse: ' . $e->getMessage()
            ], 500);
        }
    }
}