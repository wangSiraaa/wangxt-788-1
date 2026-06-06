import { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import SeatFilter from './components/SeatFilter';
import HeatMap from './components/HeatMap';
import ReservationSidebar from './components/ReservationSidebar';
import Statistics from './components/Statistics';
import AdminPanel from './components/AdminPanel';
import CleanerPanel from './components/CleanerPanel';
import { buildings as initialBuildings, floors as initialFloors, timeSlots, users, initialReservations, closedAreas as initialClosedAreas } from './data/mockData';
import { checkReservationConflict, getAlternativeFloors, getFloorStatistics, generateId } from './utils/businessLogic';
import { Seat, Reservation, ClosedArea, UserRole, User, ConflictInfo, AlternativeFloor, SeatStatus } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const [selectedBuildingId, setSelectedBuildingId] = useState(initialBuildings[0].id);
  const [selectedFloorId, setSelectedFloorId] = useState(initialFloors[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState(timeSlots[0].id);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [statusFilter, setStatusFilter] = useState<SeatStatus | 'all'>('all');
  const [areaFilter, setAreaFilter] = useState('all');
  
  const [seats, setSeats] = useState(initialFloors.flatMap(f => f.seats));
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [closedAreas, setClosedAreas] = useState<ClosedArea[]>(initialClosedAreas);

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

    setReservations(prev => [...prev, newReservation]);
    setSelectedSeat(null);
    alert('预约成功！');
  }, [selectedSeat, conflictInfo, currentUser.id, selectedFloorId, selectedBuildingId, selectedDate, selectedTimeSlotId]);

  const handleCancelReservation = useCallback(() => {
    setSelectedSeat(null);
  }, []);

  const handleCloseArea = useCallback((area: ClosedArea) => {
    setClosedAreas(prev => [...prev, area]);
    alert('区域关闭成功！');
  }, []);

  const handleOpenArea = useCallback((areaId: string) => {
    setClosedAreas(prev => prev.filter(ca => ca.id !== areaId));
    alert('区域已开放！');
  }, []);

  const handleToggleCleaning = useCallback((seatId: string) => {
    setSeats(prev => prev.map(s => {
      if (s.id === seatId) {
        return { ...s, status: s.status === 'cleaning' ? 'available' : 'cleaning' as SeatStatus };
      }
      return s;
    }));
  }, []);

  const buildingsWithFloors = useMemo(() => {
    return initialBuildings.map(b => ({
      ...b,
      floors: initialFloors.filter(f => f.buildingId === b.id)
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header currentUser={currentUser} onRoleChange={handleRoleChange} />
      
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
    </div>
  );
}

export default App;
