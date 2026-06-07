import React from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const TourTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  size
}) => {
  return (
    <div
      {...tooltipProps}
      className="bg-white rounded-xl shadow-2xl border border-gray-100 w-[90vw] sm:w-[384px] max-w-[400px] overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
        <div>
          {step.title && (
            <h3 className="font-extrabold text-foreground text-base mb-1">{step.title}</h3>
          )}
          {size > 1 && (
            <div className="flex items-center gap-1.5 mt-2">
              {Array.from({ length: size }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-4 bg-primary' : i < index ? 'w-2 bg-blue-200' : 'w-2 bg-gray-200'}`} 
                />
              ))}
            </div>
          )}
        </div>
        {!step.disableCloseOnEsc && (
            <button
            {...closeProps}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors -mr-2 -mt-1 shrink-0"
            >
            <X className="w-4 h-4" />
            </button>
        )}
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        <div className="text-sm text-gray-600 leading-relaxed">
          {step.content}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        {index > 0 ? (
          <button
            {...backProps}
            className="text-xs font-bold text-gray-500 hover:text-foreground flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" /> Kembali
          </button>
        ) : (
          <div /> // Spacer
        )}

        <button
          {...primaryProps}
          className="btn-primary py-1.5 px-4 text-xs gap-1.5 flex items-center shadow-sm"
        >
          {isLastStep ? (
            <><Check className="w-3.5 h-3.5" /> Selesai</>
          ) : (
            <>Lanjut <ChevronRight className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default TourTooltip;
