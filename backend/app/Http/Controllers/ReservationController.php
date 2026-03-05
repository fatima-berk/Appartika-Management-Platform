<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Apartment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReservationController extends Controller
{
    public function index()
    {
        try {
            $user = auth()->user();
            $reservations = [];

            if ($user->role === 'owner') {
                $reservations = Reservation::with(['apartment.images', 'user'])
                    ->whereHas('apartment', function($query) use ($user) {
                        $query->where('owner_id', $user->id);
                    })
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                $reservations = Reservation::with(['apartment.images', 'user'])
                    ->where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->get();
            }

            return response()->json([
                'success' => true,
                'data' => $reservations
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des réservations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'apartment_id' => 'required|exists:apartments,id',
                'start_date' => 'required|date|after:today',
                'end_date' => 'required|date|after:start_date',
            ]);

            $apartment = Apartment::findOrFail($validated['apartment_id']);

            // Vérifier que l'appartement est disponible
            if (!$apartment->available) {
                throw ValidationException::withMessages([
                    'apartment_id' => ['Cet appartement n\'est pas disponible pour le moment.'],
                ]);
            }

            // Vérifier les conflits de dates
            $existingReservation = Reservation::where('apartment_id', $validated['apartment_id'])
                ->where('status', 'accepted')
                ->where(function($query) use ($validated) {
                    $query->whereBetween('start_date', [$validated['start_date'], $validated['end_date']])
                          ->orWhereBetween('end_date', [$validated['start_date'], $validated['end_date']])
                          ->orWhere(function($q) use ($validated) {
                              $q->where('start_date', '<=', $validated['start_date'])
                                ->where('end_date', '>=', $validated['end_date']);
                          });
                })
                ->exists();

            if ($existingReservation) {
                throw ValidationException::withMessages([
                    'dates' => ['L\'appartement n\'est pas disponible pour ces dates.'],
                ]);
            }

            // Calculer le prix total
            $start = new \DateTime($validated['start_date']);
            $end = new \DateTime($validated['end_date']);
            $days = $start->diff($end)->days;
            $totalPrice = $apartment->price_per_month / 30 * $days;

            $reservation = Reservation::create([
                'user_id' => auth()->id(),
                'apartment_id' => $validated['apartment_id'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'total_price' => $totalPrice,
                'status' => 'pending'
            ]);

            $reservation->load(['apartment.images', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Réservation créée avec succès',
                'data' => $reservation
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
                'message' => 'Erreur lors de la création de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $reservation = Reservation::with(['apartment.images', 'user'])->findOrFail($id);

            $user = auth()->user();
            if ($user->role === 'tenant' && $reservation->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            if ($user->role === 'owner' && $reservation->apartment->owner_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $reservation
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation non trouvée',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $reservation = Reservation::with(['apartment'])->findOrFail($id);
            $user = auth()->user();

            if ($user->role === 'tenant' && $reservation->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $validated = $request->validate([
                'start_date' => 'sometimes|date|after:today',
                'end_date' => 'sometimes|date|after:start_date',
                'status' => 'sometimes|in:pending,accepted,rejected,cancelled'
            ]);

            if (isset($validated['status']) && $user->role !== 'owner') {
                return response()->json([
                    'success' => false,
                    'message' => 'Seul le propriétaire peut modifier le statut'
                ], 403);
            }

            if (isset($validated['status']) && $validated['status'] === 'cancelled' && $user->role === 'tenant') {
                if ($reservation->status !== 'pending') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous ne pouvez annuler que les réservations en attente'
                    ], 403);
                }
            }

            $reservation->update($validated);
            $reservation->load(['apartment.images', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Réservation mise à jour avec succès',
                'data' => $reservation
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
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $reservation = Reservation::findOrFail($id);
            $user = auth()->user();

            if ($user->role === 'tenant' && $reservation->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            if ($user->role === 'owner' && $reservation->apartment->owner_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $reservation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Réservation supprimée avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getByTenant($tenantId)
    {
        try {
            $user = auth()->user();

            if ($user->id != $tenantId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $reservations = Reservation::with(['apartment.images', 'user'])
                ->where('user_id', $tenantId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reservations
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des réservations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

   // Dans ReservationController.php - Modifiez la méthode getByOwner
public function getByOwner($ownerId)
{
    try {
        $user = auth()->user();

        if ($user->id != $ownerId) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        // Charger TOUTES les relations nécessaires
        $reservations = Reservation::with([
            'apartment.images', // Charger les images de l'appartement
            'apartment.owner',
            'user'
        ])
        ->whereHas('apartment', function($query) use ($ownerId) {
            $query->where('owner_id', $ownerId);
        })
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $reservations
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des réservations',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function updateStatus(Request $request, $id)
    {
        try {
            $reservation = Reservation::with(['apartment'])->findOrFail($id);
            $user = auth()->user();

            if ($reservation->apartment->owner_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seul le propriétaire peut modifier le statut'
                ], 403);
            }

            $validated = $request->validate([
                'status' => 'required|in:pending,accepted,rejected,cancelled'
            ]);

            $reservation->update(['status' => $validated['status']]);
            $reservation->load(['apartment.images', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Statut mis à jour avec succès',
                'data' => $reservation
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
                'message' => 'Erreur lors de la mise à jour du statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }
  public function getApartmentReservations($apartmentId)
{
    try {
        $apartment = Apartment::findOrFail($apartmentId);
        
        // Récupérer TOUTES les réservations pour cet appartement
        // Trier par date de début (les plus récentes d'abord)
        $reservations = Reservation::with(['user', 'apartment.images'])
            ->where('apartment_id', $apartmentId)
            ->orderBy('start_date', 'desc')
            ->get();
        
        // Séparer les réservations actives/futures des passées
        $activeReservations = $reservations->filter(function ($reservation) {
            return in_array($reservation->status, ['accepted', 'pending']) && 
                   $reservation->end_date >= now();
        });
        
        $pastReservations = $reservations->filter(function ($reservation) {
            return $reservation->status === 'accepted' && 
                   $reservation->end_date < now();
        });
        
        return response()->json([
            'success' => true,
            'data' => [
                'active' => $activeReservations->values(),
                'past' => $pastReservations->values(),
                'all' => $reservations
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
}