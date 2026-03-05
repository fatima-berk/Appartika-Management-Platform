<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Apartment extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'title',
        'description',
        'address',
        'city',
        'price_per_month',
         'price_per_day',
        'surface',
        'rooms',
        'image',
        'available'
    ];

    protected $casts = [
        'price_per_month' => 'decimal:2',
        'price_per_day' => 'decimal:2',
        'available' => 'boolean'
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function images()
    {
        return $this->hasMany(ApartmentImage::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
    public function getBathroomsAttribute()
    {
        // Valeur par défaut sans colonne supplémentaire
        return 1;
    }
    
    public function getFeaturesAttribute()
    {
        // Simuler des features sans colonne JSON
        return ['wifi', 'chauffage'];
    }
}


