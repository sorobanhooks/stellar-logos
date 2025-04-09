import { motion } from 'framer-motion';


export function ColorPicker({ gradient, isAnimating = false }) {
  const gradientStyle = {
    background: `linear-gradient(135deg, 
      rgb(${gradient.start.r}, ${gradient.start.g}, ${gradient.start.b}),
      rgb(${gradient.end.r}, ${gradient.end.g}, ${gradient.end.b}))`
  };

  const ColorComponent = ({ color, label }) => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">{label}</h3>
      {Object.entries(color).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium capitalize">
              {key}
            </label>
            <motion.span
              className="px-2 py-1 font-mono text-sm rounded bg-black/30"
              animate={{ opacity: isAnimating ? [0.5, 1] : 1 }}
              transition={{ duration: 0.5, repeat: isAnimating ? Infinity : 0 }}
            >
              {value}
            </motion.span>
          </div>
          <div className="relative">
            <motion.div
              className="absolute h-1 rounded-full"
              style={{
                width: `${(value / 255) * 100}%`,
                backgroundColor: key === 'r' ? 'rgb(255,0,0)' :
                  key === 'g' ? 'rgb(0,255,0)' :
                    'rgb(0,0,255)',
                opacity: 0.5
              }}
              animate={{ width: `${(value / 255) * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <div className="w-full h-1 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full max-w-md gap-6">
      <motion.div
        className="w-full h-24 rounded-lg shadow-lg"
        style={gradientStyle}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />

      <div className="grid grid-cols-2 gap-8">
        <ColorComponent color={gradient.start} label="Gradient Start" />
        <ColorComponent color={gradient.end} label="Gradient End" />
      </div>
    </div>
  );
}