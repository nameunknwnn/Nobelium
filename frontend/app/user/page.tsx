"use client"

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function () {
  const handleOnClick = async () => {
  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/google/oauth`;
}
  const params=useParams();
  const token=params.slug

  console.log(token)

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prompt, setprompt] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, {
        credentials: "include",
      });

      if (res.status !== 200) {
        router.push("/signin");
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  const handleOnsend=async()=>{
      const response=await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/agent/suggest`,{
          method:"POST",
          headers:{
              "Content-Type":"application/json"
          },
          credentials: "include",
          body:JSON.stringify({
              prompt
          })
      })
      const data=await response.json()
      console.log(data["messages"])
  }
  if (loading) return <div>Loading...</div>;
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-10">
      <div>HELLO USER YOU ARE SIGNED IN</div>
      <button className="pt-10 border-1 bg-amber-800" onClick={handleOnClick}>
        connect to google
      </button>
      <input placeholder="prompt" className=" pl-10 border-1" onChange={(e)=>{setprompt(e.target.value)}} />
      <button className=" border-1 bg-amber-800 text-base  rounded-3xl" onClick={handleOnsend}>
        send
      </button>
    </div>
  );
}
