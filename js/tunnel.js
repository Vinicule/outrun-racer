class Tunnel {

  title;


  py;

  
  clipH;

  worldH;
  leftFace = new class {
    offsetX1 = 1.3;
    offsetX2 = 1.3;
  };
  rightFace = new class {
    offsetX1 = 1.3;
    offsetX2 = 1.3;
  };

  visibleFaces = new class {
    leftFront = true;
    rightFront = true;
    centerFront = true;
    leftTop = true;
    rightTop = true;
    centerTop = true;
    leftCover = true;
    rightCover = true;
    
  };


  previousSegment;
}

export default Tunnel;
