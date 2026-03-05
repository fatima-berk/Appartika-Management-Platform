<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('apartment_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('apartment_id')->constrained('apartments')->onDelete('cascade');
            $table->string('image_url');
            $table->string('file_path')->nullable(); // Chemin du fichier pour la suppression
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('apartment_images');
    }
};
