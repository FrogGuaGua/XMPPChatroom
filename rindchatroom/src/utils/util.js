import Math from "core-js/fn/math";
export const generateRandomSeed = ()=>
{
    return Math.floor(Math.random()*0xFFFFFFFFFFFFFFFF+1)
}

