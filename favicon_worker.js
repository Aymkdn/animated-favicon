let currentImageIndex = 0;
let flipProgress = 0;
const displayDuration = 5000; // Display duration in ms
const flipDuration = 2000; // Flip duration in ms
const flipInterval = 20; // Interval between animation frames in ms

let images = [];
let canvas, ctx;

// Handle messages from the main thread
self.onmessage = async function (e) {
  if (e.data.type === 'init') {
    const imageUrls = e.data.images;
      canvas = new OffscreenCanvas(16, 16); // Use OffscreenCanvas for better performance
      ctx = canvas.getContext('2d');

      // Load images within the worker
      let loadedImages = 0;
      for (const src of imageUrls) {
        const response = await fetch(src, { mode: 'cors' });
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        images.push(imageBitmap);
        loadedImages++;
        if (loadedImages === imageUrls.length) {
          startAnimation();
        }
      }
    }
  };

  function drawImage(image1, image2, progress) {
    const width = canvas.width * Math.abs(Math.cos(progress * Math.PI));
    const x = (canvas.width - width) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (progress <= 0.5) {
      ctx.drawImage(image1, x, 0, width, canvas.height);
    } else {
      ctx.drawImage(image2, x, 0, width, canvas.height);
    }

  // Update the favicon
  updateFavicon();
}

function updateFavicon() {
  canvas.convertToBlob().then(blob => {
    const reader = new FileReader();
    reader.onloadend = () => {
      self.postMessage({ type: 'updateFavicon', dataUrl: reader.result });
    };
    reader.readAsDataURL(blob);
  });
}

function startFlipAnimation() {
  const flipIntervalId = setInterval(() => {
    flipProgress += flipInterval / flipDuration;
    if (flipProgress >= 1) {
      flipProgress = 0;
      currentImageIndex = (currentImageIndex + 1) % images.length;
      clearInterval(flipIntervalId);
      setTimeout(startFlipAnimation, displayDuration); 
    }
    const nextImageIndex = (currentImageIndex + 1) % images.length;
    drawImage(images[currentImageIndex], images[nextImageIndex], flipProgress);
  }, flipInterval);
}

function startAnimation() {
  ctx.drawImage(images[currentImageIndex], 0, 0, canvas.width, canvas.height);
  updateFavicon();
  setTimeout(startFlipAnimation, displayDuration);
}
