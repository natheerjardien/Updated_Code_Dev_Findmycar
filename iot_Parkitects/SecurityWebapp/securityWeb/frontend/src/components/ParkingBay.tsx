import car from "../assets/car.png";

type ParkingBayProps = {
  id: string;
  occupied?: boolean;
  onClick?: (id: string) => void;
};

export default function ParkingBay({
  id,
  occupied = false,
  onClick,
}:  ParkingBayProps) {
  return (
    
    <button 
    type="button"
     className={`parking-bay ${occupied ? "occupied" : "available"}`}
      onClick={() => onClick?.(id)}
      >
      {occupied ? (
        <img
          src={car} 
          alt="Occupied parking space"
          className="parking-car"
        />
      ) : (
        <div className="empty-bay" />
      )}

      <span className="parking-bay-label">
        {id}
      </span>

    </button>
  );
}

