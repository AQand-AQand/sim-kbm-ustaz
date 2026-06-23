import {Routes,Route} from "react-router-dom";

import Dashboard from "./pages/Dashboard";

import Jadwal from "./pages/Jadwal";

import Santri from "./pages/Santri";

import Absensi from "./pages/Absensi";

import BukuSaku from "./pages/BukuSaku";

import Muhafadhoh from "./pages/Muhafadhoh";

import Sikap from "./pages/Sikap";

import Nilai from "./pages/Nilai";

import Rapor from "./pages/Rapor";

import BankSoal from "./pages/BankSoal";

import Pengaturan from "./pages/Pengaturan";

import BottomNavbar from "./layout/BottomNavbar";

function App(){

return(

<>

<Routes>

<Route path="/" element={<Dashboard/>}/>

<Route path="/jadwal" element={<Jadwal/>}/>

<Route path="/santri" element={<Santri/>}/>

<Route path="/absensi" element={<Absensi/>}/>

<Route path="/bukusaku" element={<BukuSaku/>}/>

<Route path="/muhafadhoh" element={<Muhafadhoh/>}/>

<Route path="/sikap" element={<Sikap/>}/>

<Route path="/nilai" element={<Nilai/>}/>

<Route path="/rapor" element={<Rapor/>}/>

<Route path="/banksoal" element={<BankSoal/>}/>

<Route path="/pengaturan" element={<Pengaturan/>}/>

</Routes>

<BottomNavbar/>

</>

)

}

export default App;
