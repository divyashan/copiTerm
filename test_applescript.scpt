tell application "iTerm2"
	tell current session of current window 
		write text "ls | wc -l "
	end tell
end tell 
