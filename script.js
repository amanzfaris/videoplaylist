document.addEventListener('DOMContentLoaded', () => {
    const buttonClickSound = new Audio('../asounds/click.wav');
    const voiceOver = new Audio('../asounds/theme.wav');
    let soundEnabled = false;
    
    const welcomeBox = document.getElementById('welcomeBox');
    const startButton = document.getElementById('startButton');
    const playButton = document.getElementById('playButton');
    const messageBox = document.getElementById('messageBox');

    // Initially hide the play button
    playButton.style.display = 'none';

    // Show message box on page load
    messageBox.classList.add('active');

    // Hide message box when clicked and play sounds
    messageBox.addEventListener('click', async () => {
        messageBox.classList.remove('active');
        // Add display none after animation
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 300); // Match this with your CSS transition time
        
        // Show play button immediately
        playButton.style.display = 'block';
        
        soundEnabled = true;
        
        // Play click sound first
        await playSound(buttonClickSound);
        
        // Wait 2 seconds before playing theme sound
        setTimeout(async () => {
            await playSound(voiceOver);
        }, 500);
    });

    playButton.addEventListener('click', () => {
        welcomeBox.classList.add('active');
        playSound(buttonClickSound);
    });

    startButton.addEventListener('click', async () => {
        welcomeBox.classList.remove('active');
        
        // Play click sound first
        await playSound(buttonClickSound);
        
        // Start fade out transition
        document.body.style.opacity = '0';
        
        // Navigate to loading page after fade
        setTimeout(() => {
            window.location.href = '../zloading/loading.html';
        }, 500);
    });

    // Function to play sounds with enhanced error handling
    const playSound = async (sound) => {
        try {
            sound.currentTime = 0;
            if (sound === voiceOver) {
                sound.volume = 0.3; // Lower volume for theme sound
            } else {
                sound.volume = 1.0;
            }
            const playPromise = await sound.play();
            return playPromise;
        } catch (error) {
            console.error('Sound play failed:', error.message);
        }
    };
});









