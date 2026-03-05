<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ApartmentController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ApartmentImageController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\EnsureUserIsAdmin;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Route de test
Route::get('/test', [AuthController::class, 'test']);

//Route::post('/register', [AuthController::class, 'register']);
// Dans api.php, limiter les rôles pour l'inscription publique
Route::post('/register', [AuthController::class, 'register'])->middleware('guest');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/check-email', [AuthController::class, 'checkEmail']);

// Routes protégées par Sanctum
Route::middleware(['auth:sanctum'])->group(function () {
    // Authentification
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
      Route::get('/apartments', [ApartmentController::class, 'index']);
    Route::get('/apartments/{id}', [ApartmentController::class, 'show']);

    // Appartements
    Route::get('/apartments', [ApartmentController::class, 'index']);
    Route::get('/apartments/{id}', [ApartmentController::class, 'show']);
    Route::post('/apartments', [ApartmentController::class, 'store']);
    Route::put('/apartments/{id}', [ApartmentController::class, 'update']);
    Route::delete('/apartments/{id}', [ApartmentController::class, 'destroy']);
    Route::get('/owner/{ownerId}/apartments', [ApartmentController::class, 'getByOwner']);

    // Images d'appartements
    Route::get('/apartments/{apartmentId}/images', [ApartmentImageController::class, 'index']);
    Route::post('/apartments/{apartmentId}/images', [ApartmentImageController::class, 'store']);
    Route::delete('/apartment-images/{imageId}', [ApartmentImageController::class, 'destroy']);

    // Réservations
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
    Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);
    Route::get('/tenant/{tenantId}/reservations', [ReservationController::class, 'getByTenant']);
    Route::get('/owner/{ownerId}/reservations', [ReservationController::class, 'getByOwner']);
    Route::put('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
Route::get('/apartments/{apartment}/reservations', [ReservationController::class, 'getApartmentReservations']);
    // Paiements
    Route::get('/owner/{ownerId}/payments', [PaymentController::class, 'getByOwner']);
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::put('/payments/{id}', [PaymentController::class, 'update']);
    Route::get('/user/{userId}/payments', [PaymentController::class, 'getByUser']);

    // Gestion du profil
    Route::get('/users/{id}', [AuthController::class, 'getUserProfile']);
    Route::put('/users/{id}', [AuthController::class, 'updateProfile']);
    Route::put('/users/{id}/password', [AuthController::class, 'changePassword']);

    // Routes pour la gestion des locataires
    Route::prefix('tenants')->group(function () {
        Route::get('/owner/{ownerId}', [TenantController::class, 'getOwnerTenants']);
        Route::get('/stats/{ownerId}', [TenantController::class, 'getTenantStats']);
        Route::get('/{tenantId}', [TenantController::class, 'getTenantDetails']);
        Route::get('/{tenantId}/payments', [TenantController::class, 'getTenantPaymentHistory']);
        Route::put('/{tenantId}', [TenantController::class, 'updateTenant']);
        Route::post('/terminate-contract/{reservationId}', [TenantController::class, 'terminateContract']);
        Route::get('/search/{ownerId}', [TenantController::class, 'searchTenants']);
    });
    // Routes pour les avis (utilisateurs / propriétaires)
    // Avis pour les appartements d'un propriétaire
    Route::get('/owner/{id}/reviews', [ReviewController::class, 'getOwnerReviews']);
    // Création / mise à jour / suppression d'un avis par un utilisateur connecté
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    // Récupération des avis d'un utilisateur et vérification d'éligibilité d'une réservation
    Route::get('/users/{userId}/reviews', [ReviewController::class, 'getUserReviews']);
    Route::get('/reservations/{reservationId}/can-review', [ReviewController::class, 'canUserReview']);
// Ajouter cette route dans api.php (dans le groupe auth:sanctum)
Route::get('/apartments/{apartmentId}/reviews', [ReviewController::class, 'getApartmentReviews']);
    // Routes Admin - Protégées par middleware admin (préfixe /admin)
    Route::middleware([EnsureUserIsAdmin::class])->prefix('admin')->group(function () {
        // Statistiques
        Route::get('/stats', [AdminController::class, 'getStats']);
        
        // Gestion des utilisateurs
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::get('/users/{id}', [AdminController::class, 'getUser']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        
        // Gestion des appartements
        Route::get('/apartments', [AdminController::class, 'getApartments']);
        Route::put('/apartments/{id}', [AdminController::class, 'updateApartment']);
        Route::delete('/apartments/{id}', [AdminController::class, 'deleteApartment']);
        
        // Gestion des réservations
        Route::get('/reservations', [AdminController::class, 'getReservations']);
        Route::put('/reservations/{id}', [AdminController::class, 'updateReservation']);
        Route::delete('/reservations/{id}', [AdminController::class, 'deleteReservation']);
        
        
        // Gestion des paiements
        Route::get('/payments', [AdminController::class, 'getPayments']);
        Route::put('/payments/{id}', [AdminController::class, 'updatePayment']);
        Route::delete('/payments/{id}', [AdminController::class, 'deletePayment']);
        // Routes pour les paiements
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/user/{userId}/payments', [PaymentController::class, 'getByUser']);
    Route::get('/owner/{ownerId}/payments', [PaymentController::class, 'getByOwner']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::put('/payments/{id}', [PaymentController::class, 'update']);
    Route::delete('/payments/{id}', [PaymentController::class, 'destroy']);
     // Route pour vérifier l'existence d'un paiement
    Route::get('/payments/check/{reservationId}', function ($reservationId) {
        $payment = Payment::where('reservation_id', $reservationId)->first();
        return response()->json([
            'success' => true,
            'exists' => $payment !== null,
            'data' => $payment
        ]);
    });
     // Routes pour les images d'appartement
    Route::get('/apartments/{apartmentId}/images', [ApartmentImageController::class, 'index']);
    Route::post('/apartments/{apartmentId}/images', [ApartmentImageController::class, 'store']);
    Route::delete('/apartment-images/{imageId}', [ApartmentImageController::class, 'destroy']);
        
        // Gestion des avis (côté admin)
        Route::get('/reviews', [AdminController::class, 'getReviews']);
        Route::put('/reviews/{id}', [AdminController::class, 'updateReview']);
        Route::delete('/reviews/{id}', [AdminController::class, 'deleteReview']);
    });
});

// Route fallback pour les routes non trouvées
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Route API non trouvée'
    ], 404);
});