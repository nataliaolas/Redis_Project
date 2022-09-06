local typyoprawy = redis.call("keys", "*:typ_oprawy")

local wszystkie_counter = 0
local miekka_oprawa_counter = 0
local twarda_oprawa_counter = 0
for _,key in pairs(typyoprawy) do
    wszystkie_counter =wszystkie_counter + 1
   local val = redis.call("GET",key)
    if(val == "1" ) then
        miekka_oprawa_counter = miekka_oprawa_counter + 1
    else
        twarda_oprawa_counter = twarda_oprawa_counter + 1
end
end

return redis.call("echo","Liczba ksiazek w bazie: "..wszystkie_counter .." Liczba ksiazek z twarda oprawa: "..twarda_oprawa_counter.." Liczba ksiazek z miekka oprawa ".. miekka_oprawa_counter)