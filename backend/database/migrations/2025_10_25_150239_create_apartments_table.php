<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('apartments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
    $table->string('title', 150);
    $table->text('description')->nullable();
    $table->string('address')->nullable();
    $table->string('city', 100)->nullable();
    $table->decimal('price_per_month', 10, 2);
    $table->integer('surface')->nullable();
    $table->integer('rooms')->nullable();
    $table->string('image')->nullable();
    $table->boolean('available')->default(true);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apartments');
    }
};
