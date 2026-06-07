import React, { useEffect } from 'react';
import { Joyride } from 'react-joyride';
import TourTooltip from './TourTooltip';

const AutoClickBeacon = React.forwardRef((props, ref) => {
  const localRef = React.useRef(null);
  const combinedRef = ref || localRef;

  useEffect(() => {
    if (combinedRef && combinedRef.current) {
      combinedRef.current.click();
    }
  }, [combinedRef]);

  const { continuous, index, isLastStep, size, step, ...domProps } = props;

  return (
    <span
      ref={combinedRef}
      {...domProps}
      style={{ opacity: 0, position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
    />
  );
});

export default function AppJoyride({ steps, run, callback, ...props }) {
  return (
    <Joyride
        steps={steps}
        run={run}
        callback={callback}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        scrollToFirstStep={true}
        disableScrolling={false}
        disableScrollParentFix={true}
        scrollDuration={500}
        spotlightClicks={false}
        beaconComponent={AutoClickBeacon}
        tooltipComponent={TourTooltip}
        locale={{ back: 'Kembali', close: 'Tutup', last: 'Selesai ✔', next: 'Lanjut', skip: 'Lewati' }}
        styles={{
            options: { primaryColor: '#06b6d4', zIndex: 10000 },
            tooltip: { borderRadius: 14, padding: 20 },
            tooltipTitle: { fontSize: 15, fontWeight: 700, marginBottom: 6 },
            tooltipContent: { fontSize: 13, padding: '8px 0' },
        }}
        {...props}
    />
  );
}
