<script lang="ts">
  import Svelvet from "svelvet";
  import { cube3x3x3 } from "cubing/puzzles";
  import { randomScrambleForEvent } from "cubing/scramble";
  //! fix alg labels

  import { computePosition, MOVES, twizzleWrapper, Puzzle, MOVES_REGEX } from "./helpers";
  import type { CubeNode } from "./helpers";
  import {experimentalSolve3x3x3IgnoringCenters} from "cubing/search";

  let kpuzz;
  (async() => {
    kpuzz = await cube3x3x3.kpuzzle();
  })()



  const RADIUS = 50
  
  let height = document.documentElement.clientHeight;
  let width = document.documentElement.clientWidth;
  
  let id_count = 1;

  let selectedPuzzle:Puzzle;

  let INITIAL_STATE = "";
  // (async ()=>{INITIAL_STATE = await (await randomScrambleForEvent("333")).toString()})()

  // reload if above changes
  window.addEventListener("resize", () => {
    height = document.documentElement.clientHeight;
    width = document.documentElement.clientWidth;
  });

  let initialNodes:CubeNode[] = [
	  {
      id: 1,
      position: { x: width/2, y: -height/2 },
      data: { html: twizzleWrapper(INITIAL_STATE), state: INITIAL_STATE, clicked: false },
      width: 40,
      height: 40,
      borderColor: "transparent",
      bgColor: "transparent",
      borderRadius: 1000,
      clickCallback: onNodeClick
    }
	];

	let initialEdges = [
	];


function onNodeClick(
  node
) {
  const prev = node.data.state;
  const prevPosition = { x: node.positionX, y: node.positionY };
  const prevId = node.id;

  if (node.data.clicked) return;
  node.data.clicked = true;

  let newNodes = [];
  let newEdges = [];
  MOVES.forEach((move, pos) => {
      let existingNodeId = -1;
        initialNodes.forEach(node => {
          if (kpuzz.algToTransformation(node.data.state).isIdentical(kpuzz.algToTransformation(prev + " " + move))) {
            existingNodeId = node.id;
            return;
          }
        })
            
        if (existingNodeId > 0) {
          newEdges = [
            ...newEdges, 
            {
              id: `e${prevId}-${existingNodeId}`, source: prevId, target: existingNodeId, label: move, 
              labelBgColor: "transparent",
              labelTextColor: "red",
              type: "bezier",
              arrow: false
            }
          ]
        } else {
            const newPosition = computePosition(prevPosition, RADIUS, pos*Math.PI/6);
            id_count++;
            const newId = id_count;
            newNodes = [
            ...newNodes, 
            {
              id: newId,
              position: newPosition,
              data: { html: twizzleWrapper(prev + " " + move, selectedPuzzle), state: prev + " " + move, clicked: false },
              width: 40,
              height: 40,
              bgColor: "transparent",
              borderColor: "transparent",
              clickCallback: onNodeClick
            }
          ]
          newEdges = [
            ...newEdges, 
            {
              id: `e${prevId}-${newId}`, source: prevId, target: newId, label: move, 
              labelBgColor: "transparent",
              labelTextColor: "red",
              type: "bezier",
              arrow: false
            }
          ]
        } 
      }
    )
  initialNodes = [...initialNodes, ...newNodes]
  initialEdges = [...initialEdges, ...newEdges]
}

// for input form
let INPUT_VALUE: string = INITIAL_STATE;
$: INPUT_VALUE = INITIAL_STATE;

async function reset (initialState: string) {
    initialNodes = [
      {
        id: 1,
        position: { x: width/2, y: -height/2 },
        data: { html: twizzleWrapper(initialState, selectedPuzzle), state: initialState, clicked: false },
        width: 40,
        height: 40,
        borderColor: "transparent",
        borderRadius: 1000,
        bgColor: "transparent",
        clickCallback: onNodeClick
      }
    ];
    initialEdges = [];
    id_count = 1;
  }

async function genScramble() {
  const scramble = (await randomScrambleForEvent("333")).toString();
  INITIAL_STATE = scramble;
  initialNodes = [
    {
      id: 1,
      position: { x: width/2, y: -height/2 },
      data: { html: twizzleWrapper(scramble, selectedPuzzle), state: scramble, clicked: false },
      width: 40,
      height: 40,
      borderColor: "transparent",
      borderRadius: 1000,
      bgColor: "transparent",
      clickCallback: onNodeClick
    }
  ];
  initialEdges = [];
  id_count = 1;
}
</script>


<Svelvet 
	nodes={initialNodes} 
	width={width} height={height} 
	initialZoom={1} 
	initialLocation={initialNodes[0].position} 
	edges={initialEdges}
  bgColor="transparent"
  resizable={false}
/>
<div class="controls">
  <button on:click={()=>reset("")}>reset</button>
  <button on:click={genScramble}>scramble</button>
  <select bind:value="{selectedPuzzle}" on:change={()=>reset("")}>
    <option value="" disabled >select puzzle</option>
    <option value="3x3x3" selected>3x3</option>
    <option value="2x2x2">2x2</option>
  </select>
  <!-- <em>{selectedPuzzle}</em> -->
  <span>scramble:</span>
  <div class="scr">
    <textarea bind:value="{INPUT_VALUE}"></textarea>
    <div class="scr-controls">
      <button on:click={() => {
        // check if input value contains valid moves, R, R', U', U, etc
        if (INPUT_VALUE.match(MOVES_REGEX)) {
          reset(INPUT_VALUE);
        } else {
          // make not an alert later, red border perhaps
          alert("invalid scramble");
          INPUT_VALUE = "";
        }
      }}>set</button>
      <button on:click={async () => {
          const solveP = await experimentalSolve3x3x3IgnoringCenters(kpuzz.algToTransformation(INPUT_VALUE).toKState());
          let solve = solveP.toString();
          MOVES.forEach(m => {
            solve = solve.replaceAll(`${m}2`, `${m} ${m}`)
          })
          console.log(solve);
      }}>solve</button>
    </div>
  </div>
  
</div>
<div class="meta">
  <em>unique states explored: <i>{initialNodes.length}</i></em>
</div>

<style>
  :global(twisty-player) {
    width: 25px;
    height: 25px;
  }

  :global(twisty-player:hover) {
    width: 35px;
    height: 35px;
  }

  :global(.Node) {
    box-shadow: none !important;
  }

  :global(circle) {
    fill: transparent !important;
    stroke: transparent !important;
  }

  .controls {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 100;
    background: lightgray;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    /* display: grid; */
    display: flex;
    flex-direction: column;
    gap: 0.1em;
    /* grid-auto-flow: column; */
    text-align: center;
  }

  .scr {
    display: flex;
    flex-direction: row;
    gap: 0.1em;
  }

  .scr-controls {
    display: flex;
    flex-direction: column;
    gap: 0.1em;
  }

  .meta {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 100;
    background: lightgray;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    text-align: center;
  }
</style>