<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Apartment;
use App\Models\Reservation;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $user = $request->user();
        
        $totalApartments = Apartment::where('owner_id', $user->id)->count();
        $totalReservations = Reservation::whereHas('apartment', function($query) use ($user) {
            $query->where('owner_id', $user->id);
        })->count();
        
        $pendingReservations = Reservation::whereHas('apartment', function($query) use ($user) {
            $query->where('owner_id', $user->id);
        })->where('status', 'pending')->count();
        
        // Calcul du revenu mensuel
        $monthlyRevenue = Payment::whereHas('reservation.apartment', function($query) use ($user) {
            $query->where('owner_id', $user->id);
        })
        ->where('status', 'paid')
        ->whereMonth('created_at', now()->month)
        ->sum('amount');

        return response()->json([
            'stats' => [
                'total_apartments' => $totalApartments,
                'total_reservations' => $totalReservations,
                'pending_reservations' => $pendingReservations,
                'monthly_revenue' => $monthlyRevenue,
                'occupancy_rate' => $this->calculateOccupancyRate($user->id)
            ]
        ]);
    }

    private function calculateOccupancyRate($ownerId)
    {
        $totalApartments = Apartment::where('owner_id', $ownerId)->count();
        if ($totalApartments === 0) return 0;

        $occupiedApartments = Apartment::where('owner_id', $ownerId)
            ->where('available', false)
            ->count();

        return round(($occupiedApartments / $totalApartments) * 100);
    }

    public function getPayments(Request $request)
    {
        $user = $request->user();
        
        $payments = Payment::whereHas('reservation.apartment', function($query) use ($user) {
            $query->where('owner_id', $user->id);
        })
        ->with('reservation.apartment')
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json(['payments' => $payments]);
    }
}