export enum Puzzle {
    "3x3x3", "2x2x2"
}

export function twizzleWrapper(alg: string, puzzle?: Puzzle) {
    return `<twisty-player puzzle=${puzzle ? puzzle : "3x3x3"} background='none' hint-facelets='none' control-panel='none' alg=\"${alg}\"></twisty-player>`
} 
/**
 * Returns position coordinate (Cartesian) for a point about a center, circularly.
 * @param center where to center point
 * @param radius radial distance from center
 * @param angle angle in radians
 * @returns position coordinate
 */
export function computePosition(center: {x: number, y: number}, radius: number, angle: number) {
    return {x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle)}
}

export const MOVES = [
    "R", 
    "R'", 
    "U", 
    "U'", 
    "L", 
    "L'", 
    "F", 
    "F'", 
    "B", 
    "B'", 
    "D", 
    "D'"
]

