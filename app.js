// Map note names to their audio frequencies (Hz)
const frequencies = {
    'C': 523.25, 'Db': 554.37, 'D': 587.33, 'Eb': 622.25, 'E': 659.25,
    'F': 698.46, 'G': 783.99, 'A': 440.00, 'Bb': 466.16, 'B': 493.88
};

// Map note names to vertical pixel heights on our canvas staff
const noteHeights = {
    'C': 130, 'Db': 120, 'D': 120, 'Eb': 110, 'E': 110,
    'F': 100, 'G': 90,  'A': 80,  'Bb': 70,  'B': 70
};

let currentPlayingIndex = -1;
let tracksPlayed = [];
let currentNotes = []; // Keep a reference to current notes for redrawing

function generateAndPlay() {
    const text = document.getElementById('userInput').value.toUpperCase();
    const method = document.getElementById('methodSelect').value;
    currentNotes = [];

    if (method === 'french') {
        const grid = {
            'A':'A', 'H':'A', 'O':'A', 'V':'A', 'B':'B', 'I':'B', 'P':'B', 'W':'B',
            'C':'C', 'J':'C', 'Q':'C', 'X':'C', 'D':'D', 'K':'D', 'R':'D', 'Y':'D',
            'E':'E', 'L':'E', 'S':'E', 'Z':'E', 'F':'F', 'M':'F', 'T':'F', 'G':'G', 'N':'G', 'U':'G'
        };
        for (let char of text) { if (grid[char]) currentNotes.push(grid[char]); }
    } else {
        const german = {'H': 'B', 'B': 'Bb', 'S': 'Eb', 'E': 'E', 'A': 'A', 'C': 'C', 'D': 'D', 'F': 'F', 'G': 'G'};
        for (let char of text) { if (german[char]) currentNotes.push(german[char]); }
    }

    document.getElementById('output').innerText = currentNotes.join('  ');

    currentPlayingIndex = -1;
    tracksPlayed = new Array(currentNotes.length).fill(false);

    drawStaff(currentNotes);
    playMelodySequence(currentNotes);
}

function drawStaff(notes) {
    const canvas = document.getElementById('staffCanvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw 5 staff lines
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        let y = 60 + (i * 15);
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(380, y);
        ctx.stroke();
    }

    let startX = 50;
    let spacingX = 40;

    notes.forEach((note, index) => {
        let x = startX + (index * spacingX);
        let y = noteHeights[note] || 90;

        if (x < canvas.width - 30) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#000000';

            if (index === currentPlayingIndex) {
                ctx.fillStyle = '#000000';
            } else if (tracksPlayed[index] === true) {
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.fillStyle = '#dddddd';
            }

            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Text placement changed to sit ABOVE the note circle
            ctx.fillStyle = '#333';
            ctx.font = index === currentPlayingIndex ? 'bold 12px sans-serif' : '12px sans-serif';
            ctx.textAlign = 'center'; // Centers text over the circle perfectly
            ctx.fillText(note, x, y - 14);
        }
    });
}

function playMelodySequence(notes) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    let time = audioCtx.currentTime;
    const noteDuration = 0.5;

    notes.forEach((note, index) => {
        if (frequencies[note]) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequencies[note], time);

            gain.gain.setValueAtTime(0.4, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + noteDuration - 0.1);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(time);
            osc.stop(time + noteDuration);

            const startDelay = (time - audioCtx.currentTime) * 1000;
            setTimeout(() => {
                currentPlayingIndex = index;
                drawStaff(notes);
            }, startDelay);

            const endDelay = ((time + noteDuration) - audioCtx.currentTime) * 1000;
            setTimeout(() => {
                tracksPlayed[index] = true;
                if (currentPlayingIndex === index) {
                    currentPlayingIndex = -1;
                }
                drawStaff(notes);
            }, endDelay);

            time += noteDuration;
        }
    });
}

// Clear input field, empty notes list, and wipe the staff clean
function resetApp() {
    document.getElementById('userInput').value = '';
    document.getElementById('output').innerText = '---';
    currentNotes = [];
    tracksPlayed = [];
    currentPlayingIndex = -1;
    drawStaff([]); // Re-draws empty lines
}

window.onload = () => { drawStaff([]); };
