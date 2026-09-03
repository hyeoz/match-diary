import React, { PropsWithChildren } from 'react';
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cardShadow, colors, font, radius, spacing } from './theme';

export function Screen({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <SafeAreaView style={[styles.screen, style]}>{children}</SafeAreaView>;
}

export function AppHeader({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: (event: GestureResponderEvent) => void;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {onBack ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
            onPress={onBack}
            style={styles.headerButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={[styles.headerSide, styles.headerAction]}>{action}</View>
    </View>
  );
}

export function PaperCard({
  children,
  style,
  taped = false,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; taped?: boolean }>) {
  return (
    <View style={[styles.paper, cardShadow, style]}>
      {taped ? <View style={styles.tape} /> : null}
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        style,
      ]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({
  label,
  onPress,
  destructive = false,
  style,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.secondaryButton,
        destructive && styles.destructiveButton,
        style,
      ]}>
      <Text
        style={[
          styles.secondaryButtonText,
          destructive && styles.destructiveText,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Field({
  label,
  style,
  ...props
}: TextInputProps & { label: string; style?: StyleProp<TextStyle> }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor="#A7A39A"
        {...props}
        style={[styles.field, props.multiline && styles.multiline, style]}
      />
    </View>
  );
}

export function MenuRow({
  icon,
  label,
  caption,
  onPress,
  destructive = false,
}: {
  icon: string;
  label: string;
  caption?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const content = (
    <>
      <View style={styles.menuIcon}>
        <Text style={styles.menuIconText}>{icon}</Text>
      </View>
      <View style={styles.menuCopy}>
        <Text style={[styles.menuLabel, destructive && styles.destructiveText]}>
          {label}
        </Text>
        {caption ? <Text style={styles.menuCaption}>{caption}</Text> : null}
      </View>
      {onPress ? <Text style={styles.menuArrow}>›</Text> : null}
    </>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress} style={styles.menuRow}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={styles.menuRow}>{content}</View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  headerSide: {
    width: 52,
  },
  headerAction: {
    alignItems: 'flex-end',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: colors.ink,
    fontSize: 40,
    lineHeight: 40,
    fontWeight: '300',
  },
  headerTitle: {
    ...font('bold'),
    flex: 1,
    color: colors.ink,
    textAlign: 'center',
    fontSize: 20,
  },
  paper: {
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.paper,
  },
  tape: {
    position: 'absolute',
    top: -9,
    left: '42%',
    width: 64,
    height: 19,
    zIndex: 2,
    opacity: 0.82,
    backgroundColor: '#E9D4A7',
    transform: [{ rotate: '-1deg' }],
  },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.green,
    paddingHorizontal: spacing.xl,
  },
  primaryButtonDisabled: {
    opacity: 0.42,
  },
  primaryButtonText: {
    ...font('bold'),
    color: colors.white,
    fontSize: 18,
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.paperStrong,
    paddingHorizontal: spacing.xl,
  },
  destructiveButton: {
    borderColor: colors.danger,
    backgroundColor: colors.paper,
  },
  secondaryButtonText: {
    ...font('bold'),
    color: colors.ink,
    fontSize: 16,
  },
  destructiveText: {
    color: colors.danger,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...font('bold'),
    color: colors.ink,
    fontSize: 14,
  },
  field: {
    ...font('medium'),
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.paperStrong,
    color: colors.ink,
    fontSize: 15,
    paddingHorizontal: spacing.md,
  },
  multiline: {
    minHeight: 112,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  menuRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    paddingHorizontal: spacing.lg,
  },
  menuIcon: {
    width: 32,
    alignItems: 'flex-start',
  },
  menuIconText: {
    fontSize: 20,
  },
  menuCopy: {
    flex: 1,
  },
  menuLabel: {
    ...font('bold'),
    color: colors.ink,
    fontSize: 15,
  },
  menuCaption: {
    ...font('light'),
    marginTop: 2,
    color: colors.muted,
    fontSize: 11,
  },
  menuArrow: {
    color: colors.muted,
    fontSize: 26,
  },
});
