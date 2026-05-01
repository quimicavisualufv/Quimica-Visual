import React, { StrictMode, useState, useEffect, useRef, useMemo } from '../vendor/esm/165657ceb040a70fb178.mjs';
    import { createRoot } from '../vendor/esm/c2bf345ca787d044f7c8.mjs';
    import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from '../vendor/esm/a704dae695af8191e215.mjs';
    import { MeshPhysicalMaterial, MeshStandardMaterial, Group, DoubleSide } from '../vendor/esm/f81291fe84ec02e0ba5d.mjs';
    import { Canvas, useFrame } from '../vendor/esm/a8accaddd22d9ad368dd.mjs';
    import { OrbitControls, Environment, ContactShadows, Text, Billboard } from '../vendor/esm/93921314bcf8d5e5d189.mjs';
    import { Chess } from '../vendor/esm/d46699019a86e2da6d3d.mjs';

    const WORKER_CHESS_URL = new URL("../vendor/esm/d46699019a86e2da6d3d.mjs", import.meta.url).href;
const WORKER_SOURCE = "import { Chess } from '" + WORKER_CHESS_URL + "';\n// Chess piece evaluation tables and minimax implementation\n\n// Piece values\nconst PIECE_VALUES = {\n    p: 100,\n    n: 320,\n    b: 330,\n    r: 500,\n    q: 900,\n    k: 20000,\n};\n// Simplified Piece-Square Tables (PST) for positional evaluation\n// These give bonuses to pieces on certain squares (center control, development, etc.)\nconst PST_PAWN = [\n    [0, 0, 0, 0, 0, 0, 0, 0],\n    [50, 50, 50, 50, 50, 50, 50, 50],\n    [10, 10, 20, 30, 30, 20, 10, 10],\n    [5, 5, 10, 25, 25, 10, 5, 5],\n    [0, 0, 0, 20, 20, 0, 0, 0],\n    [5, -5, -10, 0, 0, -10, -5, 5],\n    [5, 10, 10, -20, -20, 10, 10, 5],\n    [0, 0, 0, 0, 0, 0, 0, 0]\n];\nconst PST_KNIGHT = [\n    [-50, -40, -30, -30, -30, -30, -40, -50],\n    [-40, -20, 0, 0, 0, 0, -20, -40],\n    [-30, 0, 10, 15, 15, 10, 0, -30],\n    [-30, 5, 15, 20, 20, 15, 5, -30],\n    [-30, 0, 15, 20, 20, 15, 0, -30],\n    [-30, 5, 10, 15, 15, 10, 5, -30],\n    [-40, -20, 0, 5, 5, 0, -20, -40],\n    [-50, -40, -30, -30, -30, -30, -40, -50]\n];\nfunction evaluateBoard(chess) {\n    let totalEvaluation = 0;\n    const board = chess.board();\n    for (let r = 0; r < 8; r++) {\n        for (let c = 0; c < 8; c++) {\n            const piece = board[r][c];\n            if (piece) {\n                const val = PIECE_VALUES[piece.type];\n                let pstScore = 0;\n                // Add positional score based on piece and color\n                const rankPST = piece.color === 'w' ? r : 7 - r;\n                if (piece.type === 'p')\n                    pstScore = PST_PAWN[rankPST][c];\n                else if (piece.type === 'n')\n                    pstScore = PST_KNIGHT[rankPST][c];\n                // Keep it simplified for others to save compute, could add them if needed\n                const score = val + pstScore;\n                totalEvaluation += piece.color === 'w' ? score : -score;\n            }\n        }\n    }\n    return totalEvaluation;\n}\nfunction minimax(chess, depth, alpha, beta, isMaximizingPlayer) {\n    if (depth === 0) {\n        return evaluateBoard(chess);\n    }\n    const moves = chess.moves({ verbose: true });\n    if (moves.length === 0) {\n        if (chess.isCheckmate()) {\n            return isMaximizingPlayer ? -99999 : 99999;\n        }\n        return 0; // Stalemate\n    }\n    // Move ordering: put captures first to improve alpha-beta pruning\n    moves.sort((a, b) => {\n        let scoreA = a.captured ? PIECE_VALUES[a.captured] : 0;\n        let scoreB = b.captured ? PIECE_VALUES[b.captured] : 0;\n        return scoreB - scoreA;\n    });\n    if (isMaximizingPlayer) {\n        let bestVal = -Infinity;\n        for (const move of moves) {\n            chess.move(move);\n            const val = minimax(chess, depth - 1, alpha, beta, !isMaximizingPlayer);\n            chess.undo();\n            bestVal = Math.max(bestVal, val);\n            alpha = Math.max(alpha, bestVal);\n            if (beta <= alpha) {\n                break;\n            }\n        }\n        return bestVal;\n    }\n    else {\n        let bestVal = Infinity;\n        for (const move of moves) {\n            chess.move(move);\n            const val = minimax(chess, depth - 1, alpha, beta, !isMaximizingPlayer);\n            chess.undo();\n            bestVal = Math.min(bestVal, val);\n            beta = Math.min(beta, bestVal);\n            if (beta <= alpha) {\n                break;\n            }\n        }\n        return bestVal;\n    }\n}\nfunction getBestMove(fen, difficulty) {\n    const chess = new Chess(fen);\n    const moves = chess.moves({ verbose: true });\n    if (moves.length === 0)\n        return null;\n    // Difficulty Mapping\n    // Facil: Pick a random move, sometimes evaluating 1 depth.\n    if (difficulty === 'Fácil') {\n        if (Math.random() > 0.5) {\n            return moves[Math.floor(Math.random() * moves.length)].san;\n        }\n        // else depth 1\n        return calculateBest(chess, moves, 1);\n    }\n    // Medio: Depth 2\n    else if (difficulty === 'Médio') {\n        return calculateBest(chess, moves, 2);\n    }\n    // Dificil: Depth 3\n    else if (difficulty === 'Difícil') {\n        return calculateBest(chess, moves, 3);\n    }\n    // Profissional: Depth 4 (will take up to a few seconds in JS)\n    else {\n        return calculateBest(chess, moves, 4);\n    }\n}\nfunction calculateBest(chess, moves, depth) {\n    let bestMove = null;\n    let bestValue = chess.turn() === 'w' ? -Infinity : Infinity;\n    // Sort moves for better pruning\n    moves.sort((a, b) => {\n        return (b.captured ? 1 : 0) - (a.captured ? 1 : 0);\n    });\n    for (const move of moves) {\n        chess.move(move);\n        const boardValue = minimax(chess, depth - 1, -Infinity, Infinity, chess.turn() === 'w');\n        chess.undo();\n        if (chess.turn() === 'w') {\n            if (boardValue > bestValue) {\n                bestValue = boardValue;\n                bestMove = move;\n            }\n        }\n        else {\n            if (boardValue < bestValue) {\n                bestValue = boardValue;\n                bestMove = move;\n            }\n        }\n    }\n    return (bestMove || moves[Math.floor(Math.random() * moves.length)]).san;\n}\nself.onmessage = (e) => {\n    const { fen, difficulty } = e.data;\n    try {\n        const bestMove = getBestMove(fen, difficulty);\n        self.postMessage({ bestMove });\n    }\n    catch (err) {\n        self.postMessage({ bestMove: null, error: err });\n    }\n};";
    const AI_WORKER_URL = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));

    const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
function ChessBoardFloor({ onSquareClick, highlightedSquares }) {
    const squares = [];
    // Tiled board layout
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const isLight = (rank + file) % 2 !== 0;
            const squareName = `${FILES[file]}${8 - rank}`;
            const highlighted = highlightedSquares.includes(squareName);
            // Centered coordinates:
            // a1 is (-3.5, -3.5), h8 is (3.5, 3.5)
            const x = file - 3.5;
            const z = rank - 3.5;
            // Lab tile theme: White and dark gray tiles
            let color = isLight ? '#e2e2e2' : '#333333';
            if (highlighted) {
                color = isLight ? '#aadaaa' : '#5a8a5a'; // Highlight valid moves with green tint
            }
            squares.push(_jsxs("mesh", { position: [x, -0.05, z], rotation: [-Math.PI / 2, 0, 0], onClick: (e) => {
                    e.stopPropagation();
                    onSquareClick(squareName);
                }, children: [_jsx("planeGeometry", { args: [1, 1] }), _jsx("meshStandardMaterial", { color: color })] }, squareName));
        }
    }
    return (_jsxs("group", { children: [squares, _jsxs("mesh", { position: [0, -0.3, 0], receiveShadow: true, children: [_jsx("boxGeometry", { args: [8.4, 0.4, 8.4] }), _jsx("meshStandardMaterial", { color: "#1f1f1f" })] })] }));
}
// Convert Square to 3D position
function squareToPos(sq) {
    const file = FILES.indexOf(sq[0]);
    const rank = 8 - parseInt(sq[1], 10);
    return [file - 3.5, 0, rank - 3.5];
}

    const playGlassClink = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext)
            return;
        const ctx = new AudioContext();
        // Main high-pitch "tink"
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        // Second oscillator for complex harmonic
        const osc2 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();
        // White noise for the clatter
        const bufferSize = ctx.sampleRate * 0.1; // 100ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 5000;
        const noiseGain = ctx.createGain();
        // 1. Setup Tink
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3000 + Math.random() * 500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        // 2. Setup Harmonic
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(5000 + Math.random() * 400, ctx.currentTime);
        gainNode2.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc2.connect(gainNode2);
        gainNode2.connect(ctx.destination);
        // 3. Setup Noise click
        noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        // Play
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.08);
        noise.start(ctx.currentTime);
    }
    catch (e) {
        console.warn("Audio context failed", e);
    }
};
const playClickSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext)
            return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
    }
    catch (e) { }
};
const playGlassBreakSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext)
            return;
        const ctx = new AudioContext();
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(ctx.currentTime);
    }
    catch (e) { }
};
const playVictorySound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext)
            return;
        const ctx = new AudioContext();
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.5);
        });
    }
    catch (e) { }
};

    // Chess piece evaluation tables and minimax implementation

// Piece values
const PIECE_VALUES = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
};
// Simplified Piece-Square Tables (PST) for positional evaluation
// These give bonuses to pieces on certain squares (center control, development, etc.)
const PST_PAWN = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0]
];
const PST_KNIGHT = [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
];
function evaluateBoard(chess) {
    let totalEvaluation = 0;
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const val = PIECE_VALUES[piece.type];
                let pstScore = 0;
                // Add positional score based on piece and color
                const rankPST = piece.color === 'w' ? r : 7 - r;
                if (piece.type === 'p')
                    pstScore = PST_PAWN[rankPST][c];
                else if (piece.type === 'n')
                    pstScore = PST_KNIGHT[rankPST][c];
                // Keep it simplified for others to save compute, could add them if needed
                const score = val + pstScore;
                totalEvaluation += piece.color === 'w' ? score : -score;
            }
        }
    }
    return totalEvaluation;
}
function minimax(chess, depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0) {
        return evaluateBoard(chess);
    }
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) {
        if (chess.isCheckmate()) {
            return isMaximizingPlayer ? -99999 : 99999;
        }
        return 0; // Stalemate
    }
    // Move ordering: put captures first to improve alpha-beta pruning
    moves.sort((a, b) => {
        let scoreA = a.captured ? PIECE_VALUES[a.captured] : 0;
        let scoreB = b.captured ? PIECE_VALUES[b.captured] : 0;
        return scoreB - scoreA;
    });
    if (isMaximizingPlayer) {
        let bestVal = -Infinity;
        for (const move of moves) {
            chess.move(move);
            const val = minimax(chess, depth - 1, alpha, beta, !isMaximizingPlayer);
            chess.undo();
            bestVal = Math.max(bestVal, val);
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) {
                break;
            }
        }
        return bestVal;
    }
    else {
        let bestVal = Infinity;
        for (const move of moves) {
            chess.move(move);
            const val = minimax(chess, depth - 1, alpha, beta, !isMaximizingPlayer);
            chess.undo();
            bestVal = Math.min(bestVal, val);
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) {
                break;
            }
        }
        return bestVal;
    }
}
function getBestMove(fen, difficulty) {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0)
        return null;
    // Difficulty Mapping
    // Facil: Pick a random move, sometimes evaluating 1 depth.
    if (difficulty === 'Fácil') {
        if (Math.random() > 0.5) {
            return moves[Math.floor(Math.random() * moves.length)].san;
        }
        // else depth 1
        return calculateBest(chess, moves, 1);
    }
    // Medio: Depth 2
    else if (difficulty === 'Médio') {
        return calculateBest(chess, moves, 2);
    }
    // Dificil: Depth 3
    else if (difficulty === 'Difícil') {
        return calculateBest(chess, moves, 3);
    }
    // Profissional: Depth 4 (will take up to a few seconds in JS)
    else {
        return calculateBest(chess, moves, 4);
    }
}
function calculateBest(chess, moves, depth) {
    let bestMove = null;
    let bestValue = chess.turn() === 'w' ? -Infinity : Infinity;
    // Sort moves for better pruning
    moves.sort((a, b) => {
        return (b.captured ? 1 : 0) - (a.captured ? 1 : 0);
    });
    for (const move of moves) {
        chess.move(move);
        const boardValue = minimax(chess, depth - 1, -Infinity, Infinity, chess.turn() === 'w');
        chess.undo();
        if (chess.turn() === 'w') {
            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        }
        else {
            if (boardValue < bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        }
    }
    return (bestMove || moves[Math.floor(Math.random() * moves.length)]).san;
}

    function ChessPiece({ type, team, position, onClick, isHighlighted, isBreaking, themeId = 1 }) {
    const isWhite = team === 'w';
    const groupRef = useRef(null); // The outer translation root
    const pieceRotRef = useRef(null); // The inner rotation root for tipping
    const liquidRef = useRef(null);
    const puddleRef = useRef(null);
    // Create base glass material
    const material = useMemo(() => {
        // Only Frasco de Reagentes (Rooks in Theme 3) should be amber, the rest is standard clear glass.
        const isAmberGlass = themeId === 3 && type === 'r';
        return new MeshPhysicalMaterial({
            transmission: isAmberGlass ? 0.7 : 0.95,
            opacity: 1, // Opacities fade via breaking logic won't affect original material without instance duplication, so we scale instead
            transparent: true,
            metalness: 0,
            roughness: 0.05,
            ior: 1.5,
            thickness: 0.1, // lowered thickness for clear glass
            color: isAmberGlass ? '#b45309' : (isWhite ? '#ffffff' : '#e0e0e0'), // Amber tint
            clearcoat: 1,
            emissive: isHighlighted ? '#aaffaa' : '#000000',
            emissiveIntensity: isHighlighted ? 0.4 : 0,
            side: DoubleSide,
            depthWrite: false, // Prevents Z-fighting with inner liquid
        });
    }, [isWhite, isHighlighted, isBreaking, themeId, type]);
    // Opaque and vibrant liquid material
    const liquidMat = useMemo(() => {
        const isAmber = themeId === 3 && type === 'r';
        let color = isWhite ? '#10b981' : '#0ea5e9';
        let emissive = isWhite ? '#064e3b' : '#0f172a';
        let opacity = 0.85;
        if (isAmber) {
            // Apply a brownish/amber filter overlay logic
            color = isWhite ? '#3a4a15' : '#1d323b'; // much darker and muted
            emissive = isWhite ? '#172005' : '#0a151a';
            opacity = 0.95;
        }
        return new MeshStandardMaterial({
            color, // Vibrant Green and Deep Sky Blue normally
            transparent: true,
            opacity,
            roughness: 0.2,
            metalness: 0.1,
            side: DoubleSide, // ensure it's fully filled from all angles
            emissive,
            emissiveIntensity: isAmber ? 0.1 : 0.3
        });
    }, [isWhite, isBreaking, themeId, type]);
    useFrame((state, delta) => {
        if (!groupRef.current)
            return;
        if (isBreaking) {
            // Slower breaking: Sink down and fall over sharply
            if (pieceRotRef.current) {
                pieceRotRef.current.position.y -= 0.4 * delta;
                pieceRotRef.current.rotation.x += (Math.PI / 2 - pieceRotRef.current.rotation.x) * 4 * delta;
            }
            // Lock group Y to 0 so the puddle stays exactly on the ground
            groupRef.current.position.y = position[1];
            // FADE OUT COMPLETELY: Smooth fade out over ~3-4 seconds
            material.opacity = Math.max(0, material.opacity - 0.25 * delta);
            liquidMat.opacity = Math.max(0, liquidMat.opacity - 0.25 * delta);
            // Spilling effect using a flat puddle mesh
            if (puddleRef.current) {
                // Grow to a controlled spill radius
                if (puddleRef.current.scale.x < 1.4) {
                    puddleRef.current.scale.x += 3.5 * delta;
                    puddleRef.current.scale.y += 3.5 * delta;
                    puddleRef.current.scale.z += 3.5 * delta;
                }
                // Fade puddle (deliberately slower fade than the piece so we can see the liquid linger)
                // Only start fading when scale has reached almost max
                if (puddleRef.current.material && puddleRef.current.scale.x > 1.2) {
                    puddleRef.current.material.opacity = Math.max(0, puddleRef.current.material.opacity - 0.35 * delta);
                }
            }
            return; // Skip normal lerp
        }
        const dx = (position[0] - groupRef.current.position.x);
        const dy = (position[1] - groupRef.current.position.y);
        const dz = (position[2] - groupRef.current.position.z);
        const distSq = dx * dx + dz * dz;
        // SLOW/GENTLE WALK
        if (distSq > 0.0001) {
            // DRAG-OUT slow walking for majestic movement
            groupRef.current.position.x += dx * 1.5 * delta;
            groupRef.current.position.y += dy * 1.5 * delta;
            groupRef.current.position.z += dz * 1.5 * delta;
            // Setup movement / walking physics
            if (liquidRef.current) {
                const speed = Math.sqrt(distSq);
                // Tilt liquid gently
                liquidRef.current.rotation.x += (dz * 2.5 - liquidRef.current.rotation.x) * 8 * delta;
                liquidRef.current.rotation.z += (-dx * 2.5 - liquidRef.current.rotation.z) * 8 * delta;
                // Sloshing volume
                const wobble = 1 + Math.sin(state.clock.elapsedTime * 20) * speed * 1.2;
                liquidRef.current.scale.y += (wobble - liquidRef.current.scale.y) * 10 * delta;
                // Reset idle scales during walk
                liquidRef.current.scale.x += (1 - liquidRef.current.scale.x) * 10 * delta;
                liquidRef.current.scale.z += (1 - liquidRef.current.scale.z) * 10 * delta;
            }
            // Snap base rotation straight
            groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * 5 * delta;
        }
        else {
            // IDLE PHASE
            groupRef.current.position.x = position[0];
            groupRef.current.position.z = position[2];
            // Idle hover sway (bobbing up and down)
            if (isHighlighted) {
                groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 6) * 0.08;
            }
            else {
                groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.015;
            }
            // Idle group swaying rotation
            groupRef.current.rotation.y = position[0] * 0.1 + Math.sin(state.clock.elapsedTime * 0.5 + position[2]) * 0.05;
            // Idle bubbling of the liquids to bring it to life
            if (liquidRef.current) {
                liquidRef.current.rotation.x += (0 - liquidRef.current.rotation.x) * 5 * delta;
                liquidRef.current.rotation.z += (0 - liquidRef.current.rotation.z) * 5 * delta;
                // Gentle bubbling effect in all 3 axis
                liquidRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 5 + position[0]) * 0.04;
                liquidRef.current.scale.x = 1 + Math.cos(state.clock.elapsedTime * 4 + position[2]) * 0.015;
                liquidRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 4.5 + position[0]) * 0.015;
            }
        }
    });
    return (_jsxs("group", { ref: groupRef, position: position, children: [_jsxs("group", { ref: pieceRotRef, onClick: (e) => {
                    e.stopPropagation();
                    if (onClick)
                        onClick();
                }, children: [type === 'p' && _jsx(Pawn, { material: material, liquid: liquidMat, liquidRef: liquidRef, themeId: themeId }), type === 'r' && _jsx(Rook, { material: material, liquid: liquidMat, liquidRef: liquidRef, themeId: themeId }), type === 'n' && _jsx(Knight, { material: material, liquid: liquidMat, liquidRef: liquidRef, themeId: themeId }), type === 'b' && _jsx(Bishop, { material: material, liquid: liquidMat, liquidRef: liquidRef, themeId: themeId }), type === 'q' && _jsx(Queen, { material: material, liquid: liquidMat, liquidRef: liquidRef, themeId: themeId }), type === 'k' && _jsx(King, { material: material, liquid: liquidMat, liquidRef: liquidRef, themeId: themeId })] }), isHighlighted && !isBreaking && (_jsx(Billboard, { position: [0, 2.4, 0], children: _jsx(Text, { fontSize: 0.25, color: isWhite ? '#10b981' : '#0ea5e9', anchorX: "center", anchorY: "middle", outlineWidth: 0.03, outlineColor: "#000000", textAlign: "center", lineHeight: 1.2, depthOffset: -1, children: GLASSWARE_THEMES[themeId]?.[type]?.name?.replace(" (", "\n(") || 'PEÇA' }) })), isBreaking && (_jsxs("mesh", { ref: puddleRef, position: [0, -0.045, 0], rotation: [-Math.PI / 2, 0, 0], scale: [0.01, 0.01, 0.01], renderOrder: 1, children: [_jsx("circleGeometry", { args: [0.45, 32] }), _jsx("meshStandardMaterial", { color: isWhite ? '#10b981' : '#0ea5e9', transparent: true, opacity: 1.0, depthWrite: false, depthTest: true, roughness: 0.1, metalness: 0.2, emissive: isWhite ? '#064e3b' : '#0f172a', emissiveIntensity: 0.6 })] }))] }));
}
// -- Helpers --
// Graduações (linhas de marcação)
function Graduations({ radius, topRadius, bottomRadius, height, count, startY }) {
    const marks = [];
    for (let i = 0; i < count; i++) {
        const t = count > 1 ? i / (count - 1) : 0;
        const y = startY + t * height;
        const currentRadius = topRadius !== undefined
            ? bottomRadius + t * (topRadius - bottomRadius)
            : radius;
        const isMajor = i % 2 === 0;
        marks.push(_jsxs("mesh", { position: [0, y, 0], rotation: [0, -Math.PI / 2.5, 0], children: [_jsx("cylinderGeometry", { args: [currentRadius + 0.005, currentRadius + 0.005, 0.015, 32, 1, true, 0, isMajor ? 0.8 : 0.4] }), _jsx("meshBasicMaterial", { color: "#000000", side: DoubleSide })] }, i));
    }
    return _jsx("group", { children: marks });
}
// -- Piece Geometries --
// Pawn Variations
function Pawn({ material, liquid, liquidRef, themeId }) {
    if (themeId === 2) {
        // Vial de Amostra (Analítica): Compact, short cylinder with a cap
        return (_jsxs("group", { position: [0, 0.25, 0], children: [_jsx("mesh", { position: [0, -0.2, 0], material: new MeshPhysicalMaterial({ color: '#4a3b32', roughness: 0.9 }), children: _jsx("cylinderGeometry", { args: [0.2, 0.22, 0.1, 16] }) }), _jsx("mesh", { material: material, position: [0, 0.1, 0], children: _jsx("cylinderGeometry", { args: [0.15, 0.15, 0.4, 32, 1, false] }) }), _jsx("mesh", { position: [0, 0.35, 0], material: new MeshStandardMaterial({ color: '#1f2937', roughness: 0.7 }), children: _jsx("cylinderGeometry", { args: [0.16, 0.16, 0.1, 16] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, 0.05, 0], children: _jsx("cylinderGeometry", { args: [0.14, 0.14, 0.3, 32] }) }) }), _jsx(Graduations, { radius: 0.15, count: 3, height: 0.2, startY: -0.05 })] }));
    }
    if (themeId === 3) {
        // Tubo de Nessler (Síntese): Taller, flatter bottom, more elongated
        return (_jsxs("group", { position: [0, 0.55, 0], children: [_jsx("mesh", { position: [0, -0.45, 0], material: new MeshPhysicalMaterial({ color: '#4a3b32', roughness: 0.9 }), children: _jsx("cylinderGeometry", { args: [0.2, 0.22, 0.1, 16] }) }), _jsx("mesh", { material: material, position: [0, 0.15, 0], children: _jsx("cylinderGeometry", { args: [0.11, 0.11, 1.0, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0, 0.65, 0], rotation: [Math.PI / 2, 0, 0], children: _jsx("torusGeometry", { args: [0.12, 0.02, 16, 32] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, 0, 0], children: _jsx("cylinderGeometry", { args: [0.1, 0.1, 0.7, 32] }) }) }), _jsx(Graduations, { radius: 0.11, count: 1, height: 0, startY: 0.4 })] }));
    }
    if (themeId === 4) {
        // Tubo de Cultura (Conceitual): Conical elongated bottom
        return (_jsxs("group", { position: [0, 0.5, 0], children: [_jsx("mesh", { position: [0, -0.35, 0], material: new MeshPhysicalMaterial({ color: '#4a3b32', roughness: 0.9 }), children: _jsx("cylinderGeometry", { args: [0.2, 0.22, 0.1, 16] }) }), _jsx("mesh", { material: material, position: [0, 0.05, 0], children: _jsx("cylinderGeometry", { args: [0.12, 0.12, 0.5, 32, 1, true] }) }), _jsx("mesh", { material: material, position: [0, -0.3, 0], children: _jsx("cylinderGeometry", { args: [0.12, 0.02, 0.2, 32] }) }), _jsx("mesh", { position: [0, 0.35, 0], material: new MeshStandardMaterial({ color: '#eab308' }), children: _jsx("cylinderGeometry", { args: [0.14, 0.14, 0.15, 16] }) }), _jsxs("group", { ref: liquidRef, children: [_jsx("mesh", { material: liquid, position: [0, -0.05, 0], children: _jsx("cylinderGeometry", { args: [0.11, 0.11, 0.3, 32] }) }), _jsx("mesh", { material: liquid, position: [0, -0.25, 0], children: _jsx("cylinderGeometry", { args: [0.11, 0.02, 0.1, 32] }) })] })] }));
    }
    // Default: Tubo de Ensaio
    return (_jsxs("group", { position: [0, 0.5, 0], children: [_jsx("mesh", { position: [0, -0.45, 0], material: new MeshPhysicalMaterial({ color: '#4a3b32', roughness: 0.9 }), children: _jsx("cylinderGeometry", { args: [0.2, 0.22, 0.1, 16] }) }), _jsx("mesh", { material: material, position: [0, 0.1, 0], children: _jsx("cylinderGeometry", { args: [0.12, 0.12, 0.8, 32, 1, true] }) }), _jsx("mesh", { material: material, position: [0, -0.3, 0], children: _jsx("sphereGeometry", { args: [0.12, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2] }) }), _jsx("mesh", { material: material, position: [0, 0.5, 0], rotation: [Math.PI / 2, 0, 0], children: _jsx("torusGeometry", { args: [0.13, 0.015, 16, 32] }) }), _jsxs("group", { ref: liquidRef, children: [_jsx("mesh", { material: liquid, position: [0, -0.05, 0], children: _jsx("cylinderGeometry", { args: [0.11, 0.11, 0.5, 32] }) }), _jsx("mesh", { material: liquid, position: [0, -0.3, 0], children: _jsx("sphereGeometry", { args: [0.11, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2] }) })] }), _jsx(Graduations, { radius: 0.12, count: 4, height: 0.35, startY: -0.1 })] }));
}
// Rook: Béquer Grande
function Rook({ material, liquid, liquidRef, themeId }) {
    if (themeId === 2) {
        // Cristalizador
        return (_jsxs("group", { position: [0, 0.25, 0], children: [_jsx("mesh", { material: material, position: [0, -0.2, 0], children: _jsx("cylinderGeometry", { args: [0.45, 0.45, 0.05, 32] }) }), _jsx("mesh", { material: material, position: [0, 0, 0], children: _jsx("cylinderGeometry", { args: [0.45, 0.45, 0.4, 32, 1, true] }) }), _jsx("mesh", { material: material, position: [0, 0.2, 0], rotation: [Math.PI / 2, 0, 0], children: _jsx("torusGeometry", { args: [0.45, 0.015, 16, 32] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, -0.05, 0], children: _jsx("cylinderGeometry", { args: [0.44, 0.44, 0.25, 32] }) }) }), _jsx(Graduations, { radius: 0.45, count: 2, height: 0.15, startY: -0.1 })] }));
    }
    if (themeId === 3) {
        // Frasco de reagente âmbar (We tint the material slightly later, but stick to shape)
        return (_jsxs("group", { position: [0, 0.5, 0], children: [_jsx("mesh", { material: material, position: [0, -0.4, 0], children: _jsx("cylinderGeometry", { args: [0.3, 0.3, 0.05, 32] }) }), _jsx("mesh", { material: material, position: [0, -0.05, 0], children: _jsx("cylinderGeometry", { args: [0.3, 0.3, 0.7, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0, 0.35, 0], children: _jsx("sphereGeometry", { args: [0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2] }) }), _jsx("mesh", { material: material, position: [0, 0.5, 0], children: _jsx("cylinderGeometry", { args: [0.15, 0.15, 0.3, 32, 1, false] }) }), _jsx("mesh", { position: [0, 0.65, 0], material: new MeshStandardMaterial({ color: '#222222' }), children: _jsx("cylinderGeometry", { args: [0.16, 0.16, 0.08, 16] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, -0.15, 0], children: _jsx("cylinderGeometry", { args: [0.28, 0.28, 0.5, 32] }) }) })] }));
    }
    if (themeId === 4) {
        // Cuba cromatográfica (square/architectural)
        return (_jsxs("group", { position: [0, 0.5, 0], children: [_jsx("mesh", { material: material, position: [0, -0.4, 0], children: _jsx("boxGeometry", { args: [0.5, 0.1, 0.5] }) }), _jsx("mesh", { material: material, position: [0, 0, 0], children: _jsx("boxGeometry", { args: [0.5, 0.8, 0.5] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, -0.2, 0], children: _jsx("boxGeometry", { args: [0.48, 0.35, 0.48] }) }) })] }));
    }
    // Default: Bequer
    return (_jsxs("group", { position: [0, 0.5, 0], children: [_jsx("mesh", { material: material, position: [0, -0.4, 0], children: _jsx("cylinderGeometry", { args: [0.3, 0.3, 0.05, 32] }) }), _jsx("mesh", { material: material, position: [0, 0, 0], children: _jsx("cylinderGeometry", { args: [0.3, 0.3, 0.8, 32, 1, true] }) }), _jsx("mesh", { material: material, position: [0, 0.4, 0], rotation: [Math.PI / 2, 0, 0], children: _jsx("torusGeometry", { args: [0.3, 0.01, 16, 32] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, -0.1, 0], children: _jsx("cylinderGeometry", { args: [0.29, 0.29, 0.6, 32] }) }) }), _jsx(Graduations, { radius: 0.3, count: 6, height: 0.6, startY: -0.25 })] }));
}
// Knight: Proveta
function Knight({ material, liquid, liquidRef, themeId }) {
    if (themeId === 2) {
        // Pipeta Graduada (fine, tall, tapering to a fine tip at the bottom)
        return (_jsxs("group", { position: [0, 0.7, 0], children: [_jsx("mesh", { material: material, position: [0, 0.1, 0], children: _jsx("cylinderGeometry", { args: [0.07, 0.07, 1.0, 16, 1, false] }) }), _jsx("mesh", { material: material, position: [0, -0.5, 0], children: _jsx("cylinderGeometry", { args: [0.07, 0.02, 0.2, 16] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, -0.1, 0], children: _jsx("cylinderGeometry", { args: [0.06, 0.06, 0.7, 16] }) }) }), _jsx(Graduations, { radius: 0.07, count: 16, height: 0.9, startY: -0.3 })] }));
    }
    if (themeId === 3) {
        // Pipeta Pasteur (refaça a pipeta de pauster: squeezy bulb -> body -> taper -> thin capillary point)
        return (_jsxs("group", { position: [0, 0.1, 0], children: [_jsx("mesh", { material: material, position: [0, 0.25, 0], children: _jsx("cylinderGeometry", { args: [0.02, 0.015, 0.5, 16] }) }), _jsx("mesh", { material: material, position: [0, 0.6, 0], children: _jsx("cylinderGeometry", { args: [0.06, 0.02, 0.2, 16] }) }), _jsx("mesh", { material: material, position: [0, 0.9, 0], children: _jsx("cylinderGeometry", { args: [0.06, 0.06, 0.4, 16] }) }), _jsx("mesh", { position: [0, 1.25, 0], material: new MeshPhysicalMaterial({ transmission: 0.8, opacity: 1, roughness: 0.1, color: '#e2e8f0', transparent: true }), children: _jsx("capsuleGeometry", { args: [0.1, 0.2, 16, 16] }) }), _jsxs("group", { ref: liquidRef, children: [_jsx("mesh", { material: liquid, position: [0, 0.85, 0], children: _jsx("cylinderGeometry", { args: [0.05, 0.05, 0.3, 16] }) }), _jsx("mesh", { material: liquid, position: [0, 0.6, 0], children: _jsx("cylinderGeometry", { args: [0.05, 0.015, 0.2, 16] }) })] })] }));
    }
    if (themeId === 4) {
        // Pipeta Volumétrica (central bulb, pointed tip)
        return (_jsxs("group", { position: [0, 0.7, 0], children: [_jsx("mesh", { material: material, position: [0, 0.4, 0], children: _jsx("cylinderGeometry", { args: [0.04, 0.04, 0.4, 16, 1, false] }) }), _jsx("mesh", { material: material, position: [0, 0.1, 0], children: _jsx("sphereGeometry", { args: [0.14, 32, 16] }) }), _jsx("mesh", { material: material, position: [0, -0.25, 0], children: _jsx("cylinderGeometry", { args: [0.04, 0.04, 0.5, 16, 1, false] }) }), _jsx("mesh", { material: material, position: [0, -0.6, 0], children: _jsx("cylinderGeometry", { args: [0.04, 0.015, 0.2, 16, 1, false] }) }), _jsxs("group", { ref: liquidRef, children: [_jsx("mesh", { material: liquid, position: [0, -0.2, 0], children: _jsx("cylinderGeometry", { args: [0.03, 0.03, 0.4, 16] }) }), _jsx("mesh", { material: liquid, position: [0, 0.1, 0], children: _jsx("sphereGeometry", { args: [0.13, 32, 16] }) })] }), _jsx(Graduations, { radius: 0.04, count: 1, height: 0, startY: 0.5 })] }));
    }
    // Default: Proveta
    return (_jsxs("group", { position: [0, 0.65, 0], children: [_jsx("mesh", { material: material, position: [0, -0.6, 0], children: _jsx("cylinderGeometry", { args: [0.25, 0.25, 0.05, 6] }) }), _jsx("mesh", { material: material, position: [0, 0, 0], children: _jsx("cylinderGeometry", { args: [0.12, 0.12, 1.2, 32, 1, true] }) }), _jsx("mesh", { material: material, position: [0, 0.6, 0], rotation: [Math.PI / 2, 0, 0], children: _jsx("torusGeometry", { args: [0.125, 0.01, 16, 32] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, -0.15, 0], children: _jsx("cylinderGeometry", { args: [0.11, 0.11, 0.9, 32] }) }) }), _jsx(Graduations, { radius: 0.12, count: 14, height: 0.9, startY: -0.5 })] }));
}
// Bishop: Balão de Fundo Redondo
function Bishop({ material, liquid, liquidRef, themeId }) {
    if (themeId === 2) {
        // Bureta: very fine tip below stopcock
        return (_jsxs("group", { position: [0, 0.75, 0], children: [_jsx("mesh", { material: material, position: [0, 0.1, 0], children: _jsx("cylinderGeometry", { args: [0.06, 0.06, 1.0, 16, 1, false] }) }), _jsx("mesh", { position: [0, -0.45, 0], material: new MeshStandardMaterial({ color: '#e5e7eb' }), children: _jsx("boxGeometry", { args: [0.15, 0.04, 0.04] }) }), _jsx("mesh", { position: [-0.08, -0.45, 0], rotation: [0, 0, Math.PI / 2], material: new MeshStandardMaterial({ color: '#ef4444' }), children: _jsx("cylinderGeometry", { args: [0.03, 0.03, 0.06, 16] }) }), _jsx("mesh", { material: material, position: [0, -0.6, 0], children: _jsx("cylinderGeometry", { args: [0.06, 0.015, 0.25, 16] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, 0.1, 0], children: _jsx("cylinderGeometry", { args: [0.05, 0.05, 0.8, 16] }) }) }), _jsx(Graduations, { radius: 0.06, count: 10, height: 0.9, startY: -0.3 })] }));
    }
    if (themeId === 3) {
        // Condensador Liebig (tube inside a tube)
        return (_jsxs("group", { position: [0, 0.7, 0], children: [_jsx("mesh", { material: material, position: [0, 0, 0], children: _jsx("cylinderGeometry", { args: [0.15, 0.15, 0.8, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0, 0, 0], children: _jsx("cylinderGeometry", { args: [0.05, 0.05, 1.2, 16, 1, false] }) }), _jsx("mesh", { material: material, position: [0.15, -0.3, 0], rotation: [0, 0, Math.PI / 4], children: _jsx("cylinderGeometry", { args: [0.03, 0.03, 0.15, 16] }) }), _jsx("mesh", { material: material, position: [-0.15, 0.3, 0], rotation: [0, 0, Math.PI / 4], children: _jsx("cylinderGeometry", { args: [0.03, 0.03, 0.15, 16] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, 0, 0], children: _jsx("cylinderGeometry", { args: [0.04, 0.04, 1.0, 16] }) }) })] }));
    }
    if (themeId === 4) {
        // Condensador Allihn (bulbs sequence with bico at the bottom)
        return (_jsxs("group", { position: [0, 0.9, 0], children: [_jsx("mesh", { material: material, position: [0, 0.6, 0], children: _jsx("cylinderGeometry", { args: [0.08, 0.08, 0.2, 16] }) }), _jsx("mesh", { material: material, position: [0, -0.05, 0], children: _jsx("cylinderGeometry", { args: [0.16, 0.16, 0.9, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0.16, -0.35, 0], rotation: [0, 0, Math.PI / 2], children: _jsx("cylinderGeometry", { args: [0.03, 0.03, 0.15, 16] }) }), _jsx("mesh", { material: material, position: [-0.16, 0.25, 0], rotation: [0, 0, Math.PI / 2], children: _jsx("cylinderGeometry", { args: [0.03, 0.03, 0.15, 16] }) }), [...Array(4)].map((_, i) => (_jsx("mesh", { material: material, position: [0, -0.35 + i * 0.2, 0], children: _jsx("sphereGeometry", { args: [0.1, 32, 16] }) }, i))), _jsx("mesh", { material: material, position: [0, -0.55, 0], children: _jsx("cylinderGeometry", { args: [0.16, 0.08, 0.1, 16, 1, false] }) }), _jsx("mesh", { position: [0, -0.65, 0], material: new MeshStandardMaterial({ color: '#e5e7eb', roughness: 1 }), children: _jsx("cylinderGeometry", { args: [0.08, 0.06, 0.1, 16, 1, false] }) }), _jsxs("group", { ref: liquidRef, children: [_jsx("mesh", { material: liquid, position: [0, -0.35, 0], children: _jsx("sphereGeometry", { args: [0.09, 32, 16] }) }), _jsx("mesh", { material: liquid, position: [0, -0.15, 0], children: _jsx("sphereGeometry", { args: [0.09, 32, 16] }) }), _jsx("mesh", { material: liquid, position: [0, 0.05, 0], children: _jsx("sphereGeometry", { args: [0.09, 32, 16] }) }), _jsx("mesh", { material: liquid, position: [0, 0.25, 0], children: _jsx("sphereGeometry", { args: [0.09, 32, 16] }) })] })] }));
    }
    // Default: Balão fundo redondo
    return (_jsxs("group", { position: [0, 0.55, 0], children: [_jsx("mesh", { material: new MeshPhysicalMaterial({ color: '#8b5a2b', roughness: 1 }), position: [0, -0.4, 0], rotation: [Math.PI / 2, 0, 0], children: _jsx("torusGeometry", { args: [0.18, 0.08, 16, 32] }) }), _jsx("mesh", { material: material, position: [0, -0.05, 0], children: _jsx("sphereGeometry", { args: [0.35, 32, 32] }) }), _jsx("mesh", { material: material, position: [0, 0.45, 0], children: _jsx("cylinderGeometry", { args: [0.1, 0.1, 0.4, 32, 1, true] }) }), _jsx("mesh", { material: material, position: [0, 0.65, 0], rotation: [Math.PI / 2, 0, 0], children: _jsx("torusGeometry", { args: [0.11, 0.02, 16, 32] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, -0.05, 0], children: _jsx("sphereGeometry", { args: [0.34, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5] }) }) }), _jsx(Graduations, { radius: 0.1, count: 1, height: 0, startY: 0.45 })] }));
}
// Queen: Erlenmeyer
function Queen({ material, liquid, liquidRef, themeId }) {
    if (themeId === 2) {
        // Funil de Separação (Squat pear shape with stopcock -> making it more pear-like)
        return (_jsxs("group", { position: [0, 0.75, 0], children: [_jsx("mesh", { material: material, position: [0, 0.55, 0], children: _jsx("cylinderGeometry", { args: [0.06, 0.06, 0.15, 16, 1, false] }) }), _jsx("mesh", { position: [0, 0.65, 0], material: new MeshStandardMaterial({ color: '#e5e7eb' }), children: _jsx("cylinderGeometry", { args: [0.08, 0.08, 0.08, 16] }) }), _jsx("mesh", { material: material, position: [0, 0.25, 0], children: _jsx("sphereGeometry", { args: [0.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2] }) }), _jsx("mesh", { material: material, position: [0, 0.0, 0], children: _jsx("cylinderGeometry", { args: [0.25, 0.04, 0.5, 32, 1, false] }) }), _jsx("mesh", { position: [0, -0.35, 0], material: new MeshStandardMaterial({ color: '#e5e7eb' }), children: _jsx("boxGeometry", { args: [0.14, 0.04, 0.04] }) }), _jsx("mesh", { position: [-0.08, -0.35, 0], rotation: [0, 0, Math.PI / 2], material: new MeshStandardMaterial({ color: '#ef4444' }), children: _jsx("cylinderGeometry", { args: [0.03, 0.03, 0.06, 16] }) }), _jsx("mesh", { material: material, position: [0, -0.55, 0], children: _jsx("cylinderGeometry", { args: [0.03, 0.02, 0.4, 16, 1, false] }) }), _jsxs("group", { ref: liquidRef, children: [_jsx("mesh", { material: liquid, position: [0, 0.15, 0], children: _jsx("sphereGeometry", { args: [0.23, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2] }) }), _jsx("mesh", { material: liquid, position: [0, -0.05, 0], children: _jsx("cylinderGeometry", { args: [0.23, 0.03, 0.4, 32] }) })] })] }));
    }
    if (themeId === 3) {
        // Balão de Destilação (round bottom, long neck, side arm angle)
        return (_jsxs("group", { position: [0, 0.6, 0], children: [_jsx("mesh", { material: material, position: [0, -0.3, 0], children: _jsx("sphereGeometry", { args: [0.4, 32, 32] }) }), _jsx("mesh", { material: material, position: [0, 0.4, 0], children: _jsx("cylinderGeometry", { args: [0.12, 0.12, 1.0, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0, 0.9, 0], children: _jsx("cylinderGeometry", { args: [0.14, 0.14, 0.05, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0, 0.95, 0], rotation: [Math.PI / 2, 0, 0], children: _jsx("torusGeometry", { args: [0.14, 0.03, 16, 32] }) }), _jsx("mesh", { material: material, position: [0.4, 0.3, 0], rotation: [0, 0, -Math.PI / 3], children: _jsx("cylinderGeometry", { args: [0.04, 0.04, 0.7, 16, 1, false] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, -0.3, 0], children: _jsx("sphereGeometry", { args: [0.38, 32, 32, 0, Math.PI * 2, Math.PI / 2.5, Math.PI] }) }) })] }));
    }
    if (themeId === 4) {
        // Coluna de Vigreux (tube with downward indentations inside)
        const vigreuxSpikes = [];
        for (let i = 0; i < 6; i++) {
            const y = -0.3 + i * 0.15;
            vigreuxSpikes.push(_jsx("mesh", { material: material, position: [0.06, y, 0], rotation: [0, 0, Math.PI / 4], children: _jsx("coneGeometry", { args: [0.04, 0.1, 16] }) }, `v1_${i}`));
            vigreuxSpikes.push(_jsx("mesh", { material: material, position: [-0.06, y + 0.07, 0], rotation: [0, 0, -Math.PI / 4], children: _jsx("coneGeometry", { args: [0.04, 0.1, 16] }) }, `v2_${i}`));
        }
        return (_jsxs("group", { position: [0, 0.8, 0], children: [_jsx("mesh", { material: material, position: [0, 0, 0], children: _jsx("cylinderGeometry", { args: [0.13, 0.13, 1.2, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0, 0.65, 0], children: _jsx("cylinderGeometry", { args: [0.15, 0.13, 0.1, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0, -0.65, 0], children: _jsx("cylinderGeometry", { args: [0.13, 0.08, 0.1, 32, 1, false] }) }), _jsx("mesh", { position: [0, -0.75, 0], material: new MeshStandardMaterial({ color: '#e5e7eb', roughness: 1 }), children: _jsx("cylinderGeometry", { args: [0.08, 0.07, 0.1, 32, 1, false] }) }), vigreuxSpikes] }));
    }
    // Default: Erlenmeyer
    return (_jsxs("group", { position: [0, 0.6, 0], children: [_jsx("mesh", { material: material, position: [0, -0.5, 0], children: _jsx("cylinderGeometry", { args: [0.4, 0.4, 0.05, 32] }) }), _jsx("mesh", { material: material, position: [0, -0.1, 0], children: _jsx("cylinderGeometry", { args: [0.12, 0.4, 0.8, 32, 1, true] }) }), _jsx("mesh", { material: material, position: [0, 0.45, 0], children: _jsx("cylinderGeometry", { args: [0.12, 0.12, 0.3, 32, 1, true] }) }), _jsx("mesh", { material: material, position: [0, 0.6, 0], rotation: [Math.PI / 2, 0, 0], children: _jsx("torusGeometry", { args: [0.14, 0.02, 16, 32] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, -0.2, 0], children: _jsx("cylinderGeometry", { args: [0.18, 0.38, 0.6, 32] }) }) }), _jsx(Graduations, { topRadius: 0.16, bottomRadius: 0.33, count: 5, height: 0.5, startY: -0.4 })] }));
}
// King: Kitasato
function King({ material, liquid, liquidRef, themeId }) {
    if (themeId === 2) {
        // Balão Volumétrico (solene, very tall neck)
        return (_jsxs("group", { position: [0, 0.6, 0], children: [_jsx("mesh", { material: material, position: [0, -0.4, 0], children: _jsx("cylinderGeometry", { args: [0.25, 0.25, 0.05, 32] }) }), _jsx("mesh", { material: material, position: [0, 0, 0], children: _jsx("sphereGeometry", { args: [0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.3] }) }), _jsx("mesh", { material: material, position: [0, 0.5, 0], children: _jsx("cylinderGeometry", { args: [0.06, 0.06, 0.8, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0, 0.9, 0], rotation: [Math.PI / 2, 0, 0], children: _jsx("torusGeometry", { args: [0.08, 0.015, 16, 32] }) }), _jsx("mesh", { material: new MeshPhysicalMaterial({ color: 'white', roughness: 0 }), position: [0, 0.6, 0], rotation: [Math.PI / 2, 0, 0], children: _jsx("torusGeometry", { args: [0.065, 0.005, 16, 32] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, -0.05, 0], children: _jsx("sphereGeometry", { args: [0.33, 32, 32, 0, Math.PI * 2, Math.PI / 3, Math.PI / 1.3] }) }) })] }));
    }
    if (themeId === 3) {
        // Dessecador (Image 2: base bowl -> ridge -> body -> wide flange -> domed lid -> knob)
        return (_jsxs("group", { position: [0, 0.4, 0], children: [_jsx("mesh", { material: material, position: [0, -0.4, 0], children: _jsx("cylinderGeometry", { args: [0.3, 0.2, 0.3, 32, 1, false] }) }), _jsx("mesh", { material: new MeshPhysicalMaterial({ color: '#a855f7', roughness: 0.8 }), position: [0, -0.45, 0], children: _jsx("cylinderGeometry", { args: [0.26, 0.18, 0.18, 32] }) }), _jsx("mesh", { material: new MeshStandardMaterial({ color: '#e5e7eb' }), position: [0, -0.3, 0], children: _jsx("cylinderGeometry", { args: [0.28, 0.28, 0.03, 32] }) }), _jsx("mesh", { material: material, position: [0, -0.05, 0], children: _jsx("cylinderGeometry", { args: [0.45, 0.3, 0.4, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0, 0.18, 0], children: _jsx("cylinderGeometry", { args: [0.48, 0.48, 0.06, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0, 0.2, 0], children: _jsx("sphereGeometry", { args: [0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2] }) }), _jsx("mesh", { material: material, position: [0, 0.7, 0], children: _jsx("cylinderGeometry", { args: [0.04, 0.1, 0.15, 16] }) }), _jsx("mesh", { material: material, position: [0, 0.85, 0], children: _jsx("sphereGeometry", { args: [0.1, 16, 16] }) })] }));
    }
    if (themeId === 4) {
        // Frasco Drechsel (lavador de gases, com tampão azul e conectores)
        return (_jsxs("group", { position: [0, 0.6, 0], children: [_jsx("mesh", { material: material, position: [0, -0.55, 0], children: _jsx("cylinderGeometry", { args: [0.3, 0.3, 0.05, 32] }) }), _jsx("mesh", { material: material, position: [0, -0.2, 0], children: _jsx("cylinderGeometry", { args: [0.3, 0.3, 0.65, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0, 0.2, 0], children: _jsx("cylinderGeometry", { args: [0.12, 0.3, 0.15, 32, 1, false] }) }), _jsx("mesh", { material: material, position: [0, 0.33, 0], children: _jsx("cylinderGeometry", { args: [0.12, 0.12, 0.12, 32, 1, false] }) }), _jsx("mesh", { position: [0, 0.42, 0], material: new MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.7 }), children: _jsx("cylinderGeometry", { args: [0.18, 0.18, 0.15, 32] }) }), _jsx("mesh", { material: material, position: [0, 0.65, 0], children: _jsx("capsuleGeometry", { args: [0.07, 0.2, 16, 16] }) }), _jsx("mesh", { material: material, position: [0, 0.2, 0], children: _jsx("cylinderGeometry", { args: [0.03, 0.03, 1.2, 16, 1, false] }) }), _jsx("mesh", { material: material, position: [0.15, 0.7, 0], rotation: [0, 0, -Math.PI / 2], children: _jsx("cylinderGeometry", { args: [0.03, 0.03, 0.18, 16] }) }), _jsx("mesh", { position: [0.27, 0.7, 0], rotation: [0, 0, -Math.PI / 2], material: new MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.7 }), children: _jsx("cylinderGeometry", { args: [0.06, 0.06, 0.12, 16] }) }), _jsx("mesh", { material: material, position: [0.36, 0.7, 0], rotation: [0, 0, -Math.PI / 2], children: _jsx("cylinderGeometry", { args: [0.02, 0.02, 0.12, 16] }) }), _jsx("mesh", { material: material, position: [-0.15, 0.55, 0], rotation: [0, 0, Math.PI / 2], children: _jsx("cylinderGeometry", { args: [0.03, 0.03, 0.18, 16] }) }), _jsx("mesh", { position: [-0.27, 0.55, 0], rotation: [0, 0, Math.PI / 2], material: new MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.7 }), children: _jsx("cylinderGeometry", { args: [0.06, 0.06, 0.12, 16] }) }), _jsx("mesh", { material: material, position: [-0.36, 0.55, 0], rotation: [0, 0, Math.PI / 2], children: _jsx("cylinderGeometry", { args: [0.02, 0.02, 0.12, 16] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, -0.3, 0], children: _jsx("cylinderGeometry", { args: [0.28, 0.28, 0.45, 32] }) }) }), _jsx(Graduations, { radius: 0.3, count: 4, height: 0.4, startY: -0.45 })] }));
    }
    // Default: Kitasato
    return (_jsxs("group", { position: [0, 0.65, 0], children: [_jsx("mesh", { material: material, position: [0, -0.5, 0], children: _jsx("cylinderGeometry", { args: [0.45, 0.45, 0.05, 32] }) }), _jsx("mesh", { material: material, position: [0, -0.05, 0], children: _jsx("cylinderGeometry", { args: [0.15, 0.45, 0.9, 32, 1, true] }) }), _jsx("mesh", { material: material, position: [0, 0.55, 0], children: _jsx("cylinderGeometry", { args: [0.15, 0.15, 0.3, 32, 1, true] }) }), _jsx("mesh", { material: material, position: [0.2, 0.55, 0], rotation: [0, 0, -Math.PI / 3], children: _jsx("cylinderGeometry", { args: [0.03, 0.03, 0.25, 16] }) }), _jsx("mesh", { material: material, position: [0, 0.7, 0], rotation: [Math.PI / 2, 0, 0], children: _jsx("torusGeometry", { args: [0.17, 0.02, 16, 32] }) }), _jsx("group", { ref: liquidRef, children: _jsx("mesh", { material: liquid, position: [0, -0.15, 0], children: _jsx("cylinderGeometry", { args: [0.21, 0.43, 0.7, 32] }) }) }), _jsx("mesh", { material: new MeshPhysicalMaterial({ color: '#222' }), position: [0, 0.75, 0], children: _jsx("cylinderGeometry", { args: [0.16, 0.13, 0.15, 16] }) }), _jsx("mesh", { material: material, position: [0, 0.85, 0], children: _jsx("cylinderGeometry", { args: [0.03, 0.03, 0.25, 16] }) }), _jsx(Graduations, { topRadius: 0.19, bottomRadius: 0.38, count: 5, height: 0.5, startY: -0.4 })] }));
}

    const GLASSWARE_THEMES = {
    1: {
        'p': { name: 'Tubo de Ensaio (Peão)', desc: 'Usado para conter pequenas amostras líquidas ou sólidas, e realizar reações químicas em pequena escala ou sob aquecimento brando.' },
        'r': { name: 'Béquer (Torre)', desc: 'Recipiente de uso geral em laboratório. Muito utilizado para misturar líquidos, dissolver substâncias e realizar reações que não exijam alta precisão volumétrica.' },
        'n': { name: 'Proveta (Cavalo)', desc: 'Cilindro graduado projetado para medir volumes de líquidos com precisão moderada. Por ser um instrumento de medição, nunca deve ser aquecida.' },
        'b': { name: 'Balão de Fundo Redondo (Bispo)', desc: 'Seu formato esférico distribui o calor de maneira perfeitamente uniforme. Ideal para aquecimento prolongado, refluxo e destilações.' },
        'q': { name: 'Erlenmeyer (Rainha)', desc: 'Possui formato cônico e gargalo estreito, ideal para agitar líquidos vigorosamente sem risco de derramamento. Muito usado em titulações.' },
        'k': { name: 'Kitasato (Rei)', desc: 'Semelhante ao Erlenmeyer, mas possui uma saída lateral (espiga). É amplamente utilizado em filtrações a vácuo, conectando a espiga a uma bomba de vácuo.' }
    },
    2: {
        'p': { name: 'Vial de Amostra (Peão)', desc: 'Frasco compacto usado para acondicionar delicadas amostras em análises de alta precisão analítica e repetibilidade, como equipamentos de cromatografia.' },
        'r': { name: 'Cristalizador (Torre)', desc: 'Recipiente largo de bordas muito baixas. Desenvolvido para permitir a evaporação livre de solventes sobre uma grande área, facilitando a obtenção de cristais puros.' },
        'n': { name: 'Pipeta Graduada (Cavalo)', desc: 'Tubo de vidro longo com graduação estrita em todo o seu corpo, empregado para medir e transferir amostras de volumes variáveis com grande rigor analítico.' },
        'b': { name: 'Bureta (Bispo)', desc: 'Tubo cilíndrico de precisão com uma torneira de controle instalada na extremidade inferior. Componente clássico essencial para escoamento durante uma titulação.' },
        'q': { name: 'Funil de Separação (Rainha)', desc: 'Equipamento em forma de pera, munido de uma torneira. Útil de forma contundente ao se aplicar a técnica de extração para decantar líquidos imiscíveis.' },
        'k': { name: 'Balão Volumétrico (Rei)', desc: 'Frasco solene e elegante contendo um gargalo incrivelmente fino com marca de calibração única, construído unicamente para preparar soluções de exatidão vital.' }
    },
    3: {
        'p': { name: 'Tubo de Nessler (Peão)', desc: 'Cilindro limpo, reto e nivelado de base estritamente plana. Foi originalmente concebido para colorimetria, comparando visualmente as cores de líquidos.' },
        'r': { name: 'Frasco de Reagente (Torre)', desc: 'Compartimento espesso originado em vidro de propriedades fotoprotetoras tipo âmbar, conservando eficientemente estoques de substâncias suscetíveis a luz.' },
        'n': { name: 'Pipeta Pasteur (Cavalo)', desc: 'Vidraria longa que colapsa e afina drasticamente para uma ponta capilar estreita, manipulada com um bulbo flexível em transferências seguras a nível de gota.' },
        'b': { name: 'Condensador Liebig (Bispo)', desc: 'Unidade linear de resfriamento que contem estritamente um tubo interno envolto uniformemente por uma camada de refrigeração à água usada na destilação simples.' },
        'q': { name: 'Balão de Destilação (Rainha)', desc: 'Frasco cilíndrico robusto provido da particularidade de um braço de vapor lateral fixo utilizado ativamente para redirecionar o material recém encandescente.' },
        'k': { name: 'Dessecador (Rei)', desc: 'Santuário de vidro hermético de proporção pesada contendo um compartimento secante inferior blindado, forçando amostras complexas ao resfriamento sem umidade.' }
    },
    4: {
        'p': { name: 'Tubo de Cultura (Peão)', desc: 'Especializado elemento tubular cilíndrico forte que abriga roscagem, perfeitamente adotado mundialmente no armazenamento e purificação celular.' },
        'r': { name: 'Cuba Cromatográfica (Torre)', desc: 'Câmara base essencial de vidro translúcido desenvolvida retangularmente focando em propiciar aos solventes migratórios da técnica CCD um micro-ambiente isolado livre das instabilidades.' },
        'n': { name: 'Pipeta Volumétrica (Cavalo)', desc: 'Equipamento distinto onde repousa um dilatado bojo esférico com marca esmerilhada única, cujo escoamento de altíssimo nível repassa exclusivamente uma medida fechada e luxuosa sem alteração de varianças.' },
        'b': { name: 'Condensador Allihn (Bispo)', desc: 'Condensador ornamental ornamentado verticalmente onde a área expande-se visualmente nos bulbos e proporciona alta dinâmica em taxa efetiva condensativa requerida de um sistema em refluxo ininterrupto.' },
        'q': { name: 'Coluna de Vigreux (Rainha)', desc: 'Atípica via tubular salpicada minuciosamente de indentificações verticais intrincadas projetadas pra impor inúmeros ciclos fracionados num mesmo procedimento purificando e rebatendo vapores indesejados à base.' },
        'k': { name: 'Frasco de Drechsel (Rei)', desc: 'Poderoso lavador de gases engenhado magistralmente com sistema de fluxo vedante contendo tubo mergulhado interno onde fluidos gasosos passam inibitivamente num contínuo e exaustivo borbulhar processado.' }
    }
};
const CHESS_VOICE_PIECES = {
    p: 'Peão',
    r: 'Torre',
    n: 'Cavalo',
    b: 'Bispo',
    q: 'Rainha',
    k: 'Rei'
};
function chessVoiceGlassware(theme, type) {
    const name = GLASSWARE_THEMES[theme]?.[type]?.name || 'Vidraria';
    return String(name).replace(/\s*\([^)]*\)\s*$/, '').trim();
}
function chessVoicePieceData(chess, theme, square, piece, extra) {
    const data = Object.assign({
        type: piece?.type || '',
        color: piece?.color || '',
        pieceName: CHESS_VOICE_PIECES[piece?.type] || 'Peça',
        glassware: chessVoiceGlassware(theme, piece?.type),
        square
    }, extra || {});
    return data;
}
function chessVoiceFindKing(chess, theme, color) {
    const board = chess.board();
    for (let r = 0; r < 8; r += 1) {
        for (let c = 0; c < 8; c += 1) {
            const piece = board[r][c];
            if (piece && piece.type === 'k' && piece.color === color) {
                const square = `${['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][c]}${8 - r}`;
                return chessVoicePieceData(chess, theme, square, piece);
            }
        }
    }
    return null;
}
function chessVoiceFenForTurn(chess, color) {
    const parts = chess.fen().split(' ');
    parts[1] = color;
    parts[3] = '-';
    return parts.join(' ');
}
function chessVoiceCaptureCard(theme, type) {
    const item = GLASSWARE_THEMES[theme]?.[type] || null;
    return {
        title: 'Vidraria Capturada!',
        name: item?.name || 'Vidraria',
        heading: 'Uso em Laboratório',
        desc: item?.desc || 'Descrição não encontrada.'
    };
}
function chessVoiceCaptureMovesForColor(chess, theme, color) {
    try {
        const probe = new Chess(chessVoiceFenForTurn(chess, color));
        return probe.moves({ verbose: true }).filter(move => move.captured).map(move => {
            const capturedSquare = move.flags && move.flags.includes('e') ? move.to[0] + move.from[1] : move.to;
            const attackerPiece = chess.get(move.from) || { type: move.piece, color };
            const targetPiece = chess.get(capturedSquare) || { type: move.captured, color: color === 'w' ? 'b' : 'w' };
            return {
                from: move.from,
                to: capturedSquare,
                attacker: chessVoicePieceData(chess, theme, move.from, attackerPiece),
                target: chessVoicePieceData(chess, theme, capturedSquare, targetPiece)
            };
        });
    } catch (error) {
        return [];
    }
}
function chessVoiceTacticalState(chess, theme, includeEmpty = false) {
    return {
        includeEmpty,
        enemyThreats: chessVoiceCaptureMovesForColor(chess, theme, 'b'),
        allyCaptures: chessVoiceCaptureMovesForColor(chess, theme, 'w')
    };
}
function chessVoiceEmit(detail) {
    try {
        const type = detail?.type || detail?.action || '';
        if (type === 'select') {
            const piece = detail.piece || {};
            const options = (detail.options || []).map(v => String(v || '').toUpperCase()).join(', ') || 'nenhuma opção disponível';
            window.__simoensChessVoiceCurrentSelectionText = `Selecionado: ${piece.pieceName || 'Peça'}, ${piece.glassware || 'vidraria não identificada'}, ${String(piece.square || '').toUpperCase()}. Opções: ${options}.`;
        } else if (type === 'move' || type === 'capture' || (type === 'status' && (detail.status === 'reset' || detail.status === 'cancel'))) {
            window.__simoensChessVoiceCurrentSelectionText = '';
        }
        window.dispatchEvent(new CustomEvent('simoens-chess-voice', { detail }));
    } catch (error) {}
}
function chessVoiceController() {
    return window.SiMoEnsChessVoice && typeof window.SiMoEnsChessVoice.isActive === 'function' ? window.SiMoEnsChessVoice : null;
}
function chessVoiceIsActive() {
    const voice = chessVoiceController();
    return !!(voice && voice.isActive());
}
function chessVoiceRunAfterSpeech(detail, callback) {
    const voice = chessVoiceController();
    if (voice && voice.isActive() && typeof voice.runAfterSpeech === 'function') {
        voice.runAfterSpeech(detail || '', callback);
        return true;
    }
    callback();
    return false;
}
function chessVoiceAfterCurrentSpeech(callback) {
    const voice = chessVoiceController();
    if (voice && voice.isActive() && typeof voice.runAfterSpeech === 'function') {
        voice.runAfterSpeech('', callback);
        return true;
    }
    callback();
    return false;
}
function chessVoiceMoveActionMessage(chess, theme, move) {
    const movingPiece = chess.get(move.from);
    const moving = chessVoicePieceData(chess, theme, move.from, movingPiece || { type: move.piece, color: chess.turn() }, { from: move.from, to: move.to });
    let capturedSquare = move.to;
    if (move.flags && move.flags.includes('e')) capturedSquare = move.to[0] + move.from[1];
    const capturedPiece = move.captured ? chess.get(capturedSquare) || { type: move.captured, color: moving.color === 'w' ? 'b' : 'w' } : null;
    const from = String(move.from || '').toUpperCase();
    const to = String(move.to || '').toUpperCase();
    if (capturedPiece) {
        const captured = chessVoicePieceData(chess, theme, capturedSquare, capturedPiece);
        return 'Ação escolhida: ' + moving.pieceName + ', ' + moving.glassware + ', de ' + from + ' para ' + to + '. Vai capturar ' + captured.pieceName + ', ' + captured.glassware + ' em ' + String(capturedSquare).toUpperCase() + '.';
    }
    return 'Ação escolhida: mover ' + moving.pieceName + ', ' + moving.glassware + ', de ' + from + ' para ' + to + '.';
}
function chessVoiceMoveDetail(chess, theme, result, capturedSquare) {
    const movingPiece = { type: result.piece, color: result.color };
    const capturedPiece = result.captured ? { type: result.captured, color: result.color === 'w' ? 'b' : 'w' } : null;
    return {
        type: result.captured ? 'capture' : 'move',
        from: result.from,
        to: result.to,
        turn: chess.turn(),
        check: chess.inCheck(),
        checkmate: chess.isCheckmate(),
        inCheckColor: chess.inCheck() ? chess.turn() : '',
        moving: chessVoicePieceData(chess, theme, result.to, movingPiece, { from: result.from, to: result.to }),
        captured: capturedPiece ? chessVoicePieceData(chess, theme, capturedSquare || result.to, capturedPiece) : null,
        captureCard: capturedPiece ? chessVoiceCaptureCard(theme, result.captured) : null,
        tactical: chessVoiceTacticalState(chess, theme, false),
        kings: {
            w: chessVoiceFindKing(chess, theme, 'w'),
            b: chessVoiceFindKing(chess, theme, 'b')
        }
    };
}
function chessVoiceSelectDetail(chess, theme, square, piece, moves) {
    return {
        type: 'select',
        piece: chessVoicePieceData(chess, theme, square, piece),
        options: (moves || []).map(m => m.to),
        tactical: chessVoiceTacticalState(chess, theme, false),
        kings: {
            w: chessVoiceFindKing(chess, theme, 'w'),
            b: chessVoiceFindKing(chess, theme, 'b')
        }
    };
}
function App() {
    const [chess] = useState(() => new Chess());
    const [fen, setFen] = useState(chess.fen());
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [difficulty, setDifficulty] = useState('Fácil');
    const [theme, setTheme] = useState(1);
    const [isEngineThinking, setIsEngineThinking] = useState(false);
    const [gameOver, setGameOver] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [capturedPieces, setCapturedPieces] = useState([]);
    const [isAnimatingCapture, setIsAnimatingCapture] = useState(false);
    const [capturePopup, setCapturePopup] = useState(null);
    const aiMoveQueuedRef = useRef(false);
    const voiceActionPendingRef = useRef(false);
    const workerRef = useRef(null);
    // Initialize the AI worker
    useEffect(() => {
        workerRef.current = new Worker(AI_WORKER_URL, { type: 'module' });
        workerRef.current.onmessage = (e) => {
            const { bestMove, error } = e.data;
            if (error) {
                console.error('AI Error:', error);
                setIsEngineThinking(false);
                return;
            }
            if (bestMove) {
                chessVoiceAfterCurrentSpeech(() => {
                    executeMove(bestMove);
                    chessVoiceAfterCurrentSpeech(() => {
                        setIsEngineThinking(false);
                    });
                });
                return;
            }
            setIsEngineThinking(false);
        };
        return () => {
            workerRef.current?.terminate();
        };
    }, [chess]);
    // Handle deferred AI move
    const triggerAIMove = () => {
        if (aiMoveQueuedRef.current && chess.turn() === 'b' && !chess.isGameOver()) {
            const sendMoveRequest = () => {
                if (!aiMoveQueuedRef.current || chess.turn() !== 'b' || chess.isGameOver()) return;
                aiMoveQueuedRef.current = false;
                workerRef.current?.postMessage({
                    fen: chess.fen(),
                    difficulty
                });
            };
            chessVoiceAfterCurrentSpeech(sendMoveRequest);
        }
    };
    // Trigger whenever popup is closed (if AI move is pending)
    useEffect(() => {
        if (!capturePopup && aiMoveQueuedRef.current) {
            triggerAIMove();
        }
    }, [capturePopup]);
    // Clean up captured animations over time
    useEffect(() => {
        const interval = setInterval(() => {
            setCapturedPieces(prev => prev.filter(p => Date.now() - p.timestamp < 4500));
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const checkGameOver = () => {
        if (chess.isCheckmate()) {
            setGameOver(`Xeque-mate! ${chess.turn() === 'w' ? 'Pretas' : 'Brancas'} vencem.`);
            playVictorySound();
        }
        else if (chess.isDraw()) {
            setGameOver('Empate!');
        }
        else if (chess.isStalemate()) {
            setGameOver('Stalemate!');
        }
        else {
            setGameOver('');
        }
    };
    const executeMove = (moveInput) => {
        try {
            const result = chess.move(moveInput);
            let capPos = result.to;
            if (result.captured) {
                playGlassBreakSound();
                setIsAnimatingCapture(true);
                setTimeout(() => setIsAnimatingCapture(false), 3500);
                if (result.flags.includes('e')) {
                    // Adjust for En Passant
                    capPos = (result.to[0] + result.from[1]);
                }
                setCapturedPieces(prev => [...prev, {
                        id: Math.random().toString(),
                        type: result.captured,
                        team: result.color === 'w' ? 'b' : 'w',
                        position: squareToPos(capPos),
                        timestamp: Date.now()
                    }]);
                // Delay the popup so user can see it break first
                setTimeout(() => {
                    setCapturePopup({ type: result.captured, team: result.color === 'w' ? 'b' : 'w', card: chessVoiceCaptureCard(theme, result.captured) });
                }, 1200);
            }
            else {
                playGlassClink();
            }
            const voiceDetail = chessVoiceMoveDetail(chess, theme, result, result.captured ? capPos : result.to);
            setFen(chess.fen());
            setSelectedSquare(null);
            setValidMoves([]);
            chessVoiceEmit(voiceDetail);
            checkGameOver();
            if (chess.history().length === 1 || chess.history().length === 2) {
                setIsMenuOpen(false); // Hide menu organically when match starts
            }
            return result;
        }
        catch (e) {
            console.error("Move error:", e);
            return null;
        }
    };
    const handleSquareClick = (square) => {
        if (voiceActionPendingRef.current) {
            return;
        }
        playClickSound();
        if (isEngineThinking || chess.turn() === 'b' || gameOver || isAnimatingCapture) {
            if (!chessVoiceIsActive()) {
                chessVoiceEmit({ type: 'status', status: 'blocked', message: isEngineThinking || chess.turn() === 'b' ? 'Aguarde. Movimento da máquina em andamento.' : 'Aguarde a animação atual terminar.' });
            }
            return;
        }
        if (selectedSquare) {
            // Trying to move
            const move = validMoves.find((m) => m.to === square);
            if (move) {
                let moveAlreadyExecuted = false;
                const runMove = () => {
                    if (moveAlreadyExecuted) return;
                    moveAlreadyExecuted = true;
                    const result = executeMove(move);
                    voiceActionPendingRef.current = false;
                    if (result && !chess.isGameOver()) {
                        setIsEngineThinking(true);
                        aiMoveQueuedRef.current = true;
                        if (!result.captured) {
                            const delay = chessVoiceIsActive() ? 650 : 1500;
                            setTimeout(() => {
                                triggerAIMove();
                            }, delay);
                        }
                    }
                };
                if (chessVoiceIsActive()) {
                    voiceActionPendingRef.current = true;
                    const pendingWatchdog = setTimeout(() => {
                        if (voiceActionPendingRef.current) {
                            runMove();
                        }
                    }, 18000);
                    chessVoiceRunAfterSpeech(chessVoiceMoveActionMessage(chess, theme, move), () => {
                        clearTimeout(pendingWatchdog);
                        runMove();
                    });
                } else {
                    runMove();
                }
            }
            else {
                // Did we click another piece of ours?
                const piece = chess.get(square);
                if (piece && piece.color === 'w') {
                    const moves = chess.moves({ square, verbose: true });
                    setSelectedSquare(square);
                    setValidMoves(moves);
                    chessVoiceEmit(chessVoiceSelectDetail(chess, theme, square, piece, moves));
                }
                else {
                    setSelectedSquare(null);
                    setValidMoves([]);
                    chessVoiceEmit({ type: 'status', status: piece ? 'invalid' : 'cancel', message: piece ? 'Esta peça pertence ao inimigo. Selecione uma peça branca.' : 'Seleção cancelada.' });
                }
            }
        }
        else {
            // Select piece
            const piece = chess.get(square);
            if (piece && piece.color === 'w') {
                const moves = chess.moves({ square, verbose: true });
                setSelectedSquare(square);
                setValidMoves(moves);
                chessVoiceEmit(chessVoiceSelectDetail(chess, theme, square, piece, moves));
            }
            else if (piece) {
                chessVoiceEmit({ type: 'status', status: 'invalid', message: 'Esta peça pertence ao inimigo. Selecione uma peça branca.' });
            }
        }
    };
    const resetGame = () => {
        chess.reset();
        setFen(chess.fen());
        setSelectedSquare(null);
        setValidMoves([]);
        setCapturedPieces([]);
        setGameOver('');
        setIsEngineThinking(false);
        voiceActionPendingRef.current = false;
        setIsMenuOpen(true);
        chessVoiceEmit({ type: 'status', status: 'reset' });
    };
    const gameHistory = chess.history();
    const historyPairs = [];
    for (let i = 0; i < gameHistory.length; i += 2) {
        historyPairs.push({ w: gameHistory[i], b: gameHistory[i + 1] });
    }
    // Convert board state to workable array and include stable IDs for items so they animate correctly when moved
    const pieces = useMemo(() => {
        const p = [];
        const board = chess.board();
        // Warning: for flawless animations, pieces need permanent IDs.
        // For simplicity, using position-content ID here works well enough for simple interpolation.
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece) {
                    const sq = `${['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][c]}${8 - r}`;
                    p.push(_jsx(ChessPiece, { type: piece.type, team: piece.color, position: squareToPos(sq), onClick: () => handleSquareClick(sq), isHighlighted: selectedSquare === sq, themeId: theme }, `${piece.type}-${piece.color}-${sq}`));
                }
            }
        }
        // Add breaking animations
        capturedPieces.forEach(cap => {
            p.push(_jsx(ChessPiece, { type: cap.type, team: cap.team, position: cap.position, isBreaking: true, themeId: theme }, `cap-${cap.id}`));
        });
        return p;
    }, [fen, selectedSquare, handleSquareClick, capturedPieces, theme]);
    return (_jsxs("div", { className: "relative flex flex-col md:flex-row h-screen bg-gray-950 text-white font-sans overflow-hidden", children: [_jsx("button", { onClick: () => setIsMenuOpen(!isMenuOpen), className: "absolute top-4 left-4 z-50 p-3 bg-gray-900 border border-gray-700 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 shadow-xl transition-all", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "12", cy: "12", r: "3" }), _jsx("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" })] }) }), _jsxs("div", { className: `absolute top-0 left-0 h-full w-full md:w-80 bg-gray-900 border-r border-gray-800 p-6 pt-20 flex flex-col gap-6 z-40 shadow-2xl overflow-hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`, children: [_jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent", children: "LabChess 3D" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: "Qu\u00EDmica Encontra Estrat\u00E9gia" })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-sm uppercase tracking-wider text-gray-500 font-semibold", children: "Kit de Vidraria (Tema)" }), _jsxs("select", { value: theme, onChange: (e) => setTheme(Number(e.target.value)), className: "w-full bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-3 text-sm outline-none focus:border-emerald-500", children: [_jsx("option", { value: 1, children: "1. Cl\u00E1ssica (B\u00E9quer/Erlenmeyer)" }), _jsx("option", { value: 2, children: "2. Anal\u00EDtica Fina (Bureta/Vial)" }), _jsx("option", { value: 3, children: "3. S\u00EDntese/Destila\u00E7\u00E3o (\u00C2mbar/Condensador)" }), _jsx("option", { value: 4, children: "4. Conceitual Premium (Vigreux/Drechsel)" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-sm uppercase tracking-wider text-gray-500 font-semibold", children: "N\u00EDvel da IA" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: ['Fácil', 'Médio', 'Difícil', 'Profissional'].map((d) => (_jsx("button", { onClick: () => setDifficulty(d), disabled: gameHistory.length > 0 && !gameOver, className: `py-2 px-3 rounded-md text-sm font-medium transition-all ${difficulty === d
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                        : gameHistory.length > 0 && !gameOver
                                            ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`, children: d }, d))) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto space-y-4 pr-1", children: [_jsx("h2", { className: "text-sm uppercase tracking-wider text-gray-500 font-semibold", children: "Hist\u00F3rico de Jogadas" }), historyPairs.length === 0 ? (_jsx("div", { className: "text-gray-600 text-sm italic", children: "Nenhuma jogada feita." })) : (_jsx("div", { className: "space-y-1 bg-gray-950 p-2 rounded-lg border border-gray-800 h-40 overflow-y-auto", children: historyPairs.map((pair, idx) => (_jsxs("div", { className: "flex justify-between border-b border-gray-800 last:border-0 py-1 text-sm px-1", children: [_jsxs("span", { className: "text-gray-600 w-6", children: [idx + 1, "."] }), _jsx("span", { className: "text-emerald-400 font-medium flex-1 pl-2", children: pair.w }), _jsx("span", { className: "text-sky-400 font-medium flex-1", children: pair.b || '' })] }, idx))) })), _jsxs("div", { className: "space-y-2 mt-4", children: [_jsx("h2", { className: "text-sm uppercase tracking-wider text-gray-500 font-semibold", children: "Status" }), gameOver ? (_jsx("div", { className: "bg-red-900/30 border border-red-800 rounded-lg p-3 text-red-200", children: _jsx("span", { className: "font-bold text-md", children: gameOver }) })) : (_jsx("div", { className: `rounded-lg p-3 border transition-colors ${isEngineThinking
                                            ? 'bg-cyan-900/30 border-cyan-800 text-cyan-200 animate-pulse'
                                            : isAnimatingCapture
                                                ? 'bg-amber-900/30 border-amber-800 text-amber-200'
                                                : 'bg-emerald-900/30 border-emerald-800 text-emerald-200'}`, children: isEngineThinking ? 'A Máquina está pensando...' : isAnimatingCapture ? 'Garantindo reações químicas...' : 'Sua vez de jogar (Brancas)' })), chess.inCheck() && !gameOver && (_jsx("div", { className: "bg-yellow-900/30 border border-yellow-800 rounded-lg p-3 text-yellow-200", children: _jsx("span", { className: "font-bold", children: "Aviso: Voc\u00EA est\u00E1 em Xeque!" }) }))] })] }), _jsx("button", { onClick: resetGame, className: "w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-bold text-white transition-colors", children: "Reiniciar Partida" }), _jsx("div", { className: "text-xs text-center text-gray-600 space-y-1" })] }), _jsx("div", { className: "flex-1 relative w-full h-full", children: _jsxs(Canvas, { camera: { position: [0, 6, 8], fov: 45 }, children: [_jsx("ambientLight", { intensity: 0.4 }), _jsx("spotLight", { position: [10, 15, 10], angle: 0.3, penumbra: 1, intensity: 2, castShadow: true }), _jsx("pointLight", { position: [-10, 10, -10], intensity: 1, color: "#e0f7fa" }), _jsx(Environment, { preset: "city" }), _jsxs("group", { position: [0, -0.5, 0], children: [_jsx(ChessBoardFloor, { onSquareClick: handleSquareClick, highlightedSquares: validMoves.map(m => m.to) }), pieces, gameOver && chess.isCheckmate() && (_jsx(Text, { position: [0, 4, 0], fontSize: 1.5, color: chess.turn() === 'w' ? '#0ea5e9' : '#10b981', anchorX: "center", anchorY: "middle", outlineWidth: 0.05, outlineColor: "#ffffff", depthOffset: -1, rotation: [-Math.PI / 6, 0, 0], children: "VIT\u00D3RIA" })), _jsx(ContactShadows, { position: [0, -0.29, 0], opacity: 0.5, scale: 15, blur: 2.5, far: 4.5 })] }), _jsx(OrbitControls, { minPolarAngle: 0, maxPolarAngle: Math.PI / 2 - 0.1, minDistance: 4, maxDistance: 15 })] }) }), capturePopup && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4", children: _jsxs("div", { className: "bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl p-6 max-w-md w-full relative", children: [_jsxs("div", { className: "text-center mb-4", children: [_jsx("h3", { className: "text-2xl font-bold text-white mb-1", children: "Vidraria Capturada!" }), _jsx("p", { className: "text-emerald-400 font-medium", children: capturePopup.card?.name || GLASSWARE_THEMES[theme]?.[capturePopup.type]?.name || 'Vidraria' })] }), _jsx("div", { className: "h-64 w-full rounded-xl bg-gradient-to-tr from-gray-800 to-gray-900 border border-gray-800 mb-6 overflow-hidden relative shadow-inner", children: _jsxs(Canvas, { camera: { position: [0, 1.5, 3.5], fov: 40 }, children: [_jsx("ambientLight", { intensity: 0.6 }), _jsx("spotLight", { position: [5, 10, 5], angle: 0.3, penumbra: 1, intensity: 2 }), _jsx(Environment, { preset: "city" }), _jsx("group", { position: [0, -0.6, 0], children: _jsx(ChessPiece, { type: capturePopup.type, team: capturePopup.team, position: [0, 0, 0], isHighlighted: false, themeId: theme }) }), _jsx(OrbitControls, { autoRotate: true, autoRotateSpeed: 4, enableZoom: false, enablePan: false, maxPolarAngle: Math.PI / 2 + 0.2, minPolarAngle: 0.2 })] }) }), _jsxs("div", { className: "bg-gray-800/60 p-4 rounded-lg mb-6 border border-gray-700", children: [_jsx("h4", { className: "text-xs uppercase tracking-wider text-gray-500 font-bold mb-2", children: "Uso em Laborat\u00F3rio" }), _jsx("p", { className: "text-gray-300 text-sm leading-relaxed", children: capturePopup.card?.desc || GLASSWARE_THEMES[theme]?.[capturePopup.type]?.desc || 'Descrição não encontrada.' })] }), _jsx("button", { onClick: () => setCapturePopup(null), className: "w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-900/30 active:scale-[0.98]", children: "Entendi!" })] }) }))] }));
}

    createRoot(document.getElementById('root')).render(
      _jsx(StrictMode, {
        children: _jsx(App, {})
      })
    );
