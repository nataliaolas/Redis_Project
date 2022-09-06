local rok_tab = {}

local rok_tab = redis.call("keys", "*:rokwydania")

local rok_counter = 0

for _,key in pairs(rok_tab) do
	local ksiazka_rok_wydania = redis.call("GET",key)
	 if(ksiazka_rok_wydania == "2021" ) then
		rok_counter = rok_counter + 1
 end
 end

return redis.call("echo","Liczba ksiazek wydanych w 2021 roku:"..rok_counter)
