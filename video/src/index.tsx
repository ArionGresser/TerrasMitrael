import React from "react";
import { Composition, registerRoot } from "remotion";
import { Trailer } from "./Trailer";
import { DURACAO, FPS } from "./roteiro";

function Raiz() {
  return (
    <Composition
      id="horizontal"
      component={Trailer}
      durationInFrames={Math.round(DURACAO * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
}

registerRoot(Raiz);
