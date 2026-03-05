<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Apartment;
use App\Models\Reservation;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Créer un propriétaire
        $owner = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'owner@example.com',
        ]);

        // Créer des appartements
        $apartments = Apartment::factory(3)->create([
            'owner_id' => $owner->id,
        ]);

        // Créer des réservations
        foreach ($apartments as $apartment) {
            Reservation::factory(2)->create([
                'apartment_id' => $apartment->id,
                'status' => 'pending'
            ]);
        }
    }
}
