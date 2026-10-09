import React from "react";
import { Composition, registerRoot } from "remotion";
import { Trailer } from "./Trailer";
import { FPS, montar } from "./roteiro";

function Raiz() {
  return (
    <>
      <Composition
        id="horizontal"
        component={Trailer}
        defaultProps={{ formato: "horizontal" as const }}
        durationInFrames={montar("horizontal").total}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
}

registerRoot(Raiz);
