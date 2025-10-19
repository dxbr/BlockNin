import { Link } from "react-router-dom";

export default function Leaderboard() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white"
      style={{
        backgroundColor: "#000",
        backgroundImage:
          "radial-gradient(ellipse at top, #335476 0%, #31506e 11.1%, #304b67 22.2%, #2f4760 33.3%, #2d4359 44.4%, #2c3f51 55.6%, #2a3a4a 66.7%, #293643 77.8%, #28323d 88.9%, #262e36 100%)",
      }}
    >
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
        <p className="text-lg text-white/80 mb-8">Coming Soon...</p>
        <Link
          to="/"
          className="text-white/90 hover:text-white underline-offset-4 hover:underline"
        >
          Back
        </Link>
      </div>
    </div>
  );
}
