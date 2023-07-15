--[[
Copyright (c) 2023, Dzsekeb
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree. 
]]--

--[[
Place this script inside C:\Users\<username>\Saved Games\DCS.openbeta\Scripts\Hooks\

Create the neccessary folders if they are not already present

The DCS.openbeta part of the path may vary depending on your DCS installation.
]]--

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
            if not result or #result==0 then
                log.write("Lua-Injector", log.INFO, 'Script executed')
                client:send(JSON:encode({type='receipt', status='OK'}))
            else
                log.write("Lua-Injector", log.INFO, 'Script error: '..tostring(result))
                client:send(JSON:encode({type='receipt', status='ERROR'}))
            end
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
			