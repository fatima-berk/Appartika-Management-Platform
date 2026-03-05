<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ApartmentFactory extends Factory
{
    public function definition()
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'price_per_month' => $this->faker->numberBetween(500, 2000),
            'available' => $this->faker->boolean(70),
            'image' => $this->faker->imageUrl(400, 300, 'apartment'),
        ];
    }
}