import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Footer = () => {
    const router = useRouter();
    const [currentPath,setCurrentPath] = useState("");
    useEffect(()=>{
        setCurrentPath(router.pathname)
    },[router])
    function changeRoute(path) {
        router.push(path);
    }
    return (
        <div className="fixed bottom-0 w-full shadow-[0px_0px_12.923px_0px_rgba(0,0,0,0.10)]">
            <div className="flex">
                <button
                    onClick={() => changeRoute('/home')}
                    className={`w-1/2 py-[10px] px-0 border-0 rounded-none font-normal text-sm leading-[27px] cursor-pointer
                        ${currentPath === "/home" 
                        ? "bg-[#2F3990] text-white" 
                        : "bg-white"}`}
                >
                    <img 
                        className="mr-[10px] inline-block cursor-pointer"
                        src={currentPath === "/home" 
                            ? "/images/svg/clock_white.svg"
                            : "/images/svg/clock_gray.svg"
                        } 
                        alt="Timer Icon"
                    />
                    Timer
                </button>
                <button
                    onClick={() => changeRoute('/logentry')}
                    className={`w-1/2 py-[10px] px-0 border-0 rounded-none font-normal text-sm leading-[27px] cursor-pointer 
                        ${currentPath === "/logentry"
                        ? "bg-[#2F3990] text-white" 
                        : "bg-white"}`}
                >
                    <img 
                        className="mr-[10px] inline-block cursor-pointer"
                        src={currentPath === "/logentry"
                            ? "/images/svg/list_bulleted-white.svg"
                            : "/images/svg/list_bulleted-gray.svg"
                        } 
                        alt="Log Entry Icon"
                    />
                    Log Entry
                </button>
            </div>
        </div>
    )
}

export default Footer