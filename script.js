document.addEventListener('DOMContentLoaded', () => {
    console.log("Birthday Surprise Website: DOM fully loaded and parsed.");

    // --- Configuration ---
    const CONFIG = {
        TELEGRAM_BOT_TOKEN: '7900988090:AAHj8y3ji9PdbJ3r7bvsyfFWvstRjCTk_e8', // !!! IMPORTANT: Replace with your bot token !!!
        TELEGRAM_CHAT_ID: '6130159483',   // !!! IMPORTANT: Replace with your chat ID !!!
        SECRET_LETTER_PASSWORD: 'cibinmon', // !!! IMPORTANT: Replace with your actual secret phrase !!!
        PUZZLE_IMAGE_URL: 'https://raw.githubusercontent.com/cibinanoop/Birthday/refs/heads/main/assets/puzzle.jpg', // Replace with your actual puzzle image
        PUZZLE_COLUMNS: 3, // Number of columns for the puzzle grid
        PUZZLE_ROWS: 3,    // Number of rows for the puzzle grid
        RIDDLES: [
            { question: 'I have cities, but no houses; forests, but no trees; and water, but no fish. What am I?', answer: 'map' },
            { question: 'What has an eye, but cannot see?', answer: 'needle' },
            { question: 'What is always in front of you but can’t be seen?', answer: 'future' }
        ],
        GIFT_VIDEO_EMBED_URL: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with your actual gift video URL (YouTube, etc.)
        LOCAL_GIFT_VIDEO_URL: 'your-surprise-video.mp4' // If you use a local video for the gift
    };

    // --- Element Selectors ---
    const startButton = document.getElementById('startButton');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const heroSection = document.getElementById('hero');
    const mainContent = document.getElementById('mainContent');

    const puzzleCanvas = document.getElementById('puzzleCanvas');
    const shufflePuzzleButton = document.getElementById('shufflePuzzle');
    const puzzleSolvedMessage = document.getElementById('puzzleSolvedMessage');

    const riddleContainer = document.getElementById('riddleContainer');
    const giftReveal = document.getElementById('giftReveal');
    const giftVideoIframe = giftReveal ? giftReveal.querySelector('iframe') : null;

    const letterPasswordInput = document.getElementById('letterPassword');
    const unlockLetterButton = document.getElementById('unlockLetterButton');
    const secretLetterContent = document.getElementById('secretLetterContent');
    const letterFeedback = document.getElementById('letterFeedback');

    const wishSenderNameInput = document.getElementById('wishSenderName');
    const birthdayWishTextInput = document.getElementById('birthdayWishText');
    const submitWishButton = document.getElementById('submitWishButton');
    const wishesContainer = document.getElementById('wishesContainer'); // For static content, but still good to have

    const mediaSenderNameInput = document.getElementById('mediaSenderName');
    const mediaFileInput = document.getElementById('mediaFileInput');
    const fileListPreview = document.getElementById('fileListPreview');
    const submitMediaButton = document.getElementById('submitMediaButton');
    const sharedMediaContainer = document.getElementById('sharedMediaContainer'); // For static content

    const loaderOverlay = document.getElementById('loaderOverlay');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const modalMessage = document.getElementById('modalMessage');

    // Store selected files temporarily
    let selectedFiles = [];

    // --- Helper Functions ---

    function showLoader() {
        loaderOverlay.classList.remove('hidden');
    }

    function hideLoader() {
        loaderOverlay.classList.add('hidden');
    }

    function showConfirmationModal(message = "Your submission was successful!") {
        modalMessage.textContent = message;
        confirmationModal.classList.remove('hidden');
        confirmationModal.querySelector('.modal-content').classList.remove('opacity-0', 'scale-95');
        confirmationModal.querySelector('.modal-content').classList.add('opacity-100', 'scale-100');
    }

    function hideConfirmationModal() {
        confirmationModal.querySelector('.modal-content').classList.remove('opacity-100', 'scale-100');
        confirmationModal.querySelector('.modal-content').classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            confirmationModal.classList.add('hidden');
        }, 300); // Allow transition to complete
    }

    closeModalButton.addEventListener('click', hideConfirmationModal);


    async function sendTelegramMessage(textMessage) {
        if (!CONFIG.TELEGRAM_BOT_TOKEN || !CONFIG.TELEGRAM_CHAT_ID ||
            CONFIG.TELEGRAM_BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN' ||
            CONFIG.TELEGRAM_CHAT_ID === 'YOUR_TELEGRAM_CHAT_ID') {
            console.warn("Telegram bot token or chat ID not configured. Skipping Telegram message.");
            return false;
        }

        const telegramApiUrl = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
        try {
            const response = await fetch(telegramApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CONFIG.TELEGRAM_CHAT_ID,
                    text: textMessage,
                    parse_mode: 'HTML'
                }),
            });
            const data = await response.json();
            if (data.ok) {
                console.log('Telegram text message sent successfully!');
                return true;
            } else {
                console.error('Failed to send Telegram text message:', data.description);
                return false;
            }
        } catch (error) {
            console.error('Error sending Telegram text message:', error);
            return false;
        }
    }

    // New: Function to send a file (photo/video/document) to Telegram
    async function sendTelegramFile(file, caption, fileType = 'document') { // fileType can be 'photo', 'video', 'document'
        if (!CONFIG.TELEGRAM_BOT_TOKEN || !CONFIG.TELEGRAM_CHAT_ID ||
            CONFIG.TELEGRAM_BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN' ||
            CONFIG.TELEGRAM_CHAT_ID === 'YOUR_TELEGRAM_CHAT_ID') {
            console.warn("Telegram bot token or chat ID not configured. Skipping Telegram file send.");
            return false;
        }

        let endpoint = '';
        if (fileType === 'photo') {
            endpoint = 'sendPhoto';
        } else if (fileType === 'video') {
            endpoint = 'sendVideo';
        } else {
            endpoint = 'sendDocument'; // Default for other file types or large files
        }

        const telegramApiUrl = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/${endpoint}`;
        const formData = new FormData();
        formData.append('chat_id', CONFIG.TELEGRAM_CHAT_ID);
        formData.append(fileType, file); // Use 'photo', 'video', or 'document' as the field name
        formData.append('caption', caption);

        try {
            const response = await fetch(telegramApiUrl, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.ok) {
                console.log(`Telegram ${fileType} sent successfully!`);
                return true;
            } else {
                console.error(`Failed to send Telegram ${fileType}:`, data.description);
                // Telegram might reject large files or specific formats
                if (data.description.includes("FILE_TOO_BIG")) {
                    alert(`Error: The file "${file.name}" is too large for Telegram (max 50MB for documents, less for photos/videos). Please try a smaller file.`);
                } else {
                    alert(`Error sending file "${file.name}": ${data.description}`);
                }
                return false;
            }
        } catch (error) {
            console.error(`Error sending Telegram ${fileType}:`, error);
            alert(`Network error or problem sending file "${file.name}". Check console for details.`);
            return false;
        }
    }


    // --- 1. Cinematic Intro & Music Control ---
    if (startButton && mainContent && heroSection && backgroundMusic) {
        startButton.addEventListener('click', () => {
            console.log("Start button clicked. Initiating intro transition.");
            heroSection.classList.add('fade-out');

            backgroundMusic.volume = 0.3;
            backgroundMusic.play().then(() => {
                console.log("Background music started.");
            }).catch(error => {
                console.warn("Background music autoplay prevented:", error);
            });

            setTimeout(() => {
                heroSection.style.display = 'none';
                mainContent.classList.remove('hidden');
                mainContent.classList.add('fade-in-content');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1000);
        });
    }

// --- 2. Puzzle Game Logic ---
    let puzzleImage = new Image();
    let puzzlePieces = [];
    let puzzleWidth, puzzleHeight, pieceWidth, pieceHeight;
    let isPuzzleSolved = false;
    let selectedPiece = null; // Stores the first piece clicked for a swap

    // Ensure puzzle elements exist before trying to manipulate them
    if (puzzleCanvas && shufflePuzzleButton && puzzleSolvedMessage) {
        const ctx = puzzleCanvas.getContext('2d'); // Get the 2D rendering context for the canvas

        // When the puzzle image loads, initialize and shuffle the puzzle
        puzzleImage.onload = () => {
            // Set canvas dimensions to match the image for drawing accuracy
            puzzleCanvas.width = puzzleImage.width;
            puzzleCanvas.height = puzzleImage.height;
            puzzleWidth = puzzleCanvas.width;
            puzzleHeight = puzzleCanvas.height;

            // Calculate dimensions of each puzzle piece
            pieceWidth = puzzleWidth / CONFIG.PUZZLE_COLUMNS;
            pieceHeight = puzzleHeight / CONFIG.PUZZLE_ROWS;

            initPuzzle();    // Create the initial pieces
            shufflePuzzle(); // Randomize their positions
        };
        // Set the source of the puzzle image from your configuration
        puzzleImage.src = CONFIG.PUZZLE_IMAGE_URL;

        /**
         * Initializes the puzzle pieces, creating an array of objects.
         * Each object stores its original position (where it *should* be)
         * and its current position (where it *is* on the shuffled canvas).
         */
        function initPuzzle() {
            puzzlePieces = []; // Clear any existing pieces
            for (let r = 0; r < CONFIG.PUZZLE_ROWS; r++) {
                for (let c = 0; c < CONFIG.PUZZLE_COLUMNS; c++) {
                    puzzlePieces.push({
                        id: r * CONFIG.PUZZLE_COLUMNS + c, // Unique ID for each piece (0 to total_pieces-1)
                        originalCol: c,                    // The correct column for this piece
                        originalRow: r,                    // The correct row for this piece
                        currentCol: c,                     // Its current column (initially correct)
                        currentRow: r                      // Its current row (initially correct)
                    });
                }
            }
            isPuzzleSolved = false; // Reset the solved state
        }

        /**
         * Shuffles the puzzle by randomly reassigning the 'currentCol' and 'currentRow'
         * properties among the pieces.
         */
        function shufflePuzzle() {
            // Iterate backwards to ensure efficient swapping without re-shuffling already processed items
            for (let i = puzzlePieces.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1)); // Pick a random index from 0 to i

                // Swap the current positions (col, row) of piece i and piece j
                // This effectively shuffles where each *original* piece is currently located
                [puzzlePieces[i].currentCol, puzzlePieces[i].currentRow,
                 puzzlePieces[j].currentCol, puzzlePieces[j].currentRow] =
                [puzzlePieces[j].currentCol, puzzlePieces[j].currentRow,
                 puzzlePieces[i].currentCol, puzzlePieces[i].currentRow];
            }
            selectedPiece = null; // Clear any piece that might have been selected before shuffling
            isPuzzleSolved = false;
            puzzleSolvedMessage.classList.add('hidden'); // Hide the solved message
            drawPuzzle(); // Redraw the shuffled puzzle
        }

        /**
         * Draws the current state of the puzzle pieces onto the canvas.
         * Pieces are drawn based on their 'original' source rectangle on the image
         * and their 'current' destination rectangle on the canvas.
         */
        function drawPuzzle() {
            ctx.clearRect(0, 0, puzzleWidth, puzzleHeight); // Clear the entire canvas
            puzzlePieces.forEach(piece => {
                const sourceX = piece.originalCol * pieceWidth;   // X-coordinate on the original image
                const sourceY = piece.originalRow * pieceHeight;  // Y-coordinate on the original image
                const destX = piece.currentCol * pieceWidth;      // X-coordinate on the canvas where it's drawn
                const destY = piece.currentRow * pieceHeight;     // Y-coordinate on the canvas where it's drawn

                // Draw a slice of the original image to its current position on the canvas
                ctx.drawImage(
                    puzzleImage,
                    sourceX, sourceY, pieceWidth, pieceHeight, // Source rectangle (x, y, width, height)
                    destX, destY, pieceWidth, pieceHeight      // Destination rectangle (x, y, width, height)
                );

                // If this piece is currently selected, draw a yellow highlight around it
                if (selectedPiece && selectedPiece.id === piece.id) {
                    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)'; // Yellow, semi-transparent
                    ctx.lineWidth = 4; // Thickness of the border
                    ctx.strokeRect(destX, destY, pieceWidth, pieceHeight); // Draw border around the piece
                }
            });
        }

        /**
         * Normalizes event coordinates (for both mouse and touch) to the canvas's internal pixel dimensions.
         * This accounts for CSS scaling of the canvas element.
         * @param {Event} event - The mouse or touch event object.
         * @param {DOMRect} canvasRect - The bounding client rect of the canvas.
         * @param {number} canvasWidth - The intrinsic width of the canvas (puzzleCanvas.width).
         * @param {number} canvasHeight - The intrinsic height of the canvas (puzzleCanvas.height).
         * @returns {{mouseX: number, mouseY: number}} - Object with x and y coordinates relative to canvas.
         */
        function getEventCoords(event, canvasRect, canvasWidth, canvasHeight) {
            let clientX, clientY;
            if (event.touches && event.touches.length > 0) {
                // For touch events, use the coordinates of the first touch point
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else {
                // For mouse events, use clientX/Y directly
                clientX = event.clientX;
                clientY = event.clientY;
            }

            // Calculate scaling factors if the CSS size is different from the canvas's internal size
            const scaleX = canvasWidth / canvasRect.width;
            const scaleY = canvasHeight / canvasRect.height;

            // Adjust client coordinates to be relative to the canvas and scaled
            const mouseX = (clientX - canvasRect.left) * scaleX;
            const mouseY = (clientY - canvasRect.top) * scaleY;

            return { mouseX, mouseY };
        }

        /**
         * Main handler for both mouse (mousedown) and touch (touchstart) events on the puzzle canvas.
         * It manages selecting pieces and swapping them.
         * @param {Event} event - The triggered event object.
         */
        function handlePuzzleInteraction(event) {
            // Prevent default browser actions (like scrolling/zooming on mobile touch)
            event.preventDefault();

            if (isPuzzleSolved) return; // Do nothing if the puzzle is already solved

            const rect = puzzleCanvas.getBoundingClientRect(); // Get current size and position of canvas
            // Get normalized coordinates from the event
            const { mouseX, mouseY } = getEventCoords(event, rect, puzzleCanvas.width, puzzleCanvas.height);

            // Determine which grid cell was clicked/tapped
            const clickedCol = Math.floor(mouseX / pieceWidth);
            const clickedRow = Math.floor(mouseY / pieceHeight);

            // Find the puzzle piece that is CURRENTLY occupying the clicked grid position
            const clickedPiece = puzzlePieces.find(p =>
                p.currentCol === clickedCol && p.currentRow === clickedRow
            );

            if (clickedPiece) {
                if (!selectedPiece) {
                    // If no piece is currently selected, select this one
                    selectedPiece = clickedPiece;
                } else if (selectedPiece.id !== clickedPiece.id) {
                    // If a different piece is already selected, perform the swap

                    // It's important to find the actual piece objects from the main array
                    // using their IDs, as 'selectedPiece' might be a stale reference if the
                    // array was re-filtered or re-ordered somewhere else (though not in this code).
                    const piece1 = puzzlePieces.find(p => p.id === selectedPiece.id);
                    const piece2 = puzzlePieces.find(p => p.id === clickedPiece.id);

                    if (piece1 && piece2) {
                        // Swap the 'currentCol' and 'currentRow' properties of the two pieces
                        const tempCol = piece1.currentCol;
                        const tempRow = piece1.currentRow;

                        piece1.currentCol = piece2.currentCol;
                        piece1.currentRow = piece2.currentRow;

                        piece2.currentCol = tempCol;
                        piece2.currentRow = tempRow;
                    }

                    selectedPiece = null; // Deselect both pieces after swap
                    drawPuzzle(); // Redraw the canvas to show the swapped pieces
                    checkPuzzleSolved(); // Check if the puzzle is now solved
                } else {
                    // If the same piece was clicked twice, deselect it
                    selectedPiece = null;
                }
            }
            drawPuzzle(); // Always redraw to update highlights or after a swap
        }

        // Add event listeners for both mouse and touch interactions
        puzzleCanvas.addEventListener('mousedown', handlePuzzleInteraction);
        puzzleCanvas.addEventListener('touchstart', handlePuzzleInteraction);

        // Event listener for the shuffle button (remains click-based)
        shufflePuzzleButton.addEventListener('click', shufflePuzzle);

        /**
         * Checks if the puzzle is in its solved state.
         * A puzzle is solved if every piece's 'current' position matches its 'original' position.
         */
        function checkPuzzleSolved() {
            // The 'every()' method returns true if the callback returns true for all elements
            isPuzzleSolved = puzzlePieces.every(piece =>
                piece.currentCol === piece.originalCol && piece.currentRow === piece.originalRow
            );

            if (isPuzzleSolved) {
                console.log("Puzzle Solved!");
                puzzleSolvedMessage.classList.remove('hidden'); // Show the success message
                triggerConfetti(); // Trigger confetti celebration
            }
        }
    }

    // --- 3. Mystery Gift Unlocker Logic ---
    let currentRiddleIndex = 0;
    const riddleItems = riddleContainer ? riddleContainer.querySelectorAll('.riddle-item') : [];

    function showRiddle(index) {
        riddleItems.forEach((item, i) => {
            item.classList.add('hidden');
        });
        if (riddleItems[index]) {
            riddleItems[index].classList.remove('hidden');
            const input = riddleItems[index].querySelector('.riddle-input');
            const feedback = riddleItems[index].querySelector('.riddle-feedback');
            input.value = '';
            feedback.textContent = '';
            input.disabled = false;
            riddleItems[index].querySelector('.check-riddle').disabled = false;
        }
    }

    function checkRiddle(item, input, feedback, answer) {
        if (input.value.trim().toLowerCase() === answer.toLowerCase()) {
            feedback.textContent = 'Correct!';
            feedback.classList.remove('text-red-600');
            feedback.classList.add('text-green-600');
            input.disabled = true;
            item.querySelector('.check-riddle').disabled = true;

            currentRiddleIndex++;
            if (currentRiddleIndex < CONFIG.RIDDLES.length) {
                setTimeout(() => showRiddle(currentRiddleIndex), 1000);
            } else {
                setTimeout(() => {
                    riddleContainer.classList.add('hidden');
                    giftReveal.classList.remove('hidden');
                    if (giftVideoIframe && CONFIG.GIFT_VIDEO_EMBED_URL) {
                        giftVideoIframe.src = CONFIG.GIFT_VIDEO_EMBED_URL;
                    } else if (giftReveal.querySelector('video') && CONFIG.LOCAL_GIFT_VIDEO_URL) {
                        giftReveal.querySelector('video').src = CONFIG.LOCAL_GIFT_VIDEO_URL;
                        giftReveal.querySelector('video').load();
                        // Autoplay might be blocked without user interaction.
                        giftReveal.querySelector('video').play().catch(e => console.log("Video autoplay blocked:", e));
                    }
                    triggerConfetti();
                }, 1000);
            }
        } else {
            feedback.textContent = 'Incorrect. Try again!';
            feedback.classList.remove('text-green-600');
            feedback.classList.add('text-red-600');
        }
    }

    if (riddleContainer && riddleItems.length > 0) {
        riddleItems.forEach((item, index) => {
            const riddleData = CONFIG.RIDDLES[index];
            if (riddleData) {
                item.querySelector('p.text-xl').textContent = `Riddle ${index + 1}: ${riddleData.question}`;
                item.dataset.answer = riddleData.answer;
            } else {
                item.remove();
            }
        });

        riddleItems.forEach((item, index) => {
            const input = item.querySelector('.riddle-input');
            const checkButton = item.querySelector('.check-riddle');
            const feedback = item.querySelector('.riddle-feedback');
            const answer = item.dataset.answer;

            if (checkButton) {
                checkButton.addEventListener('click', () => {
                    checkRiddle(item, input, feedback, answer);
                });
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        checkRiddle(item, input, feedback, answer);
                    }
                });
            }
        });

        showRiddle(currentRiddleIndex);
    }


    // --- 4. Password-Protected Letter Logic ---
    if (letterPasswordInput && unlockLetterButton && secretLetterContent && letterFeedback) {
        unlockLetterButton.addEventListener('click', () => {
            if (letterPasswordInput.value === CONFIG.SECRET_LETTER_PASSWORD) {
                secretLetterContent.classList.remove('hidden');
                letterFeedback.classList.add('hidden');
                triggerConfetti();
            } else {
                secretLetterContent.classList.add('hidden');
                letterFeedback.textContent = 'Incorrect phrase. Try again!';
                letterFeedback.classList.remove('hidden');
            }
        });
        letterPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                unlockLetterButton.click();
            }
        });
    }

    // --- 5. Public Message Wall Logic (Frontend-Only with Telegram Notification) ---
    if (submitWishButton && wishSenderNameInput && birthdayWishTextInput) {
        submitWishButton.addEventListener('click', async () => {
            const name = wishSenderNameInput.value.trim();
            const message = birthdayWishTextInput.value.trim();

            if (name && message) {
                const formattedMessage = `
🎉 New Birthday Wish for Jinimol!

Sender: <b>${name}</b>
Message: <i>${message}</i>
Time: ${new Date().toLocaleString()}
                `.trim();

                showLoader();
                const success = await sendTelegramMessage(formattedMessage);
                hideLoader();

                if (success) {
                    wishSenderNameInput.value = '';
                    birthdayWishTextInput.value = '';
                    showConfirmationModal('Your wish has been sent to Jinimol');
                    triggerConfetti();
                } else {
                    alert('Failed to send your wish. Please try again.');
                }
            } else {
                alert('Please enter your name and a birthday wish!');
            }
        });
    }

    // --- 6. Share Media Section Logic (Frontend-Only with Telegram Notification) ---
    if (submitMediaButton && mediaSenderNameInput && mediaFileInput && fileListPreview) {

        // Handle file selection and preview
        mediaFileInput.addEventListener('change', () => {
            fileListPreview.innerHTML = ''; // Clear previous list
            selectedFiles = []; // Reset selected files array

            if (mediaFileInput.files.length > 0) {
                for (let i = 0; i < mediaFileInput.files.length; i++) {
                    const file = mediaFileInput.files[i];
                    selectedFiles.push(file);

                    const fileItem = document.createElement('div');
                    fileItem.classList.add('file-preview-item', 'bg-purple-100', 'p-2', 'rounded-md', 'flex', 'items-center', 'justify-between', 'mb-2');
                    fileItem.innerHTML = `
                        <span>${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button type="button" class="remove-file text-red-500 hover:text-red-700 font-bold ml-4" data-index="${i}">&times;</button>
                    `;
                    fileListPreview.appendChild(fileItem);
                }
            }
        });

        // Handle removing files from the preview list (and selectedFiles array)
        fileListPreview.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-file')) {
                const indexToRemove = parseInt(event.target.dataset.index);

                // Create a new FileList without the removed item
                const dt = new DataTransfer();
                for (let i = 0; i < mediaFileInput.files.length; i++) {
                    if (i !== indexToRemove) {
                        dt.items.add(mediaFileInput.files[i]);
                    }
                }
                mediaFileInput.files = dt.files; // Update the file input's files

                // Trigger change event to update the preview
                const changeEvent = new Event('change');
                mediaFileInput.dispatchEvent(changeEvent);
            }
        });


        submitMediaButton.addEventListener('click', async () => {
            const name = mediaSenderNameInput.value.trim();
            if (!name) {
                alert('Please enter your name!');
                return;
            }

            if (selectedFiles.length === 0) {
                alert('Please select at least one image or video to share!');
                return;
            }

            showLoader();
            let allSentSuccessfully = true;

            for (const file of selectedFiles) {
                let fileType = 'document';
                if (file.type.startsWith('image/')) {
                    fileType = 'photo';
                } else if (file.type.startsWith('video/')) {
                    fileType = 'video';
                }

                const caption = `
📸 New Media for Jinimol!

Sender: <b>${name}</b>
Filename: ${file.name}
Type: ${fileType.charAt(0).toUpperCase() + fileType.slice(1)}
Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
Time: ${new Date().toLocaleString()}
                `.trim();

                const sent = await sendTelegramFile(file, caption, fileType);
                if (!sent) {
                    allSentSuccessfully = false;
                    // Don't break, try to send other files if one fails
                }
            }

            hideLoader();

            if (allSentSuccessfully) {
                mediaSenderNameInput.value = '';
                mediaFileInput.value = ''; // Clear the file input
                fileListPreview.innerHTML = ''; // Clear the preview
                selectedFiles = []; // Clear the internal array
                showConfirmationModal('Your memories have been successfully sent to Jinimol!');
                triggerConfetti();
            } else {
                showConfirmationModal('Some memories could not be sent. Please check the console for errors and file sizes.');
            }
        });
    }

    // --- Visitor Notification on Load ---
    (async () => {
        let ipAddress = 'Unknown IP';
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            ipAddress = ipData.ip;
        } catch (error) {
            console.error('Could not fetch IP address:', error);
        }

        const userAgent = navigator.userAgent;
        const timestamp = new Date().toLocaleString();

        const message = `
🎉 Someone just visited the Birthday Website!

🕒 Time: ${timestamp}
🌐 IP: ${ipAddress}
🧭 Device: ${userAgent}
        `.trim();

        await sendTelegramMessage(message);
    })();


    // --- General Utility: Confetti ---
    function triggerConfetti() {
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#a78bfa', '#ec4899', '#fde047', '#f472b6']
            });
            console.log("Confetti triggered!");
        } else {
            console.warn("Confetti library not loaded. Add <script src='https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js'></script> to index.html");
        }
    }

    // --- Smooth Scroll for Navigation ---
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

});
