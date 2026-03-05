<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Reservation;
use App\Models\Apartment;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TenantController extends Controller
{
    /**
     * Get all tenants for a specific owner - VERSION CORRIGÉE
     */
    public function getOwnerTenants($ownerId)
    {
        try {
            // Vérifier que l'utilisateur connecté est bien le propriétaire
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            if ($user->id != $ownerId && $user->role != 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé à accéder à ces données'
                ], 403);
            }

            // REQUÊTE SQL CORRIGÉE - Récupère TOUS les locataires (tous les statuts de réservation)
            $tenants = DB::select("
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.phone,
                    u.role,
                    r.id as reservation_id,  -- CRITIQUE: Inclure l'ID de réservation
                    a.id as apartment_id,
                    a.title as apartment_title,
                    a.address,
                    a.city,
                    a.price_per_month as rent,
                    r.start_date,
                    r.end_date,
                    r.total_price,
                    r.status as reservation_status,
                    r.created_at as reservation_date,
                    p.amount as last_payment_amount,
                    p.status as payment_status,
                    p.method as payment_method,
                    p.created_at as payment_date,
                    CASE 
                        WHEN r.status = 'accepted' AND (r.end_date IS NULL OR r.end_date > CURDATE()) THEN 'active'
                        WHEN r.status = 'pending' THEN 'pending' 
                        WHEN r.status = 'cancelled' OR r.status = 'rejected' THEN 'inactive'
                        WHEN r.end_date IS NOT NULL AND r.end_date < CURDATE() THEN 'inactive'
                        ELSE 'active'
                    END as tenant_status
                FROM reservations r
                INNER JOIN users u ON r.user_id = u.id
                INNER JOIN apartments a ON r.apartment_id = a.id
                LEFT JOIN (
                    SELECT p1.* 
                    FROM payments p1
                    INNER JOIN (
                        SELECT reservation_id, MAX(created_at) as max_date
                        FROM payments 
                        GROUP BY reservation_id
                    ) p2 ON p1.reservation_id = p2.reservation_id AND p1.created_at = p2.max_date
                ) p ON p.reservation_id = r.id
                WHERE a.owner_id = ? 
                    AND u.role = 'client'
                    -- SUPPRIMÉ: AND r.status IN ('accepted', 'pending') pour récupérer TOUS les locataires
                ORDER BY 
                    CASE 
                        WHEN r.status = 'accepted' AND (r.end_date IS NULL OR r.end_date > CURDATE()) THEN 1
                        WHEN r.status = 'pending' THEN 2
                        WHEN r.status = 'cancelled' OR r.status = 'rejected' THEN 3
                        ELSE 4
                    END,
                    r.start_date DESC
            ", [$ownerId]);

            return response()->json([
                'success' => true,
                'data' => $tenants,
                'count' => count($tenants),
                'message' => count($tenants) . ' locataire(s) trouvé(s)'
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur getOwnerTenants: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des locataires',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get tenant statistics for dashboard - VERSION CORRIGÉE
     */
    public function getTenantStats($ownerId)
    {
        try {
            // Vérifier l'autorisation
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            if ($user->id != $ownerId && $user->role != 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé'
                ], 403);
            }

            $stats = DB::select("
                SELECT 
                    COUNT(DISTINCT CASE WHEN r.status IN ('accepted', 'pending') THEN u.id END) as total_tenants,
                    COUNT(DISTINCT CASE WHEN r.status = 'accepted' AND (r.end_date IS NULL OR r.end_date > CURDATE()) THEN u.id END) as active_tenants,
                    COUNT(DISTINCT CASE WHEN r.status = 'pending' THEN u.id END) as pending_tenants,
                    COUNT(DISTINCT CASE WHEN r.status = 'cancelled' OR (r.end_date IS NOT NULL AND r.end_date < CURDATE()) THEN u.id END) as inactive_tenants,
                    COALESCE(SUM(CASE WHEN r.status = 'accepted' AND (r.end_date IS NULL OR r.end_date > CURDATE()) THEN a.price_per_month ELSE 0 END), 0) as monthly_revenue
                FROM reservations r
                INNER JOIN users u ON r.user_id = u.id
                INNER JOIN apartments a ON r.apartment_id = a.id
                WHERE a.owner_id = ?
                    AND u.role = 'client'
            ", [$ownerId]);

            return response()->json([
                'success' => true,
                'data' => $stats[0] ?? (object)[
                    'total_tenants' => 0,
                    'active_tenants' => 0,
                    'pending_tenants' => 0,
                    'inactive_tenants' => 0,
                    'monthly_revenue' => 0
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur getTenantStats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get tenant details by ID - VERSION CORRIGÉE
     */
    public function getTenantDetails($tenantId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $tenant = DB::select("
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.phone,
                    u.role,
                    u.created_at as member_since,
                    r.id as reservation_id,
                    a.id as apartment_id,
                    a.title as apartment_title,
                    a.address,
                    a.city,
                    a.surface,
                    a.rooms,
                    a.price_per_month as rent,
                    r.start_date,
                    r.end_date,
                    r.total_price,
                    r.status as reservation_status,
                    p.amount as last_payment_amount,
                    p.status as payment_status,
                    p.method as payment_method,
                    p.created_at as last_payment_date
                FROM users u
                INNER JOIN reservations r ON u.id = r.user_id
                INNER JOIN apartments a ON r.apartment_id = a.id
                LEFT JOIN payments p ON p.reservation_id = r.id
                WHERE u.id = ?
                    AND u.role = 'client'
                ORDER BY p.created_at DESC
                LIMIT 1
            ", [$tenantId]);

            if (empty($tenant)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Locataire non trouvé'
                ], 404);
            }

            // Vérifier que l'utilisateur a le droit de voir ces données
            $apartment = Apartment::find($tenant[0]->apartment_id);
            if ($apartment->owner_id != $user->id && $user->role != 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé à voir ces données'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $tenant[0]
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur getTenantDetails: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des détails du locataire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment history for a tenant - VERSION CORRIGÉE
     */
    public function getTenantPaymentHistory($tenantId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $payments = DB::select("
                SELECT 
                    p.id,
                    p.amount,
                    p.method,
                    p.status,
                    p.created_at as payment_date,
                    a.title as apartment_title,
                    r.start_date,
                    r.end_date,
                    r.status as reservation_status
                FROM payments p
                INNER JOIN reservations r ON p.reservation_id = r.id
                INNER JOIN apartments a ON r.apartment_id = a.id
                WHERE r.user_id = ?
                ORDER BY p.created_at DESC
            ", [$tenantId]);

            // Vérifier les autorisations
            if (!empty($payments)) {
                $firstPayment = $payments[0];
                $apartment = Apartment::where('title', $firstPayment->apartment_title)->first();
                if ($apartment && $apartment->owner_id != $user->id && $user->role != 'admin') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Non autorisé à voir ces données'
                    ], 403);
                }
            }

            return response()->json([
                'success' => true,
                'data' => $payments
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur getTenantPaymentHistory: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'historique des paiements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update tenant information - VERSION CORRIGÉE
     */
    public function updateTenant(Request $request, $tenantId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Validation des données
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|max:255|unique:users,email,' . $tenantId,
                'phone' => 'sometimes|string|max:20'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tenant = User::find($tenantId);

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Locataire non trouvé'
                ], 404);
            }

            // Vérifier que l'utilisateur est un client
            if ($tenant->role !== 'client') {
                return response()->json([
                    'success' => false,
                    'message' => 'Seuls les clients peuvent être modifiés'
                ], 403);
            }

            // Vérifier que le propriétaire a le droit de modifier ce locataire
            $hasAccess = DB::table('reservations as r')
                ->join('apartments as a', 'r.apartment_id', '=', 'a.id')
                ->where('r.user_id', $tenantId)
                ->where('a.owner_id', $user->id)
                ->exists();

            if (!$hasAccess && $user->role != 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé à modifier ce locataire'
                ], 403);
            }

            // Mettre à jour seulement les champs fournis
            $updateData = $request->only(['name', 'email', 'phone']);
            $tenant->update(array_filter($updateData));

            return response()->json([
                'success' => true,
                'message' => 'Informations du locataire mises à jour avec succès',
                'data' => $tenant
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur updateTenant: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du locataire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Terminate tenant contract - VERSION CORRIGÉE
     */
    public function terminateContract($reservationId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $reservation = Reservation::find($reservationId);

            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation non trouvée'
                ], 404);
            }

            // Vérifier que l'utilisateur est le propriétaire de l'appartement
            $apartment = Apartment::find($reservation->apartment_id);
            
            if (!$apartment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Appartement non trouvé'
                ], 404);
            }

            if ($apartment->owner_id != $user->id && $user->role != 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé à résilier ce contrat'
                ], 403);
            }

            // Marquer la réservation comme annulée
            $reservation->update([
                'status' => 'cancelled',
                'end_date' => now()
            ]);

            // Marquer l'appartement comme disponible
            $apartment->update(['available' => 1]);

            // Récupérer les informations du locataire pour le message de confirmation
            $tenant = User::find($reservation->user_id);

            return response()->json([
                'success' => true,
                'message' => 'Contrat résilié avec succès pour ' . ($tenant->name ?? 'le locataire'),
                'data' => [
                    'reservation_id' => $reservation->id,
                    'tenant_name' => $tenant->name ?? 'Inconnu',
                    'apartment_title' => $apartment->title
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur terminateContract: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la résiliation du contrat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search tenants - NOUVELLE FONCTION POUR LA RECHERCHE
     */
    public function searchTenants(Request $request, $ownerId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            if ($user->id != $ownerId && $user->role != 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé'
                ], 403);
            }

            $searchTerm = $request->get('search', '');
            $statusFilter = $request->get('status', 'all');

            $query = "
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.phone,
                    r.id as reservation_id,
                    a.id as apartment_id,
                    a.title as apartment_title,
                    a.address,
                    a.city,
                    a.price_per_month as rent,
                    r.start_date,
                    r.end_date,
                    r.status as reservation_status,
                    p.status as payment_status,
                    CASE 
                        WHEN r.status = 'accepted' AND (r.end_date IS NULL OR r.end_date > CURDATE()) THEN 'active'
                        WHEN r.status = 'pending' THEN 'pending'
                        WHEN r.status = 'cancelled' OR r.status = 'rejected' THEN 'inactive'
                        WHEN r.end_date IS NOT NULL AND r.end_date < CURDATE() THEN 'inactive'
                        ELSE 'active'
                    END as tenant_status
                FROM reservations r
                INNER JOIN users u ON r.user_id = u.id
                INNER JOIN apartments a ON r.apartment_id = a.id
                LEFT JOIN payments p ON p.reservation_id = r.id
                WHERE a.owner_id = ? 
                    AND u.role = 'client'
                    -- SUPPRIMÉ: AND r.status IN ('accepted', 'pending') pour récupérer TOUS les locataires
            ";

            $params = [$ownerId];

            // Ajouter la recherche
            if (!empty($searchTerm)) {
                $query .= " AND (u.name LIKE ? OR u.email LIKE ? OR a.title LIKE ?)";
                $searchParam = "%{$searchTerm}%";
                array_push($params, $searchParam, $searchParam, $searchParam);
            }

            // Ajouter le filtre de statut
            if ($statusFilter !== 'all') {
                $query .= " AND (";
                if ($statusFilter === 'active') {
                    $query .= " (r.status = 'accepted' AND (r.end_date IS NULL OR r.end_date > CURDATE()))";
                } elseif ($statusFilter === 'pending') {
                    $query .= " r.status = 'pending'";
                } elseif ($statusFilter === 'inactive') {
                    $query .= " (r.status = 'cancelled' OR r.status = 'rejected' OR (r.end_date IS NOT NULL AND r.end_date < CURDATE()))";
                }
                $query .= ")";
            }

            $query .= " ORDER BY r.start_date DESC";

            $tenants = DB::select($query, $params);

            return response()->json([
                'success' => true,
                'data' => $tenants,
                'count' => count($tenants),
                'filters' => [
                    'search' => $searchTerm,
                    'status' => $statusFilter
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur searchTenants: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recherche des locataires',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}