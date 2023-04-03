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
  
  let height = document.documentElement.clientHeight - 40;
  let width = document.documentElement.clientWidth;
  
  let id_count = 1;

  let selectedPuzzle:Puzzle;

  let INITIAL_STATE = "";
  (async ()=>{INITIAL_STATE = await (await randomScrambleForEvent("333")).toString()})()

  // reload if above changes
  window.addEventListener("resize", () => {
    height = document.documentElement.clientHeight - 40;
    width = document.documentElement.clientWidth;
  });

  let initialNodes = [
	  {
      id: 1,
      position: { x: width/2, y: -height/2 },
      data: { html: twizzleWrapper(INITIAL_STATE), state: INITIAL_STATE },
      width: 40,
      height: 40,
      borderColor: "transparent",
      bgColor: "transparent",
      borderRadius: 1000,
      clickCallback: () => { 
        onNodeClick("", {x: width/2, y: -height/2}, 1) 
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
              clickCallback: () => {
                onNodeClick(
                  prev + " " + move, 
                  computePosition(prevPosition, RADIUS, (pos+1)*Math.PI/6), 
                  newId
                )
              }
            }
          ]
          newEdges = [
            ...newEdges, 
            {
              id: `e${prevId}-${newId}`, source: prevId, target: newId, label: move, 
              labelBgColor: "white",
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
<div>
<button on:click={async () => {
  const scramble = (await randomScrambleForEvent("333")).toString();
  initialNodes = [
    {
      id: 1,
      position: { x: width/2, y: -height/2 },
      data: { html: twizzleWrapper(scramble, selectedPuzzle), state: scramble },
      width: 40,
      height: 40,
      borderColor: "transparent",
      borderRadius: 1000,
      bgColor: "transparent",
      clickCallback: () => { onNodeClick(scramble, {x: width/2, y: -height/2}, 1) }
    }
  ];
  initialEdges = [];
  id_count = 1;
}}>reset</button>
<em>states explored: {initialNodes.length}</em>
<select bind:value="{selectedPuzzle}">
  <option value="3x3x3">3x3</option>
  <option value="2x2x2">2x2</option>
</select>
<em>{selectedPuzzle}</em>
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
</style>