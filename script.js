// DOM elements
const videoGrid = document.querySelector('.video-grid');
const videoPlayerOverlay = document.querySelector('.video-player-overlay');
const videoPlayer = document.getElementById('video-player');
const videoTitle = document.querySelector('.video-title');
const videoDescription = document.querySelector('.video-description');
const closeBtn = document.querySelector('.close-btn');
const favoriteBtn = document.querySelector('.favorite-btn');
const categoryButtons = document.querySelectorAll('.categories button');
const searchInput = document.querySelector('.search-bar input');

// Video data storage
let videos = [];
let currentVideo = null;

// Initialize the app
function init() {
  loadVideosFromLocalStorage();
  scanLocalVideos();
  setupEventListeners();
}

// Load saved video metadata from localStorage
function loadVideosFromLocalStorage() {
  const savedVideos = localStorage.getItem('videoGallery');
  if (savedVideos) {
    videos = JSON.parse(savedVideos);
    renderVideos(videos);
  }
}

// Save video metadata to localStorage
function saveVideosToLocalStorage() {
  localStorage.setItem('videoGallery', JSON.stringify(videos));
}

// Scan for local videos in the 'videos' directory
function scanLocalVideos() {
  // This is a placeholder - in a real web app, you can't directly scan local directories
  // You would need to either:
  // 1. Have users select files through an input
  // 2. Use a server-side script to scan directories
  
  // For demonstration, let's add a file input to allow users to select videos
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.accept = 'video/*';
  fileInput.style.display = 'none';
  fileInput.addEventListener('change', handleFileSelection);
  
  document.body.appendChild(fileInput);
  
  // Add an "Add Videos" button to the header
  const header = document.querySelector('header');
  const addButton = document.createElement('button');
  addButton.className = 'add-videos-btn';
  addButton.innerHTML = '<i class="fas fa-plus"></i> Add Videos';
  addButton.addEventListener('click', () => fileInput.click());
  
  header.appendChild(addButton);
}

// Handle file selection
function handleFileSelection(event) {
  const files = event.target.files;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      
      // Create a video element to get duration and thumbnail
      const videoEl = document.createElement('video');
      videoEl.src = videoUrl;
      
      videoEl.addEventListener('loadedmetadata', () => {
        // Create a canvas to capture the thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 280;
        
        // Set the video to a point for thumbnail (2 seconds in)
        videoEl.currentTime = 2;
      });
      
      videoEl.addEventListener('seeked', () => {
        // Draw the video frame to the canvas
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 280;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        
        // Get the thumbnail as a data URL
        const thumbnailUrl = canvas.toDataURL('image/jpeg');
        
        // Add the video to our collection
        const newVideo = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: `Added on ${new Date().toLocaleDateString()}`,
          thumbnail: thumbnailUrl,
          src: videoUrl,
          file: file,
          category: "Personal",
          favorite: false
        };
        
        videos.push(newVideo);
        saveVideosToLocalStorage();
        renderVideos(filterVideosForCurrentView());
      });
    }
  }
}

// Render video cards
function renderVideos(videosToRender) {
  videoGrid.innerHTML = '';
  
  if (videosToRender.length === 0) {
    videoGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-film"></i>
        <p>No videos found. Click "Add Videos" to get started.</p>
      </div>
    `;
    return;
  }
  
  videosToRender.forEach(video => {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.dataset.id = video.id;
    
    videoCard.innerHTML = `
      <div class="thumbnail-container">
        <img src="${video.thumbnail}" alt="${video.title}" class="thumbnail">
        <div class="play-icon">
          <i class="fas fa-play"></i>
        </div>
        ${video.favorite ? '<div class="favorite-indicator"><i class="fas fa-heart"></i></div>' : ''}
      </div>
      <div class="video-info">
        <h3>${video.title}</h3>
        <p>${video.description}</p>
      </div>
    `;
    
    videoGrid.appendChild(videoCard);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Video card click
  videoGrid.addEventListener('click', (e) => {
    const videoCard = e.target.closest('.video-card');
    if (videoCard) {
      const videoId = parseInt(videoCard.dataset.id);
      openVideoPlayer(videoId);
    }
  });
  
  // Close video player
  closeBtn.addEventListener('click', closeVideoPlayer);
  
  // Favorite button
  favoriteBtn.addEventListener('click', toggleFavorite);
  
  // Category filtering
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const category = button.textContent;
      filterVideos(category);
    });
  });
  
  // Search functionality
  searchInput.addEventListener('input', handleSearch);
  
  // Close player when clicking outside
  videoPlayerOverlay.addEventListener('click', (e) => {
    if (e.target === videoPlayerOverlay) {
      closeVideoPlayer();
    }
  });
  
  // Keyboard events
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !videoPlayerOverlay.classList.contains('hidden')) {
      closeVideoPlayer();
    }
  });
}

// Open video player
function openVideoPlayer(videoId) {
  currentVideo = videos.find(video => video.id === videoId);
  
  if (currentVideo) {
    videoPlayer.src = currentVideo.src;
    videoTitle.textContent = currentVideo.title;
    videoDescription.textContent = currentVideo.description;
    
    // Update favorite button
    updateFavoriteButton();
    
    // Show the player
    videoPlayerOverlay.classList.remove('hidden');
    setTimeout(() => {
      videoPlayerOverlay.classList.add('visible');
    }, 10);
    
    // Play the video
    videoPlayer.load();
    videoPlayer.play();
  }
}

// Close video player
function closeVideoPlayer() {
  videoPlayerOverlay.classList.remove('visible');
  
  setTimeout(() => {
    videoPlayerOverlay.classList.add('hidden');
    videoPlayer.pause();
    videoPlayer.src = '';
  }, 300);
}

// Toggle favorite status
function toggleFavorite() {
  if (currentVideo) {
    currentVideo.favorite = !currentVideo.favorite;
    updateFavoriteButton();
    saveVideosToLocalStorage();
    
    // Update the video card in the grid
    renderVideos(filterVideosForCurrentView());
  }
}

// Update favorite button appearance
function updateFavoriteButton() {
  if (currentVideo.favorite) {
    favoriteBtn.classList.add('active');
    favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
  } else {
    favoriteBtn.classList.remove('active');
    favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
  }
}

// Filter videos by category
function filterVideos(category) {
  let filteredVideos;
  
  if (category === 'All') {
    filteredVideos = videos;
  } else if (category === 'Favorites') {
    filteredVideos = videos.filter(video => video.favorite);
  } else {
    filteredVideos = videos.filter(video => video.category === category);
  }
  
  // Apply search filter if there's a search term
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm) {
    filteredVideos = filteredVideos.filter(video => 
      video.title.toLowerCase().includes(searchTerm) || 
      video.description.toLowerCase().includes(searchTerm)
    );
  }
  
  renderVideos(filteredVideos);
}

// Handle search
function handleSearch() {
  const activeCategory = document.querySelector('.categories button.active').textContent;
  filterVideos(activeCategory);
}

// Get currently filtered videos based on active category and search
function filterVideosForCurrentView() {
  const activeCategory = document.querySelector('.categories button.active').textContent;
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  let filteredVideos;
  
  if (activeCategory === 'All') {
    filteredVideos = videos;
  } else if (activeCategory === 'Favorites') {
    filteredVideos = videos.filter(video => video.favorite);
  } else {
    filteredVideos = videos.filter(video => video.category === activeCategory);
  }
  
  if (searchTerm) {
    filteredVideos = filteredVideos.filter(video => 
      video.title.toLowerCase().includes(searchTerm) || 
      video.description.toLowerCase().includes(searchTerm)
    );
  }
  
  return filteredVideos;
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);


