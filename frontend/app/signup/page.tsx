"use client"

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function (){
    const [email,setemail]=useState("");
    const [password,setpassword]=useState("");
    const router=useRouter()


    useEffect(()=>{
        const timeout=setTimeout(() => {
            console.log(email,"blue")
            console.log(password)
        }, 1000);
        return()=> clearTimeout(timeout)
    },[email])

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
    </div>)
}