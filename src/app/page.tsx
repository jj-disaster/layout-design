import CloudBackground from "@/components/three/CloudBackground";

export default function Page() {
  return (
    <div className="relative h-full bg-black">
      <CloudBackground />
      {/* darkens the particle system*/}
      <div className="behind-content"></div>

      {/* Temporary guides: toggle with --show-guides in globals.css */}
      {/* On mobile the text column goes full-width; 2/5-1/5-2/5 from md: up */}
      <div className="relative flex h-full flex-1">
        <div className="guide flex flex-1 flex-col items-center justify-center gap-0 md:flex-[2]">
          <div className="guide textboxBackground font-nanum h-[calc(60vh+4rem)] w-4/5 md:w-full md:max-w-md">
            <div className="guide textbox text-[1.5rem] h-16 w-max">Hi I'm <span className="highlight">jj_disaster ⚞^. .^⚟</span></div>
              
            <div className="guide textbox text-base h-max w-full">meow meow meow meow meow meow meow (to be description) blah blah blah blah blah</div>
          </div>
        </div> 
        <div className="guide hidden flex-[1] md:block" />
        <div className="guide hidden flex-[2] md:block" />
      </div>
    </div>
  );
}
