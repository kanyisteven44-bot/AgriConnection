import React, { useRef, useEffect, forwardRef } from "react";
import { Platform, Keyboard, KeyboardAvoidingView } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const KeyboardAvoidingAnimatedView = forwardRef((props, ref) => {
  const {
    children,
    behavior = Platform.OS === "ios" ? "padding" : "height",
    keyboardVerticalOffset = 0,
    style,
    contentContainerStyle,
    enabled = true,
    onLayout,
    ...leftoverProps
  } = props;

  const animatedViewRef = useRef(null);
  const initialHeightRef = useRef(0);
  const bottomHeight = useSharedValue(0);

  useEffect(() => {
    if (!enabled) return;

    const onKeyboardShow = (event) => {
      const { duration, endCoordinates } = event;
      const animatedView = animatedViewRef.current;
      if (!animatedView) return;

      const keyboardY = endCoordinates.screenY - keyboardVerticalOffset;
      const height = Math.max(
        animatedView.y + animatedView.height - keyboardY,
        0,
      );

      bottomHeight.value = withTiming(height, {
        duration: duration > 10 ? duration : 300,
      });
    };

    const onKeyboardHide = () => {
      bottomHeight.value = withTiming(0, { duration: 300 });
    };

    // Support both iOS (Will) and Android (Did) keyboard events
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub?.remove();
      hideSub?.remove();
    };
  }, [keyboardVerticalOffset, enabled, bottomHeight]);

  const animatedStyle = useAnimatedStyle(() => {
    if (behavior === "height") {
      return {
        height:
          initialHeightRef.current > 0
            ? initialHeightRef.current - bottomHeight.value
            : undefined,
        flex: bottomHeight.value > 0 ? 0 : 1,
      };
    }
    if (behavior === "padding") {
      return { paddingBottom: bottomHeight.value };
    }
    return {};
  });

  const positionAnimatedStyle = useAnimatedStyle(() => ({
    bottom: bottomHeight.value,
  }));

  const handleLayout = (event) => {
    const layout = event.nativeEvent.layout;
    animatedViewRef.current = layout;
    if (!initialHeightRef.current) {
      initialHeightRef.current = layout.height;
    }
    onLayout?.(event);
  };

  // Web: use built-in KeyboardAvoidingView
  if (Platform.OS === "web") {
    return (
      <KeyboardAvoidingView
        behavior={behavior}
        style={style}
        contentContainerStyle={contentContainerStyle}
        {...leftoverProps}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }

  return (
    <Animated.View
      ref={ref}
      style={[style, animatedStyle]}
      onLayout={handleLayout}
      {...leftoverProps}
    >
      {behavior === "position" ? (
        <Animated.View style={[contentContainerStyle, positionAnimatedStyle]}>
          {children}
        </Animated.View>
      ) : (
        children
      )}
    </Animated.View>
  );
});

KeyboardAvoidingAnimatedView.displayName = "KeyboardAvoidingAnimatedView";

export default KeyboardAvoidingAnimatedView;
