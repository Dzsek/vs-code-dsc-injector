# DCS Lua Injector

This VSCode extension lets you run lua code and code snippets inside Digital Combat Simulators mission environment.


## Installation

For this extension to work you will need to copy the DCS-Lua-Injector.lua script into your `C:\Users\<username>\Saved Games\DCS.openbeta\Scripts\Hooks` folder.
Create the folder if it does not exist.

## Usage

### Hotkey
Pressing Alt+D will send the currently selected text to DCS to be run in the mission environment.
If no text is selected it will send the entire content of the currently open file.

The keybinding can be changed in the `File->Preferences->Keyboard Shortcuts` menu. 

(search for `@command:dcs-lua-injector.runSelection`, or `Run selected lua code in DCS`)

### DCS extension menu

This can be found on the activities bar on the left.

It shows you a collection of lua snippets found in the current workspace, and lets you run them with a single click.

To define a snippet create a `.lua` file anywhere in the current workspace and write your code in the following format in it:

```lua
--#inject:snippetname
 lua code here
--#end
```

The snippet name must consist of alpha-numeric characters.

You can have multiple snippets in a single file. Each snippet is considered to be from an `--#inject:name` line to the next `--#end` line.

