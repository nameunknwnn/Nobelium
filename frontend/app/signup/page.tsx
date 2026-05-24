"use client"

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function (){
    const [email,setemail]=useState("");
    const [password,setpassword]=useState("");
    const router=useRouter()



    const handleOnclick=async()=>{
        const response=await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signup`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                email:email,
                password:password
            })
        })
        if (response.ok){
            router.push("/signin")
        }
    }

    return(<div>
        <input placeholder="email" type="text" value={email} onChange={(e)=>{setemail(e.target.value)}} />
        <input placeholder="password" type="text" value={password} onChange={(e)=>{setpassword(e.target.value)}} />
        <button onClick={handleOnclick}>Submit</button>
        <button onClick={()=>router.push("/signin")}>if you already have an account </button>

    </div>)
}