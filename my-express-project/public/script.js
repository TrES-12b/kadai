function showImage(src) {
    const container = document.getElementById('full-size-container');
    const img = document.getElementById('full-size-image');
    img.src = src;
    container.style.display = 'flex';
  
    container.onclick = function() {
      container.style.display = 'none';
    };
  }
  