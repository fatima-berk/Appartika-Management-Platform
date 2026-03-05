<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'amount',
        'method',
        'status'
    ];

    protected $casts = [
        'amount' => 'decimal:2'
    ];

    // Relation avec la réservation
    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    // L'utilisateur est accessible via la réservation
    // Pas besoin de relation directe car payments n'a pas de user_id
}