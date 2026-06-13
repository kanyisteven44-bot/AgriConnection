function CropCard({ crop }) {
  return (
    <div className="crop-card">
      <h3>{crop.name}</h3>
      <p>Location: {crop.location}</p>
      <p>Price: KES {crop.price}</p>
      <button>View Details</button>
    </div>
  );
}

export default CropCard;