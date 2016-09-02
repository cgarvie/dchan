# deechan

TODO:

# *DONE* generate thumbnails for all images
## https://github.com/nfnt/resize [VERIFIED BEST CHOICE]
## thumbnails should have max-width and max-height of 125px (4ch)
## an extremely tall iamge for exaple will have max-height:125px and a very tiny width that preserves the original aspect-ratio.

# *DONE* Expand images on click.
## huge images do not get scaled down, but they do get max-width (and/or max-height) set to the viewwindow size. 4ch specifically sets both as an inline style that is generated with onClick=SomeJSFunc() based on window size at the time of click.

# *DONE* make gif's play (and loop) on click
## http://www.hongkiat.com/blog/on-click-animated-gif/ <-- don't really need this.
## Better logic: if expanded: Play,Loop. if not expanded: Stop. See above task.
## This better logic is also what 4ch does

# *DONE*  Remove padding from the stupid Material-UI Badge element container. It adds padding now.

# *DONE* filenames are funny. preserve the filename that was uploaded for display.

# FIX THIS BUG . shows in Js console
## bundle.js:8654 Warning: Failed prop type: Invalid prop `multiple` of type `string` supplied to `Dropzone`, expected

# ActiveSessions should be stored in rethinkdb, and sent using channels, to client, rather than being computed on client-side. So it should be much more lke users, msgs, threads, etc.

# Make sure that the current client/browsersession/useraccount/useraccountsession setup is ideal long-term

# Switch to using a Getter method client.GetAlias() .. Golang uses getters/setters, not @attribute methods.

# Add thumbnails for webms. At this point this looks difficult.
## prob just awnt an ffmpeg wrapper for Go
## https://github.com/giorgisio/goav a good choice
## https://github.com/3d0c/gmf/blob/master/examples/video-to-jpeg.go a good choice

# add replies. 
## 4ch method is fine for now.
## Later, this probably requires some innovation

# onAddThreadMessage -> display snackbar that says "new msg. scroll down if u want"

# Create the alias system. One click to add and switch between.

# Add the "websocket is dead/alive [try again]" snackbar thingy

# do OPs need imgs? maybe not required, but add the option.

# Closing window does indeed appear to prune the user, but this Go app is so unstable that it is not reliable.
## This is also important because users are not being removed from activeSessions so no one can go offline until someone else comes online.






# fdfd

No readme yet. The below are notes to myself!

Potential angles/niches for geting traction:

- netsec - anon
- travel - requires multiple photos per OP - a la pantip <-- not i doesn't! on td and pantip and most forums people bump the thread with pics as they travel, live.
- food - requires multiple photos per OP - a la pantip <-- see above. not really. plus food bloggers are an easy traffic source.
- crypto, politics - can offer no censorship, unlike reddit etc
- expat - tw cn jp th etc <- me







POSSIBLE in the future:

# some very mild form of gamification.