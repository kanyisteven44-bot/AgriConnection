import WebMapView, * as WebMaps from '@teovilla/react-native-web-maps';
import React from 'react';

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = undefined;

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const MapView = React.forwardRef((props, ref) => {
  return (
    <WebMapView
      ref={ref}
      provider={PROVIDER_GOOGLE} // only google provider works on web
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      {...props}
      options={{
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        rotateControl: false,
        scaleControl: false,
        keyboardShortcuts: false,
        ...props.options,
      }}
    />
  );
});

// Copy the library's named members onto MapView as statics, but never spread the
// module namespace object directly. `WebMaps` is an ESM namespace whose `default`
// binding (re-exported via `export { MapView as default }`) is a read-only getter.
// Spreading it (`...WebMaps`) enumerates that `default` key, and the bundler's
// CJS/ESM interop then attempts to write `default` back onto a getter-only
// namespace, throwing "Cannot set property default of #<Object> which has only a
// getter" at module-eval time (surfaced inside <ContextNavigator>). Assign the
// named members explicitly instead.
const MAP_MEMBERS = [
  'Marker',
  'Callout',
  'Polyline',
  'Polygon',
  'Circle',
  'Geojson',
  'Overlay',
  'Heatmap',
  'UrlTile',
  'WMSTile',
  'LocalTile',
];
for (const member of MAP_MEMBERS) {
  if (WebMaps[member] !== undefined) {
    MapView[member] = WebMaps[member];
  }
}
MapView.PROVIDER_GOOGLE = PROVIDER_GOOGLE;
MapView.PROVIDER_DEFAULT = PROVIDER_DEFAULT;

export const {
  Marker,
  Callout,
  Polyline,
  Polygon,
  Circle,
  Geojson,
  Overlay,
  Heatmap,
  UrlTile,
  WMSTile,
  LocalTile,
} = WebMaps;

export default MapView;
