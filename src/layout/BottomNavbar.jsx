import { Link } from "react-router-dom";

export default function BottomNavbar(){

return(

<div
style={{

position:"fixed",

bottom:0,

left:0,

right:0,

height:"65px",

display:"flex",

justifyContent:"space-around",

alignItems:"center",

background:"#fff",

boxShadow:"0 -2px 10px rgba(0,0,0,0.1)"

}}

>

<Link to="/">Home</Link>

<Link to="/jadwal">Jadwal</Link>

<Link to="/santri">Santri</Link>

</div>

);

}
