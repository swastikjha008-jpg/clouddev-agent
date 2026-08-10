"use client";

import { type ComponentProps, type CSSProperties, useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                              frame generation                              */
/* -------------------------------------------------------------------------- */

export type SnakeFrames = {
    /** Cells occupied by the snake, one entry per frame. */
    body: number[][];
    /** Cell holding the apple, one entry per frame. */
    apples: number[][];
};

/** Neighbours of a cell on a `w × w` grid, as flat indices. */
function neighbours(p: number, w: number): number[] {
    const row = (p / w) | 0;
    const col = p % w;
    const out: number[] = [];
    if (row > 0) out.push(p - w);
    if (row < w - 1) out.push(p + w);
    if (col > 0) out.push(p - 1);
    if (col < w - 1) out.push(p + 1);
    return out;
}

/** Shortest path length from `from` to `to`, walls excluded. */
function distance(from: number, to: number, walls: Set<number>, w: number, n: number): number {
    if (from === to) return 0;
    const seen = new Set([from]);
    let front = [from];
    let d = 0;
    while (front.length) {
        d++;
        const next: number[] = [];
        for (const cell of front) {
            for (const nb of neighbours(cell, w)) {
                if (nb === to) return d;
                if (!seen.has(nb) && !walls.has(nb)) {
                    seen.add(nb);
                    next.push(nb);
                }
            }
        }
        front = next;
    }
    return n + 1;
}

/** Size of the free region reachable from `start`. */
function reachable(start: number, walls: Set<number>, w: number): number {
    const seen = new Set([start]);
    const queue = [start];
    let i = 0;
    while (i < queue.length) {
        for (const nb of neighbours(queue[i++], w)) {
            if (!seen.has(nb) && !walls.has(nb)) {
                seen.add(nb);
                queue.push(nb);
            }
        }
    }
    return seen.size;
}

function firstFree(walls: Set<number>, n: number): number {
    for (let i = 0; i < n; i++) if (!walls.has(i)) return i;
    return -1;
}

/**
 * True when moving into `cell` leaves the snake room to keep going: the open
 * region it lands in must hold at least its own body.
 */
function isSafe(cell: number, apple: number, tail: number, used: Set<number>, length: number, w: number): boolean {
    const walls = new Set(used);
    if (cell !== apple) walls.delete(tail);
    walls.add(cell);
    return reachable(cell, walls, w) > length;
}

/**
 * Plays a full game of snake and returns it as animation frames.
 *
 * The snake takes the shortest path to each apple, but only steps where the
 * open space left in front of it is bigger than its own body — so it does not
 * box itself in. The game ends when it runs out of moves or out of steps.
 * Every call plays a different game.
 */
export function generateSnakeFrames(width = 7): SnakeFrames {
    const w = Math.max(3, Math.floor(width));
    const n = w * w;

    const snake = [0, 1];
    const used = new Set(snake);
    const body: number[][] = [];
    const apples: number[][] = [];

    const spawn = (): number => {
        const free: number[] = [];
        for (let i = 0; i < n; i++) if (!used.has(i)) free.push(i);
        return free.length ? free[(Math.random() * free.length) | 0] : -1;
    };

    let apple = spawn();
    // Keeps every loop a similar length, however lucky the snake gets.
    let budget = n * 5;

    while (snake.length < n && apple >= 0 && --budget > 0) {
        body.push([...snake]);
        apples.push([apple]);

        const head = snake[snake.length - 1];
        const tail = snake[0];

        // The tail square is legal: it empties on the same step the head enters.
        const open = neighbours(head, w).filter((nb) => !used.has(nb) || nb === tail);

        let move = -1;
        let best = n + 1;
        for (const nb of open) {
            if (!isSafe(nb, apple, tail, used, snake.length, w)) continue;
            const d = distance(nb, apple, used, w, n);
            if (d < best) {
                best = d;
                move = nb;
            }
        }

        // No safe step towards the apple — head for the roomiest square instead.
        if (move < 0) {
            let room = -1;
            for (const nb of open) {
                const sim = new Set(used);
                sim.delete(tail);
                sim.add(nb);
                const seed = firstFree(sim, n);
                const size = seed >= 0 ? reachable(seed, sim, w) : 0;
                if (size > room) {
                    room = size;
                    move = nb;
                }
            }
            if (move < 0) break;
        }

        const grows = move === apple;
        if (!grows) used.delete(snake.shift()!);
        snake.push(move);
        used.add(move);
        if (grows) apple = spawn();
    }

    // Two blinks of the finished board close the loop.
    const full = [...snake];
    body.push(full, full, [], full, []);
    apples.push([], [], [], [], []);

    return { body, apples };
}

/* -------------------------------------------------------------------------- */
/*                                  component                                 */
/* -------------------------------------------------------------------------- */

export type SnakeLoaderProps = {
    /** Cells per side. Default `7`. */
    width?: number;
    /** Milliseconds per step. Default `80`. */
    speed?: number;
    /** Pause or resume the animation. Default `true`. */
    playing?: boolean;
    /** Deal a fresh game when the board fills up. Default `true`. */
    loop?: boolean;
    /** Called every time a game finishes. */
    onComplete?: () => void;
    /** Any CSS colour for the snake. Defaults to the inherited text colour. */
    snakeColor?: string;
    /** Any CSS colour for the apple. Default `#A3E635`. */
    appleColor?: string;
    /**
     * Classes for a single dot — use this for size and shape, or to override
     * the colours with `[&.active]:…` and `[&.accent]:…`.
     */
    dotClassName?: string;
} & ComponentProps<"div">;

export function SnakeLoader({
    width = 7,
    speed = 80,
    playing = true,
    loop = true,
    onComplete,
    snakeColor = "currentColor",
    appleColor = "#A3E635",
    dotClassName,
    className,
    style,
    ...props
}: SnakeLoaderProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const frame = useRef(0);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);

    const [round, setRound] = useState(0);
    const [game, setGame] = useState<SnakeFrames | null>(null);

    // Held in a ref so an inline callback does not restart the animation.
    const completeRef = useRef(onComplete);
    completeRef.current = onComplete;

    // Generated on the client so the server and the first paint agree.
    useEffect(() => {
        setGame(generateSnakeFrames(width));
        frame.current = 0;
    }, [width, round]);

    const paint = useCallback(
        (dots: HTMLDivElement[], index: number) => {
            if (!game) return;
            const body = game.body[index];
            if (!body) return;
            const apple = game.apples[index];

            dots.forEach((dot, i) => {
                const isApple = apple?.includes(i) ?? false;
                dot.classList.toggle("active", !isApple && body.includes(i));
                dot.classList.toggle("accent", isApple);
            });
        },
        [game],
    );

    useEffect(() => {
        if (!game || !playing) return;

        const grid = gridRef.current;
        if (!grid) return;
        const dots = Array.from(grid.children) as HTMLDivElement[];

        if (frame.current >= game.body.length) frame.current = 0;

        timer.current = setInterval(() => {
            paint(dots, frame.current);

            if (frame.current + 1 >= game.body.length) {
                completeRef.current?.();
                if (loop) {
                    setRound((r) => r + 1);
                    return;
                }
                clearInterval(timer.current!);
            }
            frame.current++;
        }, speed);

        return () => {
            if (timer.current) clearInterval(timer.current);
        };
    }, [game, playing, speed, loop, paint]);

    return (
        <div
            {...props}
            ref={gridRef}
            role="status"
            aria-label="Loading"
            className={cn("grid w-fit gap-0.5", className)}
            style={
                {
                    gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
                    "--snake-color": snakeColor,
                    "--apple-color": appleColor,
                    ...style,
                } as CSSProperties
            }
        >
            {Array.from({ length: width * width }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "size-1.5 rounded-[1px] transition-colors duration-100",
                        "bg-[color-mix(in_srgb,currentColor_12%,transparent)]",
                        "[&.active]:bg-[var(--snake-color)] [&.accent]:bg-[var(--apple-color)]",
                        dotClassName,
                    )}
                />
            ))}
        </div>
    );
}

export default SnakeLoader;
