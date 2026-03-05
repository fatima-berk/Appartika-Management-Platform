<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Apartment;
use App\Models\Reservation;
use App\Models\Payment;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Récupère les statistiques globales pour le dashboard admin
     */
    public function getStats()
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'total_owners' => User::where('role', 'owner')->count(),
                'total_clients' => User::where('role', 'client')->count(),
                'total_apartments' => Apartment::count(),
                'available_apartments' => Apartment::where('available', true)->count(),
                'total_reservations' => Reservation::count(),
                'pending_reservations' => Reservation::where('status', 'pending')->count(),
                'accepted_reservations' => Reservation::where('status', 'accepted')->count(),
                'total_revenue' => Payment::where('status', 'paid')->sum('amount'),
                'pending_payments' => Payment::where('status', 'pending')->sum('amount'),
                'total_payments' => Payment::count(),
                'paid_payments' => Payment::where('status', 'paid')->count(),
                'total_reviews' => Review::count(),
                'average_rating' => Review::avg('rating') ? round(Review::avg('rating'), 2) : 0,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur récupération stats admin:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère tous les utilisateurs avec pagination
     */
    public function getUsers(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search', '');
            $role = $request->get('role', '');

            $query = User::query();

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($role) {
                $query->where('role', $role);
            }

            $users = $query->orderBy('created_at', 'desc')
                          ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur récupération utilisateurs:', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère un utilisateur spécifique
     */
    public function getUser($id)
    {
        try {
            $user = User::with(['ownedApartments', 'reservations'])->find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crée un nouvel utilisateur
     */
    public function createUser(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'role' => 'required|in:admin,owner,client',
                'phone' => 'nullable|string|max:255'
            ]);

            $user = User::create([
                'name' => trim($validated['name']),
                'email' => strtolower(trim($validated['email'])),
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'phone' => $validated['phone'] ?? null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès',
                'data' => $user
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
                'message' => 'Erreur lors de la création de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Met à jour un utilisateur
     */
    public function updateUser(Request $request, $id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $id,
                'password' => 'sometimes|string|min:6',
                'role' => 'sometimes|in:admin,owner,client',
                'phone' => 'nullable|string|max:255'
            ]);

            if (isset($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'data' => $user->fresh()
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
                'message' => 'Erreur lors de la mise à jour de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime un utilisateur
     */
    public function deleteUser($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Empêcher la suppression de l'admin actuel
            if ($user->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas supprimer votre propre compte'
                ], 403);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère tous les appartements avec pagination
     */
    public function getApartments(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search', '');
            $city = $request->get('city', '');
            $available = $request->get('available', '');

            $query = Apartment::with(['owner', 'images']);

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('address', 'like', "%{$search}%");
                });
            }

            if ($city) {
                $query->where('city', 'like', "%{$city}%");
            }

            if ($available !== '') {
                $query->where('available', $available === 'true' || $available === '1');
            }

            $apartments = $query->orderBy('created_at', 'desc')
                               ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $apartments->items(),
                'pagination' => [
                    'current_page' => $apartments->currentPage(),
                    'last_page' => $apartments->lastPage(),
                    'per_page' => $apartments->perPage(),
                    'total' => $apartments->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des appartements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Met à jour un appartement
     */
    public function updateApartment(Request $request, $id)
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
                'description' => 'sometimes|string',
                'address' => 'sometimes|string|max:255',
                'city' => 'sometimes|string|max:100',
                'price_per_month' => 'sometimes|numeric|min:0',
                'price_per_day' => 'sometimes|numeric|min:0',
                'surface' => 'sometimes|integer|min:0',
                'rooms' => 'sometimes|integer|min:0',
                'available' => 'sometimes|boolean'
            ]);

            $apartment->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Appartement mis à jour avec succès',
                'data' => $apartment->fresh()->load(['owner', 'images'])
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

    /**
     * Supprime un appartement
     */
    public function deleteApartment($id)
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

    /**
     * Récupère toutes les réservations avec pagination
     */
    public function getReservations(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $status = $request->get('status', '');
            $search = $request->get('search', '');

            $query = Reservation::with(['user', 'apartment.owner', 'apartment.images']);

            if ($status) {
                $query->where('status', $status);
            }

            if ($search) {
                $query->whereHas('user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('apartment', function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%");
                });
            }

            $reservations = $query->orderBy('created_at', 'desc')
                                 ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $reservations->items(),
                'pagination' => [
                    'current_page' => $reservations->currentPage(),
                    'last_page' => $reservations->lastPage(),
                    'per_page' => $reservations->perPage(),
                    'total' => $reservations->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des réservations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Met à jour une réservation
     */
    public function updateReservation(Request $request, $id)
    {
        try {
            $reservation = Reservation::find($id);

            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation non trouvée'
                ], 404);
            }

            $validated = $request->validate([
                'status' => 'sometimes|in:pending,accepted,rejected,cancelled',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after:start_date',
                'total_price' => 'sometimes|numeric|min:0'
            ]);

            $reservation->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Réservation mise à jour avec succès',
                'data' => $reservation->fresh()->load(['user', 'apartment.owner'])
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
                'message' => 'Erreur lors de la mise à jour de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime une réservation
     */
    public function deleteReservation($id)
    {
        try {
            $reservation = Reservation::find($id);

            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation non trouvée'
                ], 404);
            }

            $reservation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Réservation supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère tous les paiements avec pagination
     */
    public function getPayments(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $status = $request->get('status', '');
            $method = $request->get('method', '');
            $search = $request->get('search', '');

            $query = Payment::with(['reservation.user', 'reservation.apartment.owner', 'user']);

            if ($status) {
                $query->where('status', $status);
            }

            if ($method) {
                $query->where('method', $method);
            }

            if ($search) {
                $query->whereHas('user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('reservation.apartment', function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%");
                });
            }

            $payments = $query->orderBy('created_at', 'desc')
                             ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $payments->items(),
                'pagination' => [
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des paiements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Met à jour un paiement
     */
    public function updatePayment(Request $request, $id)
    {
        try {
            $payment = Payment::find($id);

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement non trouvé'
                ], 404);
            }

            $validated = $request->validate([
                'status' => 'sometimes|in:paid,pending,failed',
                'method' => 'sometimes|in:cash,card,transfer',
                'amount' => 'sometimes|numeric|min:0'
            ]);

            $payment->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Paiement mis à jour avec succès',
                'data' => $payment->fresh()->load(['reservation.user', 'reservation.apartment', 'user'])
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
                'message' => 'Erreur lors de la mise à jour du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime un paiement
     */
    public function deletePayment($id)
    {
        try {
            $payment = Payment::find($id);

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement non trouvé'
                ], 404);
            }

            $payment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Paiement supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère tous les avis avec pagination
     */
    public function getReviews(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $rating = $request->get('rating', '');
            $search = $request->get('search', '');

            $query = Review::with(['user', 'apartment.owner']);

            if ($rating) {
                $query->where('rating', $rating);
            }

            if ($search) {
                $query->whereHas('user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('apartment', function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%");
                })->orWhere('comment', 'like', "%{$search}%");
            }

            $reviews = $query->orderBy('created_at', 'desc')
                            ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $reviews->items(),
                'pagination' => [
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                    'per_page' => $reviews->perPage(),
                    'total' => $reviews->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Met à jour un avis
     */
    public function updateReview(Request $request, $id)
    {
        try {
            $review = Review::find($id);

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Avis non trouvé'
                ], 404);
            }

            $validated = $request->validate([
                'rating' => 'sometimes|integer|min:1|max:5',
                'comment' => 'sometimes|string|nullable'
            ]);

            $review->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Avis mis à jour avec succès',
                'data' => $review->fresh()->load(['user', 'apartment'])
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
                'message' => 'Erreur lors de la mise à jour de l\'avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime un avis
     */
    public function deleteReview($id)
    {
        try {
            $review = Review::find($id);

            if (!$review) {
                return response()->json([
                    'success' => false,
                    'message' => 'Avis non trouvé'
                ], 404);
            }

            $review->delete();

            return response()->json([
                'success' => true,
                'message' => 'Avis supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

