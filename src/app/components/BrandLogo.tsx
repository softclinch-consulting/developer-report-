import softclinchIcon from "../../assets/WhatsApp Image 2025-05-22 at 03.42.54_161add92.jpg";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  showTagline?: boolean;
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-20 h-20",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export function BrandLogo({
  size = "md",
  showWordmark = true,
  showTagline = false,
}: BrandLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-xl bg-white border border-[#d6def8] shadow-sm p-1.5`}
        aria-hidden="true"
      >
        <img src={softclinchIcon} alt="SoftClinch icon" className="w-full h-full object-contain" />
      </div>

      {showWordmark && (
        <div className="leading-tight">
          <div className={`${textSizeClasses[size]} font-bold tracking-tight`}>
            <span className="text-[#0A2E8A]">Soft</span>
            <span className="text-[#A93300]">Clinch</span>
          </div>
          {showTagline && (
            <div className="text-xs font-semibold text-[#0A2E8A]">
              We Ensure What We Assure
            </div>
          )}
        </div>
      )}
    </div>
  );
}
