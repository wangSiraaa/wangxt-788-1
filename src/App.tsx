import { useState, useMemo, useCallback, useEffect } from 'react';
import Header from './components/Header';
import SeatFilter from './components/SeatFilter';
import HeatMap from './components/HeatMap';
import ReservationSidebar from './components/ReservationSidebar';
import Statistics from './components/Statistics';
import AdminPanel from './components/AdminPanel';
import CleanerPanel from './components/CleanerPanel';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import HeatMapExamples from './components/HeatMapExamples';
import { buildings as initialBuildings, floors as initialFloors, timeSlots, users } from './data/mockData';
import { checkReservationConflict, getAlternativeFloors, getFloorStatistics, generateId } from './utils/businessLogic';
import { Seat, Reservation, ClosedArea, UserRole, User, ConflictInfo, AlternativeFloor, SeatStatus } from './types';
import { useStore } from './store/useStore';

function App() {
  const { seats, reservations, closedAreas, toggleSeatCleaning, addReservation, addClosedArea, removeClosedArea, resetToInitial } = useStore();
  
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const [selectedBuildingId, setSelectedBuildingId] = useState(initialBuildings[0].id);
  const [selectedFloorId, setSelectedFloorId] = useState(initialFloors[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState(timeSlots[0].id);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [statusFilter, setStatusFilter] = useState<SeatStatus | 'all'>('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showHeatMapExamples, setShowHeatMapExamples] = useState(false);
  const [keyboardNavIndex, setKeyboardNavIndex] = useState<number>(-1);

  const selectedFloor = initialFloors.find(f => f.id === selectedFloorId);
  const selectedTimeSlot = timeSlots.find(t => t.id === selectedTimeSlotId);

  const floorWithClosedAreas = useMemo(() => {
    if (!selectedFloor) return selectedFloor;
    return {
      ...selectedFloor,
      closedAreas: closedAreas.filter(ca => ca.floorId === selectedFloor.id)
    };
  }, [selectedFloor, closedAreas]);

  const filteredSeats = useMemo(() => {
    if (!selectedFloor) return seats;
    let result = seats.filter(s => s.floorId === selectedFloor.id);
    
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }
    if (areaFilter !== 'all') {
      result = result.filter(s => s.area === areaFilter);
    }
    
    return result;
  }, [seats, selectedFloor, statusFilter, areaFilter]);

  const availableAreas = useMemo(() => {
    if (!selectedFloor) return [];
    return [...new Set(seats.filter(s => s.floorId === selectedFloor.id).map(s => s.area))];
  }, [seats, selectedFloor]);

  const conflictInfo: ConflictInfo | null = useMemo(() => {
    if (!selectedSeat || currentUser.role !== 'student') return null;
    return checkReservationConflict(
      selectedSeat,
      currentUser.id,
      selectedDate,
      selectedTimeSlotId,
      reservations,
      seats
    );
  }, [selectedSeat, currentUser, selectedDate, selectedTimeSlotId, reservations, seats]);

  const alternativeFloors: AlternativeFloor[] = useMemo(() => {
    if (!conflictInfo?.hasConflict || !selectedFloor) return [];
    return getAlternativeFloors(
      selectedFloorId,
      selectedDate,
      selectedTimeSlotId,
      initialFloors,
      initialBuildings,
      reservations,
      seats
    );
  }, [conflictInfo, selectedFloorId, selectedDate, selectedTimeSlotId, reservations, seats, selectedFloor]);

  const statistics = useMemo(() => {
    if (!floorWithClosedAreas) return { total: 0, occupied: 0, available: 0, cleaning: 0, closed: 0, occupancyRate: 0 };
    return getFloorStatistics(floorWithClosedAreas, reservations, selectedDate, selectedTimeSlotId);
  }, [floorWithClosedAreas, reservations, selectedDate, selectedTimeSlotId]);

  const userReservations = useMemo(() => {
    return reservations.filter(r => r.userId === currentUser.id);
  }, [reservations, currentUser.id]);

  const handleRoleChange = useCallback((role: UserRole) => {
    const user = users.find(u => u.role === role) || users[0];
    setCurrentUser(user);
    setSelectedSeat(null);
  }, []);

  const handleBuildingChange = useCallback((id: string) => {
    setSelectedBuildingId(id);
    const building = initialBuildings.find(b => b.id === id);
    if (building && building.floors.length > 0) {
      setSelectedFloorId(building.floors[0].id);
    }
    setSelectedSeat(null);
  }, []);

  const handleFloorChange = useCallback((id: string) => {
    setSelectedFloorId(id);
    setSelectedSeat(null);
  }, []);

  const handleSeatClick = useCallback((seat: Seat) => {
    if (currentUser.role === 'student') {
      setSelectedSeat(prev => prev?.id === seat.id ? null : seat);
    }
  }, [currentUser.role]);

  const handleReserve = useCallback(() => {
    if (!selectedSeat || conflictInfo?.hasConflict) return;

    const newReservation: Reservation = {
      id: generateId(),
      userId: currentUser.id,
      seatId: selectedSeat.id,
      floorId: selectedFloorId,
      buildingId: selectedBuildingId,
      date: selectedDate,
      timeSlotId: selectedTimeSlotId,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    addReservation(newReservation);
    setSelectedSeat(null);
    alert('预约成功！刷新页面后预约仍然存在。');
  }, [selectedSeat, conflictInfo, currentUser.id, selectedFloorId, selectedBuildingId, selectedDate, selectedTimeSlotId, addReservation]);

  const handleCancelReservation = useCallback(() => {
    setSelectedSeat(null);
  }, []);

  const handleCloseArea = useCallback((area: ClosedArea) => {
    addClosedArea(area);
    alert('区域关闭成功！刷新页面后仍然有效。');
  }, [addClosedArea]);

  const handleOpenArea = useCallback((areaId: string) => {
    removeClosedArea(areaId);
    alert('区域已开放！');
  }, [removeClosedArea]);

  const handleToggleCleaning = useCallback((seatId: string) => {
    toggleSeatCleaning(seatId);
  }, [toggleSeatCleaning]);

  const clickableSeats = useMemo(() => {
    if (!selectedFloor) return [];
    return filteredSeats.filter(seat => {
      const reservedSeatIds = reservations
        .filter(r => r.date === selectedDate && r.timeSlotId === selectedTimeSlotId && r.status === 'active')
        .map(r => r.seatId);
      const closedAreaSeatIds = floorWithClosedAreas?.closedAreas.flatMap(ca => ca.seatIds) || [];
      
      if (closedAreaSeatIds.includes(seat.id)) return false;
      if (seat.status === 'closed') return false;
      if (seat.status === 'cleaning' && currentUser.role === 'student') return false;
      if (seat.status === 'occupied' && currentUser.role === 'student') return false;
      if (reservedSeatIds.includes(seat.id) && currentUser.role === 'student') return false;
      return true;
    });
  }, [filteredSeats, selectedFloor, reservations, selectedDate, selectedTimeSlotId, floorWithClosedAreas, currentUser.role]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showKeyboardShortcuts || showHeatMapExamples) {
        if (e.key === 'Escape') {
          setShowKeyboardShortcuts(false);
          setShowHeatMapExamples(false);
        }
        return;
      }

      if (e.key === '?' || e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setShowHeatMapExamples(true);
        return;
      }

      if (e.key >= '1' && e.key <= '3') {
        const roles: UserRole[] = ['student', 'admin', 'cleaner'];
        const roleIndex = parseInt(e.key) - 1;
        if (roles[roleIndex]) {
          handleRoleChange(roles[roleIndex]);
        }
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const filterSection = document.querySelector('[data-testid="seat-filter-section"]');
        if (filterSection) {
          filterSection.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (currentUser.role === 'student' && clickableSeats.length > 0) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          const currentIndex = keyboardNavIndex >= 0 ? keyboardNavIndex : 0;
          let newIndex = currentIndex;

          if (e.key === 'ArrowRight') {
            newIndex = (currentIndex + 1) % clickableSeats.length;
          } else if (e.key === 'ArrowLeft') {
            newIndex = (currentIndex - 1 + clickableSeats.length) % clickableSeats.length;
          } else if (e.key === 'ArrowDown') {
            const cols = Math.max(...filteredSeats.map(s => s.col), 0) + 1;
            newIndex = Math.min(currentIndex + cols, clickableSeats.length - 1);
          } else if (e.key === 'ArrowUp') {
            const cols = Math.max(...filteredSeats.map(s => s.col), 0) + 1;
            newIndex = Math.max(currentIndex - cols, 0);
          }

          setKeyboardNavIndex(newIndex);
          const seat = clickableSeats[newIndex];
          if (seat) {
            setSelectedSeat(seat);
          }
        }

        if (e.key === 'Enter') {
          if (selectedSeat && !conflictInfo?.hasConflict) {
            handleReserve();
          }
        }
      }

      if (e.key === 'Escape') {
        setSelectedSeat(null);
        setKeyboardNavIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showKeyboardShortcuts, showHeatMapExamples, clickableSeats, keyboardNavIndex, selectedSeat, conflictInfo, currentUser.role, filteredSeats]);

  const handleBackToList = useCallback(() => {
    setShowHeatMapExamples(false);
    const heatmapSection = document.querySelector('[data-testid="heatmap-section"]');
    if (heatmapSection) {
      heatmapSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const buildingsWithFloors = useMemo(() => {
    return initialBuildings.map(b => ({
      ...b,
      floors: initialFloors.filter(f => f.buildingId === b.id)
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header currentUser={currentUser} onRoleChange={handleRoleChange} onReset={resetToInitial} />
      
      <main className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <SeatFilter
          buildings={buildingsWithFloors}
          selectedBuildingId={selectedBuildingId}
          selectedFloorId={selectedFloorId}
          selectedDate={selectedDate}
          selectedTimeSlotId={selectedTimeSlotId}
          timeSlots={timeSlots}
          statusFilter={statusFilter}
          areaFilter={areaFilter}
          areas={availableAreas}
          onBuildingChange={handleBuildingChange}
          onFloorChange={handleFloorChange}
          onDateChange={setSelectedDate}
          onTimeSlotChange={setSelectedTimeSlotId}
          onStatusFilterChange={setStatusFilter}
          onAreaFilterChange={setAreaFilter}
          onKeyboardShortcutsClick={() => setShowKeyboardShortcuts(true)}
          onHeatMapExamplesClick={() => setShowHeatMapExamples(true)}
        />

        <Statistics {...statistics} />

        {currentUser.role === 'admin' && floorWithClosedAreas && (
          <AdminPanel
            floor={floorWithClosedAreas}
            seats={seats}
            closedAreas={closedAreas}
            onCloseArea={handleCloseArea}
            onOpenArea={handleOpenArea}
          />
        )}

        {currentUser.role === 'cleaner' && floorWithClosedAreas && (
          <CleanerPanel
            floor={floorWithClosedAreas}
            seats={seats}
            onToggleCleaning={handleToggleCleaning}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {floorWithClosedAreas && (
              <HeatMap
                floor={floorWithClosedAreas}
                seats={filteredSeats}
                reservations={reservations}
                selectedSeatId={selectedSeat?.id || null}
                onSeatClick={handleSeatClick}
                date={selectedDate}
                timeSlotId={selectedTimeSlotId}
                userRole={currentUser.role}
              />
            )}
          </div>
          
          <div className="lg:col-span-1">
            {currentUser.role === 'student' && (
              <ReservationSidebar
                selectedSeat={selectedSeat}
                selectedFloor={selectedFloor}
                selectedDate={selectedDate}
                selectedTimeSlot={selectedTimeSlot}
                userReservations={userReservations}
                conflictInfo={conflictInfo}
                alternativeFloors={alternativeFloors}
                onReserve={handleReserve}
                onFloorSelect={handleFloorChange}
                onCancel={handleCancelReservation}
              />
            )}
          </div>
        </div>
      </main>

      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      <HeatMapExamples
        isOpen={showHeatMapExamples}
        onClose={() => setShowHeatMapExamples(false)}
        onBackToList={handleBackToList}
      />
    </div>
  );
}

export default App;
