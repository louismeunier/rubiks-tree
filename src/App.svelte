<script lang="ts">
  import Svelvet from "svelvet";
  import { cube3x3x3 } from "cubing/puzzles";
  import { randomScrambleForEvent } from "cubing/scramble";

  let kpuzz;
  (async() => {
    kpuzz = await cube3x3x3.kpuzzle();
  })()

  //! fix alg labels
  // don't let nodes be clicked twice

  import { computePosition, MOVES, twizzleWrapper, Puzzle } from "./helpers";

  const RADIUS = 50
  
  let height = document.documentElement.clientHeight - 50;
  let width = document.documentElement.clientWidth;
  
  let id_count = 1;

  let selectedPuzzle:Puzzle;

  let INITIAL_STATE = "";
  (async ()=>{INITIAL_STATE = await (await randomScrambleForEvent("333")).toString()})()

  // reload if above changes
  window.addEventListener("resize", () => {
    height = document.documentElement.clientHeight - 50;
    width = document.documentElement.clientWidth;
  });

  let initialNodes = [
	  {
      id: 1,
      position: { x: width/2, y: -height/2 },
      data: { html: twizzleWrapper(INITIAL_STATE), state: INITIAL_STATE, clicked: false },
      width: 40,
      height: 40,
      borderColor: "transparent",
      bgColor: "transparent",
      borderRadius: 1000,
      clickCallback: node => { 
        !node.data.clicked && onNodeClick("", {x: width/2, y: -height/2}, 1);
        node.data.clicked = true;
      }
    }
	];

	let initialEdges = [
	];


function onNodeClick(
  prev: string, 
  prevPosition: {x: number, y: number}, 
  prevId: number
) {
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
              arrow: true
            }
          ]
        } else {
            id_count++;
            const newId = id_count;
            newNodes = [
            ...newNodes, 
            {
              id: newId,
              position: computePosition(prevPosition, RADIUS, (pos+1)*Math.PI/6),
              data: { html: twizzleWrapper(prev + " " + move, selectedPuzzle), state: prev + " " + move, clicked: false },
              width: 40,
              height: 40,
              bgColor: "transparent",
              borderColor: "transparent",
              // borderRadius: 1000,
              clickCallback: node => {
                !node.data.clicked && onNodeClick(
                  prev + " " + move, 
                  computePosition(prevPosition, RADIUS, (pos+1)*Math.PI/6), 
                  newId
                )
                node.data.clicked = true;
              }
            }
          ]
          newEdges = [
            ...newEdges, 
            {
              id: `e${prevId}-${newId}`, source: prevId, target: newId, label: move, 
              labelBgColor: "transparent",
              labelTextColor: "red",
              type: "bezier",
              arrow: true
            }
          ]
        } 
      }
    )
  initialNodes = [...initialNodes, ...newNodes]
  initialEdges = [...initialEdges, ...newEdges]
}

// for input form
let INPUT_VALUE: string;

async function reset () {
    initialNodes = [
      {
        id: 1,
        position: { x: width/2, y: -height/2 },
        data: { html: twizzleWrapper("", selectedPuzzle), state: "", clicked: false },
        width: 40,
        height: 40,
        borderColor: "transparent",
        borderRadius: 1000,
        bgColor: "transparent",
        clickCallback: node => { !node.data.clicked && onNodeClick("", {x: width/2, y: -height/2}, 1); node.data.clicked = true; }
      }
    ];
    initialEdges = [];
    id_count = 1;
  }

async function genScramble() {
  const scramble = (await randomScrambleForEvent("333")).toString();
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
      clickCallback: node => { !node.data.clicked && onNodeClick(scramble, {x: width/2, y: -height/2}, 1); node.data.clicked = true; }
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
  <button on:click={reset}>reset</button>
  <button on:click={genScramble}>scramble</button>
  <select bind:value="{selectedPuzzle}" on:change={reset}>
    <option value="3x3x3">3x3</option>
    <option value="2x2x2">2x2</option>
  </select>
  <!-- <em>{selectedPuzzle}</em> -->
  <div>
    <textarea bind:value="{INPUT_VALUE}"></textarea>
    <button>submit!</button>
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
    display: grid;
    /* grid-auto-flow: column; */
    text-align: center;
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
    display: grid;
    text-align: center;
  }
</style>