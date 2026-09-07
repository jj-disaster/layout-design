// Ported from Clouds-Test-Project (three.js WebGPU + TSL compute particles).
// Adapted for use as a passive page background:
//   - stripped editor-only code (Inspector GUI, OrbitControls,
//     TransformControls, attractor helper meshes, keyboard shortcuts)
//   - sized to a container element instead of the full window
//   - fixed camera with a slow ambient drift instead of mouse controls
//   - pauses when the tab is hidden or prefers-reduced-motion is set
//   - returns a cleanup function (call on unmount / route change)
//
// Physics, noise fields, attractor layout and render settings are otherwise
// unchanged from the original piece.

import * as THREE from 'three/webgpu';
import { float, If, PI, color, cos, instanceIndex, Loop, min, mix, mod, pass, sin, instancedArray, Fn, uint, uniform, uniformArray, hash, vec3, vec4, mx_fractal_noise_vec3 } from 'three/tsl';

import { curlNoise } from 'three/examples/jsm/tsl/math/curlNoise.js';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';

export async function createCloudBackground( container, options = {} ) {

  const {
    particleExponent = 18,
    // Used when three.js falls back to its WebGL2 backend (transform-feedback
    // compute is far slower than WebGPU compute). Set to 0 to keep full count.
    fallbackParticleExponent = 14,
    clearColor = '#000000',
    cameraDriftSpeed = 0.03,
    bloomEnabled = true,
    bloomStrength = 1,
    bloomRadius = 0.2,
    bloomThreshold = 0.4,
  } = options;

  // ================================================================
  // PARAMETERS — every value that changes the look of the piece lives
  // here, grouped the way the old test-scene GUI grouped them. Nothing
  // below this block declares a tunable; edit values here freely.
  // (particleExponent / fallbackParticleExponent / clearColor /
  // cameraDriftSpeed come from `options` above.)
  // ================================================================

  // ---- System Physics ----
  const attractorMass = uniform( Number( `1e${7}` ) );
  const particleGlobalMass = uniform( Number( `1e${4}` ) );
  const timeScale = uniform( 1 );
  const maxSpeed = uniform( 10 );
  const colorTopSpeed = uniform(5);
  const velocityDamping = uniform( 0.1 );
  const velocityDecay = uniform( 1 );
  const boundHalfExtent = uniform( 15 );
  const gravityConstant = 6.67e-11;

  // ---- Age ----
  const ageLifespan = uniform( 3 );
  const ageLifespanVariation = uniform( 1 );
  const randomizeStartingAge = uniform( 1 );

  // ---- Flow Field: Flow ----
  const flowEnabled = uniform( 1 );
  const flowStrength = uniform(3);
  const flowNoiseCurlWeight = uniform( 1 );
  const flowNoiseFractalWeight = uniform( 0 );

  // ---- Flow Field: Proximity ----
  const proximityFlowEnabled = uniform( 1 );
  const proximityFlowStrength = uniform( 3 );
  const proximityNoiseCurlWeight = uniform( 0 );
  const proximityNoiseFractalWeight = uniform( 1 );
  const proximityInfluenceRadius = uniform( 1.5 );
  const proximityMix = uniform( 0 );

  // ---- Noise: Curl ----
  const noiseCurlSpeed = { value: 0 };
  const noiseCurlTime = uniform( 0 );
  const noiseCurlFrequency = uniform( 1.25 );

  // ---- Noise: Fractal ----
  const noiseFractalSpeed = { value: 0 };
  const noiseFractalTime = uniform( 0 );
  const noiseFractalFrequency = uniform( 1 );
  const noiseFractalOctaves = uniform( 3 );
  const noiseFractalLacunarity = uniform( 3 );
  const noiseFractalDiminish = uniform( 1 );

  // ---- Attractors ----
  // (row-based: { position, axis, enabled, mass, strength, repel } per
  // attractor — no helper meshes or gizmos in background mode)
  // Values copied verbatim from the original test scene's .fill() definitions.
  const attractors = [
    { position: [ - 1, 0, 0 ], axis: [ 0, 1, 0 ], enabled: 1, mass: 1, strength: 1, repel: 0 },
    { position: [ 1, 0, - 0.5 ], axis: [ 1, 0, 0 ], enabled: 1, mass: 1, strength: 1, repel: 0 },
    { position: [ 0, 0.5, 1 ], axis: [ 0, 0, - 0.5 ], enabled: 1, mass: 1, strength: 1, repel: 0 },
    { position: [ 1, 0.5, 1 ], axis: [ 0.2, 0.8, 0.4 ], enabled: 0, mass: 1, strength: 3, repel: 1 },
    { position: [ 0, 2, - 0.5 ], axis: [ - 0.5, 0.3, 0.8 ], enabled: 0, mass: 1, strength: 1, repel: 1 },
  ];
  const attractorsLength = uniform( attractors.length, 'uint' );
  const attractorsPositions = uniformArray( attractors.map( a => new THREE.Vector3( ...a.position ) ) );
  const attractorsRotationAxes = uniformArray( attractors.map( a => new THREE.Vector3( ...a.axis ).normalize() ) );
  const attractorMasses = uniformArray( attractors.map( a => a.mass ) );
  // First 3 attractors on, rest off — matches the original test scene.
  const attractorEnabled = uniformArray( attractors.map( a => a.enabled ) );
  const attractorStrengths = uniformArray( attractors.map( a => a.strength ) );
  const attractorRepel = uniformArray( attractors.map( a => a.repel ) );
  const attractorsEnabled = uniform( 1 );
  const globalAttractorStrength = uniform( 3 );
  const spinningStrength = uniform( 2.31 );
  const gravityStrengthMultiplier = uniform( 0.35 );
  const resetRadius = uniform( 0.1 );
  const resetEnabled = uniform( 0 );
  const resetSeed = uniform( uint( Math.random() * 0xffffff ) );

  // ---- Render ----
  const colorA = uniform( color( '#c0c0c0' ) );
  const colorB = uniform( color( '#ad76c2' ) );
  const colorAOpacity = uniform( 1 );
  const colorBOpacity = uniform( 1 );
  const materialOpacity = uniform( 1);
  const scale = uniform( 0.01 );
  const speedScaleMultiplier = uniform( 5 );
  const speedScaleOffset = uniform( 1 );
  const particleBlending = THREE.NormalBlending;
  // const particleBlending = THREE.AdditiveBlending;

  // ---- Bloom ----
  // (bloomStrength / bloomRadius / bloomThreshold / bloomEnabled come from
  // `options` above — see BloomNode for details)

  // ================================================================
  // End of PARAMETERS — machinery below, no tunables.
  // ================================================================

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const camera = new THREE.PerspectiveCamera( 50, width / height, 0.0001, 1000 );
  camera.position.set( 3, 5, 8 );

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGPURenderer( { antialias: true } );
  renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
  renderer.setSize( width, height );
  renderer.setClearColor( clearColor );

  try {

    await renderer.init();

  } catch {

    renderer.dispose();
    return null;

  }

  renderer.domElement.style.display = 'block';
  container.appendChild( renderer.domElement );

  // render pipeline (scene pass + TSL bloom)

  const scenePass = pass( scene, camera );
  let bloomPassNode = null;
  const renderPipeline = new THREE.RenderPipeline( renderer );

  if ( bloomEnabled ) {

    const scenePassColor = scenePass.getTextureNode( 'output' );
    bloomPassNode = bloom( scenePassColor, bloomStrength, bloomRadius, bloomThreshold );
    renderPipeline.outputNode = scenePassColor.add( bloomPassNode );

  } else {

    renderPipeline.outputNode = scenePass;

  }

  const renderFrame = () => {

    if ( bloomEnabled ) renderPipeline.render();
    else renderer.render( scene, camera );

  };

  // particles

  const material = new THREE.SpriteNodeMaterial( { blending: particleBlending, transparent: true, depthWrite: false } );
  const geometry = new THREE.PlaneGeometry( 1, 1 );
  // renderer.init() above may have engaged three.js's automatic WebGL2
  // fallback — drop the particle count in that case for performance.
  const effectiveExponent = ( renderer.backend.isWebGLBackend === true && fallbackParticleExponent > 0 )
    ? fallbackParticleExponent
    : particleExponent;
  const particleCount = Math.pow( 2, effectiveExponent );

  const noiseCurl = Fn( ( [ pos ] ) => {

    return curlNoise( pos.mul( noiseCurlFrequency ).add( vec3( 0, 0, noiseCurlTime ) ) );

  } );

  const noiseFractal = Fn( ( [ pos ] ) => {

    return mx_fractal_noise_vec3( pos.mul( noiseFractalFrequency ).add( vec3( 0, 0, noiseFractalTime ) ), noiseFractalOctaves, noiseFractalLacunarity, noiseFractalDiminish );

  } );

  const noiseCombinedFlow = Fn( ( [ pos ] ) => {

    return noiseCurl( pos ).mul( flowNoiseCurlWeight )
      .add( noiseFractal( pos ).mul( flowNoiseFractalWeight ) );

  } );

  const noiseCombinedProximity = Fn( ( [ pos ] ) => {

    return noiseCurl( pos ).mul( proximityNoiseCurlWeight )
      .add( noiseFractal( pos ).mul( proximityNoiseFractalWeight ) );

  } );

  const positionBuffer = instancedArray( particleCount, 'vec3' );
  const velocityBuffer = instancedArray( particleCount, 'vec3' );
  const ageBuffer = instancedArray( particleCount, 'float' );
  const maxAgeBuffer = instancedArray( particleCount, 'float' );
  const initialPositionBuffer = instancedArray( particleCount, 'vec3' );

  const sphericalToVec3 = Fn( ( [ phi, theta ] ) => {

    const sinPhiRadius = sin( phi );

    return vec3(
      sinPhiRadius.mul( sin( theta ) ),
      cos( phi ),
      sinPhiRadius.mul( cos( theta ) )
    );

  } );

  // init compute
  // Split into two passes so the WebGL2 transform-feedback fallback never
  // writes more than MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS output varyings
  // (guaranteed >= 4 on mobile GPUs; desktop WebGPU has no such limit).
  // Pass A: position / initialPosition / velocity (3 outputs)

  const initPosition = Fn( () => {

    const position = positionBuffer.element( instanceIndex );
    const velocity = velocityBuffer.element( instanceIndex );
    const initialPosition = initialPositionBuffer.element( instanceIndex );

    const basePosition = vec3(
      hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ),
      hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ),
      hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) )
    ).sub( 0.5 ).mul( vec3( 15,15, 15 ) ).add( vec3( 0, 1, 0 ) );
    position.assign( basePosition );
    initialPosition.assign( basePosition );

    const phi = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).mul( PI ).mul( 2 );
    const theta = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).mul( PI );
    const baseVelocity = sphericalToVec3( phi, theta ).mul( 0.05 );
    velocity.assign( baseVelocity );

  } );
  const initPositionCompute = initPosition().compute( particleCount ).setName( 'Init Particles (position)' );

  // Pass B: age / maxAge (2 outputs)

  const initAge = Fn( () => {

    const age = ageBuffer.element( instanceIndex );
    const maxAge = maxAgeBuffer.element( instanceIndex );

    const particleMaxAge = float( ageLifespan ).add( hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).mul( 2 ).sub( 1 ).mul( ageLifespanVariation ) );
    maxAge.assign( particleMaxAge );

    If( randomizeStartingAge.equal( 1 ), () => {

      age.assign( hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).mul( particleMaxAge ) );

    } ).Else( () => {

      age.assign( 0 );

    } );

  } );
  const initAgeCompute = initAge().compute( particleCount ).setName( 'Init Particles (age)' );

  // update compute

  const particleMassMultiplier = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).remap( 0.25, 1 ).toVar();
  const particleMass = particleMassMultiplier.mul( particleGlobalMass ).toVar();

  const update = Fn( () => {

    const delta = float( 1 / 60 ).mul( timeScale ).toVar(); // uses fixed delta to consistent result
    const position = positionBuffer.element( instanceIndex );
    const velocity = velocityBuffer.element( instanceIndex );
    const age = ageBuffer.element( instanceIndex );

    // age

    age.addAssign( delta );

    // force

    const force = vec3( 0 ).toVar();

    const minDistToAttractor = float( 1e10 ).toVar();

    //attractor forces by attractor i
    Loop( attractorsLength, ( { i } ) => {

      const attractorPosition = attractorsPositions.element( i );
      const attractorRotationAxis = attractorsRotationAxes.element( i );
      const toAttractor = attractorPosition.sub( position );
      const distance = toAttractor.length();

      If( attractorEnabled.element( i ).equal( 1 ), () => {

        minDistToAttractor.assign( min( minDistToAttractor, distance ) );

      } );

      If( distance.lessThan( resetRadius.mul( resetEnabled ) ), () => {

        const resetPosition = vec3(
          hash( instanceIndex.add( resetSeed ) ),
          hash( instanceIndex.add( resetSeed.mul( 2 ) ) ),
          hash( instanceIndex.add( resetSeed.mul( 3 ) ) )
        ).sub( 0.5 ).mul( vec3( 5, 5, 5 ) );
        position.assign( resetPosition );

        const phi = hash( instanceIndex.add( resetSeed.mul( 4 ) ) ).mul( PI ).mul( 2 );
        const theta = hash( instanceIndex.add( resetSeed.mul( 5 ) ) ).mul( PI );
        velocity.assign( sphericalToVec3( phi, theta ).mul( 0.05 ) );

      } ).Else( () => {

        const direction = toAttractor.normalize();

        // gravity
        const gravityStrength = attractorMass.mul( attractorMasses.element( i ) ).mul( attractorEnabled.element( i ) ).mul( attractorsEnabled ).mul( attractorStrengths.element( i ) ).mul( globalAttractorStrength ).mul( particleMass ).mul( gravityConstant ).div( distance.pow( 2 ) ).toVar();
        const repelSign = float( 1 ).sub( attractorRepel.element( i ).mul( 2 ) );
        const gravityForce = direction.mul( gravityStrength ).mul( gravityStrengthMultiplier ).mul( repelSign );
        force.addAssign( gravityForce );

        // spinning
        const spinningForce = attractorRotationAxis.mul( gravityStrength ).mul( spinningStrength );
        const spinningVelocity = spinningForce.cross( toAttractor );
        force.addAssign( spinningVelocity );

      } );

    } );

    // flow field

    If( flowEnabled.equal( 1 ), () => {

      force.addAssign( noiseCombinedFlow( position ).mul( flowStrength ) );

    } );

    // proximity flow field (scaled by attractor proximity)

    If( proximityFlowEnabled.equal( 1 ), () => {

      const proximityCurve = minDistToAttractor.smoothstep( 0, proximityInfluenceRadius );
      const proximityMultiplier = mix( proximityMix, float( 1 ), float( 1 ).sub( proximityCurve ) ).mul( 5 );
      force.addAssign( noiseCombinedProximity( position ).mul( proximityFlowStrength ).mul( proximityMultiplier ) );

    } );

    // velocity

    velocity.addAssign( force.mul( delta ) );
    const speed = velocity.length();
    If( speed.greaterThan( maxSpeed ), () => {

      velocity.assign( velocity.normalize().mul( maxSpeed ) );

    } );
    velocity.mulAssign( velocityDecay );

    // position

    position.addAssign( velocity.mul( delta ) );

    // age
    // age only increments here. The old age-reset branch is omitted because it
    // read maxAge/initialPosition, which on three.js's WebGL2 fallback would
    // register 5 transform-feedback varyings — over the mobile limit of 4.
    // With the age system disabled by default this had no visible effect.

    // box loop

    const halfHalfExtent = boundHalfExtent.div( 2 ).toVar();
    position.assign( mod( position.add( halfHalfExtent ), boundHalfExtent ).sub( halfHalfExtent ) );

  } );
  const updateCompute = update().compute( particleCount ).setName( 'Update Particles' );

  // nodes

  material.positionNode = positionBuffer.toAttribute();

  material.colorNode = Fn( () => {

    const velocity = velocityBuffer.toAttribute();
    const speed = velocity.length();
    const colorMix = speed.div( colorTopSpeed ).smoothstep( 0, 1 );
    const finalColor = mix( colorA, colorB, colorMix );
    const alpha = mix( colorAOpacity, colorBOpacity, colorMix ).mul( materialOpacity );

    return vec4( finalColor, alpha );

  } )();

  const velocity = velocityBuffer.toAttribute();
  const speed = velocity.length();
  const scaleSpeedMult = speed.div( maxSpeed ).smoothstep( 0, 1 ).mul( speedScaleMultiplier ).add( speedScaleOffset );
  material.scaleNode = particleMassMultiplier.mul( scale ).mul( scaleSpeedMult );

  // mesh

  const mesh = new THREE.InstancedMesh( geometry, material, particleCount );
  scene.add( mesh );

  renderer.compute( initPositionCompute );
  renderer.compute( initAgeCompute );

  // ambient camera drift (replaces OrbitControls)

  const camRadius = Math.hypot( camera.position.x, camera.position.z );
  let camAngle = Math.atan2( camera.position.z, camera.position.x );
  camera.lookAt( 0, 1, 0 );

  // pause when hidden / reduced motion

  const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
  let running = ! reducedMotion;

  const onVisibilityChange = () => {

    running = ! document.hidden && ! reducedMotion;

  };
  document.addEventListener( 'visibilitychange', onVisibilityChange );

  // resize to container

  const resizeObserver = new ResizeObserver( () => {

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize( w, h );

  } );
  resizeObserver.observe( container );

  renderer.setAnimationLoop( () => {

    if ( ! running ) return;

    resetSeed.value = ( resetSeed.value + 1 ) >>> 0;

    noiseCurlTime.value += ( 1 / 60 ) * timeScale.value * noiseCurlSpeed.value;
    noiseFractalTime.value += ( 1 / 60 ) * timeScale.value * noiseFractalSpeed.value;

    velocityDecay.value = Math.pow( 1 - velocityDamping.value, timeScale.value );

    camAngle += ( 1 / 60 ) * cameraDriftSpeed;
    camera.position.x = Math.cos( camAngle ) * camRadius;
    camera.position.z = Math.sin( camAngle ) * camRadius;
    camera.lookAt( 0, 1, 0 );

    renderer.compute( updateCompute );
    renderFrame();

  } );

  // render one frame immediately so reduced-motion still shows the field
  renderer.compute( updateCompute );
  renderFrame();

  return () => {

    renderer.setAnimationLoop( null );
    resizeObserver.disconnect();
    document.removeEventListener( 'visibilitychange', onVisibilityChange );
    scene.remove( mesh );
    geometry.dispose();
    material.dispose();
    renderPipeline.dispose();
    if ( bloomPassNode ) bloomPassNode.dispose();
    renderer.dispose();
    if ( renderer.domElement.parentElement === container ) {

      container.removeChild( renderer.domElement );

    }

  };

}
