import { useEffect, useState } from "react";

import { supabase } from "../services/supabase";

export default function useAuth() {

const [user,setUser]=useState(null);

const [loading,setLoading]=useState(true);

useEffect(()=>{

supabase.auth.getUser()

.then(({data})=>{

setUser(data.user);

setLoading(false);

});

const {

data:{subscription}

}

=

supabase.auth.onAuthStateChange(

(event,session)=>{

setUser(session?.user ?? null);

}

);

return ()=>subscription.unsubscribe();

},[]);

return{

user,

loading

};

}
