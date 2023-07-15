log.write('Lua-Injector', log.INFO, "starting")

local require = require
local loadfile = loadfile

package.path = package.path..";.\\LuaSocket\\?.lua"
package.cpath = package.cpath..";.\\LuaSocket\\?.dll"

local JSON = loadfile("Scripts\\JSON.lua")()
local socket = require("socket")


luaInjector = {}

luaInjector.host = "localhost"
luaInjector.port = 18080

luaInjector.server = socket.bind(luaInjector.host, luaInjector.port)
luaInjector.server:settimeout(.0001)

luaInjector.lastAttempt = 0

local function step()
    if DCS.getRealTime() - luaInjector.lastAttempt < 1 then return end

    luaInjector.lastAttempt = DCS.getRealTime()
    
    local client = luaInjector.server:accept()
    if client then
        client:settimeout(.0001)
        local line = client:receive()
        local data = JSON:decode(line)
        if data.type == 'lua' then
            local inject = "a_do_script([["..data.script.."]])"
            local result, success = net.dostring_in('mission', inject)
            log.write("Lua-Injector", log.INFO, tostring(result))
        end
    end
end

DCS.setUserCallbacks({
    ["onSimulationFrame"] = function()
        status, err = pcall(step)
        if not status then
            log.write("Lua-Injector", log.INFO, tostring(err))
        end
    end
})

log.write('Lua-Injector', log.INFO, "started")
			