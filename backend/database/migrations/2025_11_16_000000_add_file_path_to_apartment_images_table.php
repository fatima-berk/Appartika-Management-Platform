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
        Schema::table('apartment_images', function (Blueprint $table) {
            if (!Schema::hasColumn('apartment_images', 'file_path')) {
                $table->string('file_path')->nullable()->after('image_url');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('apartment_images', function (Blueprint $table) {
            if (Schema::hasColumn('apartment_images', 'file_path')) {
                $table->dropColumn('file_path');
            }
        });
    }
};









