<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Apartment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index()
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            Log::info('Récupération des paiements pour:', ['user_id' => $user->id, 'role' => $user->role]);

            $payments = [];

            if ($user->isOwner()) {
                $payments = Payment::with(['reservation.apartment.images', 'reservation.user'])
                    ->whereHas('reservation.apartment', function($query) use ($user) {
                        $query->where('owner_id', $user->id);
                    })
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                $payments = Payment::with(['reservation.apartment.images', 'reservation.user'])
                    ->whereHas('reservation', function($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->orderBy('created_at', 'desc')
                    ->get();
            }

            return response()->json([
                'success' => true,
                'data' => $payments,
                'count' => $payments->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération paiements:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des paiements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getByUser($userId)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            Log::info('getByUser appelé:', [
                'auth_user_id' => $user->id,
                'requested_user_id' => $userId,
                'role' => $user->role
            ]);

            if ($user->isOwner()) {
                $payments = Payment::with(['reservation.apartment.images', 'reservation.user'])
                    ->whereHas('reservation.apartment', function($query) use ($user) {
                        $query->where('owner_id', $user->id);
                    })
                    ->orderBy('created_at', 'desc')
                    ->get();
                    
                return response()->json([
                    'success' => true,
                    'data' => $payments
                ]);
            }
            
            if ($user->id != $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $payments = Payment::with(['reservation.apartment.images', 'reservation.user'])
                ->whereHas('reservation', function($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $payments
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur getByUser:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des paiements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getByOwner($ownerId)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            if ($user->id != $ownerId || !$user->isOwner()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $payments = Payment::with(['reservation.apartment.images', 'reservation.user'])
                ->whereHas('reservation.apartment', function($query) use ($ownerId) {
                    $query->where('owner_id', $ownerId);
                })
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $payments
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur getByOwner:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des paiements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $payment = Payment::with(['reservation.apartment.images', 'reservation.user'])->find($id);

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement non trouvé'
                ], 404);
            }

            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            if ($user->isTenant() && $payment->reservation->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            if ($user->isOwner() && $payment->reservation->apartment->owner_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $payment
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur show payment:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $validated = $request->validate([
                'reservation_id' => 'required|exists:reservations,id',
                'amount' => 'required|numeric|min:0.01',
                'method' => 'required|in:cash,card,transfer',
                'status' => 'sometimes|in:paid,pending,failed'
            ]);

            $reservation = Reservation::with('apartment')->find($validated['reservation_id']);
            
            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation non trouvée'
                ], 404);
            }

            if ($user->role === 'client' && $reservation->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Vérifier si un paiement existe déjà pour cette réservation
            $existingPayment = Payment::where('reservation_id', $validated['reservation_id'])->first();
            
            if ($existingPayment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Un paiement existe déjà pour cette réservation'
                ], 400);
            }

            // Calculer le montant dû
            $totalPrice = $reservation->total_price ? floatval($reservation->total_price) : 0;
            $amount = floatval($validated['amount']);
            
            if ($amount > $totalPrice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Le montant ne peut pas dépasser le prix total'
                ], 400);
            }

            $payment = Payment::create([
                'reservation_id' => $validated['reservation_id'],
                'amount' => $amount,
                'method' => $validated['method'],
                'status' => $validated['status'] ?? 'pending'
            ]);

            // Mettre à jour le statut de la réservation si le paiement est complété
            if (($validated['status'] ?? 'pending') === 'paid') {
                $reservation->update(['status' => 'accepted']);
            }

            $payment->load(['reservation.apartment.images', 'reservation.user']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paiement créé avec succès',
                'data' => $payment
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur création paiement:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $payment = Payment::with(['reservation.apartment'])->find($id);
            
            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement non trouvé'
                ], 404);
            }

            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $validated = $request->validate([
                'amount' => 'sometimes|numeric|min:0.01',
                'method' => 'sometimes|in:cash,card,transfer',
                'status' => 'sometimes|in:paid,pending,failed'
            ]);

            if ($user->isTenant() && $payment->reservation->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            if (isset($validated['status']) && $user->isTenant()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seul le propriétaire peut modifier le statut'
                ], 403);
            }

            // Mettre à jour le statut de la réservation si le paiement devient "paid"
            if (isset($validated['status']) && $validated['status'] === 'paid') {
                $payment->reservation->update(['status' => 'accepted']);
            }

            $payment->update($validated);
            $payment->load(['reservation.apartment.images', 'reservation.user']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paiement mis à jour avec succès',
                'data' => $payment
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur mise à jour paiement:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $payment = Payment::find($id);
            
            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement non trouvé'
                ], 404);
            }

            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Vérifier les permissions
            if ($user->isTenant() && $payment->reservation->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            if ($user->isOwner() && $payment->reservation->apartment->owner_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $payment->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paiement supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur suppression paiement:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}