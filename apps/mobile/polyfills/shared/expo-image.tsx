import type { ImageProps } from 'expo-image';
import { Image as ExpoImageComponent } from 'expo-image';
import * as ExpoImage from 'expo-image';
import { Buffer } from 'buffer';
import React, {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { Platform } from 'react-native';

function buildGridPlaceholder(w: number, h: number): string {
  const size = Math.max(w, h);

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 895 895"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="895" height="895" rx="19" fill="#E9E7E7"/>
    </svg>
  `;

  const b64 = Buffer.from(svg).toString('base64');

  return `data:image/svg+xml;base64,${b64}`;
}

type Src = ImageProps['source'];

function computeSourceKey(src: Src): string {
  if (Array.isArray(src)) return src.map(computeSourceKey).join('|');

  if (typeof src === 'number')
    return String(src);

  if (typeof src === 'string')
    return src;

  if (
    src &&
    typeof src === 'object' &&
    'uri' in src
  ) {
    return src.uri ?? '';
  }

  return '';
}

const WrappedImage = forwardRef<any, ImageProps>(
function WrappedImage(props, ref) {

  const [fallbackSource, setFallbackSource] =
    useState<Src | null>(null);

  const currentKey = computeSourceKey(props.source);

  const prevKeyRef = useRef(currentKey);

  useEffect(() => {
    if (prevKeyRef.current !== currentKey) {
      setFallbackSource(null);
      prevKeyRef.current = currentKey;
    }
  }, [currentKey]);

  const handleError = useCallback(
    (e: any) => {

      props.onError?.(e);

      if (
        fallbackSource ||
        Array.isArray(props.source)
      ) return;

      if (
        props.source &&
        typeof props.source === 'object' &&
        'uri' in props.source &&
        props.source.uri?.startsWith('data:')
      ) {
        return;
      }

      const finalStyle = Array.isArray(props.style)
        ? Object.assign({}, ...props.style)
        : props.style;

      const width = finalStyle?.width ?? 128;
      const height = finalStyle?.height ?? 128;

      if (Platform.OS === 'web') {
        setFallbackSource({
          uri: buildGridPlaceholder(
            width,
            height
          )
        });
      } else {
        setFallbackSource(
          require('../../src/__create/placeholder.svg')
        );
      }
    },
    [props, fallbackSource]
  );

  return (
    <ExpoImageComponent
      {...props}
      source={fallbackSource ?? props.source}
      ref={ref}
      onError={handleError}
    />
  );
});

export * from 'expo-image';

export { WrappedImage as Image };

export default WrappedImage;