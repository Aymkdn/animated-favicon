# animated-favicon
Animated favicon for Chrome / Edge

It uses a web worker to make it work even if the tab is not active.

I basically use canvas to create an animation, and it converts the canvas to a base64 PNG that is injected into the favicon of the page.
