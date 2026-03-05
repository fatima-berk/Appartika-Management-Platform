<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'apartment_id',
        'start_date',
        'end_date',
        'status',
        'total_price'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_price' => 'decimal:2'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function apartment()
    {
        return $this->belongsTo(Apartment::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
    
}