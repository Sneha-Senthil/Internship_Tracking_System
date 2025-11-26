const images = [
  "https://cdn.magicdecor.in/com/2023/10/20174720/Anime-Scenery-Wallpaper-for-Walls.jpg",
  "https://m.media-amazon.com/images/I/71mgpWBEXHL.jpg",
  "https://backiee.com/static/wallpapers/560x315/209636.jpg"
];

window.ImageSlider = function ImageSlider() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: "100%",
      height: "500px",
      overflow: "hidden",
      position: "relative",
      marginTop: "56px" // Adjust this if you have a fixed AppBar
    }}>
      <div
        style={{
          display: "flex",
          width: `${images.length * 100}%`,
          transform: `translateX(-${index * (100 / images.length)}%)`,
          transition: "transform 1s ease"
        }}
      >
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Slide ${idx + 1}`}
            style={{
              width: `${100 / images.length}%`,
              height: "500px",
              objectFit: "cover"
            }}
          />
        ))}
      </div>
    </div>
  );
};
