<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // =========================================================================
    // RELATIONS - CORRIGÉES
    // =========================================================================

    /**
     * Appartements dont l'utilisateur est propriétaire
     */
    public function ownedApartments()
    {
        return $this->hasMany(Apartment::class, 'owner_id');
    }

    /**
     * Réservations faites par l'utilisateur (en tant que locataire)
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'user_id');
    }

    /**
     * Paiements effectués par l'utilisateur
     */
    public function payments()
    {
        return $this->hasMany(Payment::class, 'user_id');
    }

    /**
     * Réservations pour les appartements de l'utilisateur (en tant que propriétaire)
     */
    public function apartmentReservations()
    {
        return $this->hasManyThrough(
            Reservation::class,
            Apartment::class,
            'owner_id', // Clé étrangère sur apartments
            'apartment_id', // Clé étrangère sur reservations
            'id', // Clé locale sur users
            'id' // Clé locale sur apartments
        );
    }

    /**
     * Paiements pour les réservations des appartements de l'utilisateur
     */
    public function apartmentPayments()
    {
        return $this->hasManyThrough(
            Payment::class,
            Reservation::class,
            'user_id', // Clé étrangère sur reservations
            'reservation_id', // Clé étrangère sur payments
            'id', // Clé locale sur users
            'id' // Clé locale sur reservations
        );
    }

    // =========================================================================
    // MÉTHODES UTILITAIRES
    // =========================================================================

    /**
     * Vérifie si l'utilisateur est un propriétaire
     */
    public function isOwner()
    {
        return $this->role === 'owner';
    }

    /**
     * Vérifie si l'utilisateur est un locataire
     */
    public function isTenant()
    {
        return $this->role === 'tenant';
    }

    /**
     * Vérifie si l'utilisateur peut accéder à un appartement
     */
    public function canAccessApartment($apartmentId)
    {
        if ($this->isOwner()) {
            return $this->ownedApartments()->where('id', $apartmentId)->exists();
        }
        
        if ($this->isTenant()) {
            return $this->reservations()->where('apartment_id', $apartmentId)->exists();
        }
        
        return false;
    }

    /**
     * Vérifie si l'utilisateur peut accéder à une réservation
     */
    public function canAccessReservation($reservationId)
    {
        if ($this->isOwner()) {
            return $this->apartmentReservations()->where('reservations.id', $reservationId)->exists();
        }
        
        if ($this->isTenant()) {
            return $this->reservations()->where('id', $reservationId)->exists();
        }
        
        return false;
    }

    /**
     * Vérifie si l'utilisateur peut accéder à un paiement
     */
    public function canAccessPayment($paymentId)
    {
        if ($this->isOwner()) {
            return $this->apartmentPayments()->where('payments.id', $paymentId)->exists();
        }
        
        if ($this->isTenant()) {
            return $this->payments()->where('id', $paymentId)->exists();
        }
        
        return false;
    }

    /**
     * Récupère les statistiques de l'utilisateur
     */
    public function getStats()
    {
        if ($this->isOwner()) {
            return [
                'apartments_count' => $this->ownedApartments()->count(),
                'reservations_count' => $this->apartmentReservations()->count(),
                'total_revenue' => $this->apartmentPayments()->where('status', 'paid')->sum('amount'),
                'pending_reservations' => $this->apartmentReservations()->where('status', 'pending')->count(),
            ];
        }
        
        if ($this->isTenant()) {
            return [
                'reservations_count' => $this->reservations()->count(),
                'total_spent' => $this->payments()->where('status', 'paid')->sum('amount'),
                'pending_reservations' => $this->reservations()->where('status', 'pending')->count(),
            ];
        }
        
        return [];
    }

    /**
     * Scope pour les propriétaires
     */
    public function scopeOwners($query)
    {
        return $query->where('role', 'owner');
    }

    /**
     * Scope pour les locataires
     */
    public function scopeTenants($query)
    {
        return $query->where('role', 'tenant');
    }

    /**
     * Récupère les locataires d'un propriétaire
     */
    public function getTenants()
    {
        if (!$this->isOwner()) {
            return collect();
        }

        return User::tenants()
            ->whereHas('reservations', function($query) {
                $query->whereHas('apartment', function($q) {
                    $q->where('owner_id', $this->id);
                });
            })
            ->with(['reservations' => function($query) {
                $query->whereHas('apartment', function($q) {
                    $q->where('owner_id', $this->id);
                });
            }])
            ->get();
    }

    /**
     * Formatage pour l'API
     */
    public function toApiArray()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'stats' => $this->getStats(),
        ];
    }
}