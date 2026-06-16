import imgCustomIconDarkMode from "figma:asset/0063a433efeb8b898c37c90c552b6014726b3d18.png";

export default function AppIconIPhone() {
  return (
    <div className="relative size-full" data-name="App Icon/iPhone">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[5px] items-center relative size-full">
          <div className="overflow-clip relative shrink-0 size-[64px]" data-name="Icon">
            <div className="-translate-x-1/2 absolute aspect-[256/256] bottom-0 left-1/2 top-0" data-name="Custom-Icon-DarkMode">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgCustomIconDarkMode} />
            </div>
          </div>
          <p className="font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] overflow-hidden relative shrink-0 text-[12px] text-center text-ellipsis text-shadow-[0px_2px_25px_black] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            QuietSafe
          </p>
        </div>
      </div>
    </div>
  );
}