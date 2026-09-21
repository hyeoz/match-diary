# React Native 0.77 registers this class and its nested JNI delegates while
# initializing InspectorFlags, even with developer support disabled. Native
# lookups are invisible to R8; preserve only this bridge, not all React classes.
-keep class com.facebook.react.devsupport.CxxInspectorPackagerConnection** { *; }
