import { Routes, Route, Navigate } from "react-router-dom";

function Dashboard() {
  return <h2>Dashboard</h2>;
}

function Jadwal() {
  return <h2>Jadwal</h2>;
}

function Santri() {
  return <h2>Santri</h2>;
}

function App() {
  return (
    <Routes>

      <Route path="/" element={<Dashboard />} />

      <Route path="/jadwal" element={<Jadwal />} />

      <Route path="/santri" element={<Santri />} />

      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;
