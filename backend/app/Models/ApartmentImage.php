<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApartmentImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'apartment_id',
        'image_url',
        'file_path',
    ];

    public function apartment()
    {
        return $this->belongsTo(Apartment::class);
    }
}
